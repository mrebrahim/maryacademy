-- =====================================================================
-- Marie Ragaie Beauty Academy — 14: guest checkout
--
-- Requiring an account before paying is the wrong order of operations for
-- paid traffic. Someone arrives from an ad, decides, taps buy — and is
-- asked to create an account first. Most do not.
--
-- So the order comes first and the account follows. A guest pays with
-- their name, phone and email; the order is recorded against those
-- details; and the account is created the first time they sign in with
-- the same address, at which point any paid order waiting for them is
-- attached and the enrolment created.
--
-- Nothing about the money changes: the price is still computed in the
-- database, the coupon is still validated there, and an admin still
-- confirms the transfer. Only the moment of account creation moves.
-- =====================================================================

-- A guest order has no profile yet.
alter table public.orders alter column user_id drop not null;

-- The address the order is claimed by. Held on the order as well as on
-- the lead, because the lead row can be edited later and this must not
-- move — it is what decides who gets the course.
alter table public.orders add column if not exists contact_email text;
alter table public.orders add column if not exists contact_name  text;
alter table public.orders add column if not exists contact_phone text;

create index if not exists orders_contact_email_idx
  on public.orders (lower(contact_email)) where contact_email is not null;

-- An order must identify its buyer one way or the other.
alter table public.orders drop constraint if exists orders_has_a_buyer;
alter table public.orders add constraint orders_has_a_buyer
  check (user_id is not null or contact_email is not null);

-- ---------------------------------------------------------------------
-- create_guest_order
--
-- The guest twin of create_pending_order. The price is read from the
-- course row and the discount from validate_coupon, exactly as before —
-- nothing the browser sends can influence what is owed.
-- ---------------------------------------------------------------------
create or replace function public.create_guest_order(
  p_course_id   uuid,
  p_name        text,
  p_phone       text,
  p_email       text,
  p_reference   text default null,
  p_coupon_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price     int;
  v_discount  int := 0;
  v_coupon    uuid;
  v_email     text := nullif(btrim(lower(p_email)), '');
  v_order     uuid;
  v_lead      uuid;
  v_coupon_result jsonb;
begin
  if v_email is null then
    raise exception 'email_required';
  end if;

  select price_egp into v_price
  from public.courses
  where id = p_course_id and status = 'published';

  if not found or v_price is null or v_price <= 0 then
    raise exception 'course_not_priced';
  end if;

  if p_coupon_code is not null and btrim(p_coupon_code) <> '' then
    v_coupon_result := public.validate_coupon(p_coupon_code, p_course_id);
    if (v_coupon_result ->> 'valid')::boolean then
      v_discount := coalesce((v_coupon_result ->> 'discount_amount')::int, 0);
      select id into v_coupon
      from public.coupons
      where upper(code) = upper(btrim(p_coupon_code));
    end if;
  end if;

  -- Already bought and confirmed? Do not take the money twice.
  if exists (
    select 1 from public.orders o
    where o.course_id = p_course_id
      and o.status = 'paid'
      and lower(o.contact_email) = v_email
  ) then
    raise exception 'already_enrolled';
  end if;

  v_lead := public.capture_checkout_lead(
    p_course_id, p_name, p_phone, p_email, 'started'
  );

  -- Reuse a pending order rather than stacking duplicates when someone
  -- submits the form twice.
  select id into v_order
  from public.orders
  where course_id = p_course_id
    and status = 'pending'
    and lower(contact_email) = v_email
  limit 1;

  if v_order is not null then
    update public.orders
    set amount          = greatest(v_price - v_discount, 0),
        discount_amount = v_discount,
        coupon_id       = v_coupon,
        provider_txn_id = coalesce(nullif(btrim(p_reference), ''), provider_txn_id),
        contact_name    = coalesce(nullif(btrim(p_name), ''), contact_name),
        contact_phone   = coalesce(nullif(btrim(p_phone), ''), contact_phone),
        lead_id         = coalesce(v_lead, lead_id)
    where id = v_order;
    return v_order;
  end if;

  insert into public.orders (
    user_id, course_id, amount, discount_amount, coupon_id, provider,
    provider_txn_id, status, contact_name, contact_phone, contact_email, lead_id
  )
  values (
    auth.uid(), p_course_id, greatest(v_price - v_discount, 0), v_discount, v_coupon,
    'instapay', nullif(btrim(p_reference), ''), 'pending',
    nullif(btrim(p_name), ''), nullif(btrim(p_phone), ''), v_email, v_lead
  )
  returning id into v_order;

  return v_order;
end;
$$;

revoke all on function public.create_guest_order(uuid, text, text, text, text, text) from public;
-- anon included by design: this is the whole point of guest checkout.
grant execute on function public.create_guest_order(uuid, text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- confirm_order — now tolerates an order with no account yet
--
-- Same body as before, except the enrolment is only created when there is
-- somebody to enrol. A guest order is marked paid and waits; the
-- enrolment is created the moment they sign in and claim it.
-- ---------------------------------------------------------------------
create or replace function public.confirm_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  if not public.is_admin() then
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  -- Lock the row: two admins clicking confirm at the same moment must not
  -- both pass the status check and double-count a coupon redemption.
  select * into v_order from public.orders where id = p_order_id for update;

  if v_order.id is null then
    raise exception 'order_not_found' using errcode = 'P0002';
  end if;

  if v_order.status = 'paid' then
    return; -- idempotent
  end if;

  update public.orders
  set status = 'paid', paid_at = now()
  where id = p_order_id;

  if v_order.user_id is not null then
    insert into public.enrollments (user_id, course_id, order_id, status)
    values (v_order.user_id, v_order.course_id, v_order.id, 'active')
    on conflict (user_id, course_id) do update
      set status = 'active', order_id = excluded.order_id;
  end if;

  if v_order.contact_email is not null then
    update public.checkout_leads
    set status = 'paid'
    where lower(email) = lower(v_order.contact_email);
  end if;

  if v_order.coupon_id is not null then
    update public.coupons
    set redemption_count = redemption_count + 1
    where id = v_order.coupon_id;
  end if;

  insert into public.audit_log (actor_id, action, entity, entity_id, diff)
  values (auth.uid(), 'confirm_order', 'orders', p_order_id,
          jsonb_build_object('amount', v_order.amount, 'user_id', v_order.user_id,
                             'guest', v_order.user_id is null));
end;
$$;

-- ---------------------------------------------------------------------
-- claim_guest_orders — attach paid guest orders to a new account
-- ---------------------------------------------------------------------
create or replace function public.claim_guest_orders(p_user_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := nullif(btrim(lower(p_email)), '');
  r       record;
begin
  if v_email is null then
    return;
  end if;

  for r in
    select id, course_id, status
    from public.orders
    where user_id is null
      and lower(contact_email) = v_email
  loop
    update public.orders set user_id = p_user_id where id = r.id;

    -- Only a confirmed payment opens the course.
    if r.status = 'paid' then
      insert into public.enrollments (user_id, course_id, order_id, status)
      values (p_user_id, r.course_id, r.id, 'active')
      on conflict (user_id, course_id) do update
        set status = 'active', order_id = excluded.order_id;
    end if;
  end loop;
end;
$$;

revoke all on function public.claim_guest_orders(uuid, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- handle_new_user — claim on first sign-in
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role := 'student';
begin
  if exists (
    select 1 from public.admin_allowlist a
    where a.email = lower(trim(new.email))
  ) then
    v_role := 'admin';
  end if;

  insert into public.profiles (id, full_name, phone, whatsapp_opt_in, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce((new.raw_user_meta_data ->> 'whatsapp_opt_in')::boolean, false),
    v_role
  )
  on conflict (id) do nothing;

  -- Anything they already paid for, before they had an account.
  perform public.claim_guest_orders(new.id, new.email);

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
