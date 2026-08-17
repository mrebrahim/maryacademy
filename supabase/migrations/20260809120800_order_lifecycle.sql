-- =====================================================================
-- Marie Ragaie Beauty Academy — 09: order lifecycle (InstaPay)
--
-- InstaPay has no merchant checkout API, so settlement is operator
-- confirmed: the student transfers, submits the reference, an admin
-- confirms, access opens.
--
-- Both steps are SECURITY DEFINER functions rather than service-role
-- writes. That keeps `orders` and `enrollments` closed to direct client
-- writes (PRD §5.2) while removing the need for the service-role key in the
-- application at all — one less catastrophic secret to leak. Price and
-- discount are computed here, from the database, so a tampered client
-- payload cannot change what is owed (PRD §6.1 step 4).
-- =====================================================================

create or replace function public.create_pending_order(
  p_course_id     uuid,
  p_coupon_code   text default null,
  p_reference     text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user      uuid := auth.uid();
  v_price     int;
  v_coupon    public.coupons%rowtype;
  v_discount  int := 0;
  v_validation jsonb;
  v_order_id  uuid;
begin
  if v_user is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select price_egp into v_price
  from public.courses
  where id = p_course_id and status = 'published';

  if v_price is null then
    raise exception 'course_not_found' using errcode = 'P0002';
  end if;

  -- A course with no price set must never be sellable for zero.
  if v_price <= 0 then
    raise exception 'course_not_priced' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.enrollments
    where user_id = v_user and course_id = p_course_id and status = 'active'
  ) then
    raise exception 'already_enrolled' using errcode = 'P0001';
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    v_validation := public.validate_coupon(p_coupon_code, p_course_id);
    if (v_validation ->> 'valid')::boolean then
      v_discount := (v_validation ->> 'discount_amount')::int;
      select * into v_coupon from public.coupons where code = upper(trim(p_coupon_code));
    end if;
  end if;

  -- Re-submitting while an order is still pending updates that order rather
  -- than stacking duplicates an admin then has to reconcile by hand.
  select id into v_order_id
  from public.orders
  where user_id = v_user and course_id = p_course_id and status = 'pending'
  limit 1;

  if v_order_id is not null then
    update public.orders
    set amount = v_price - v_discount,
        discount_amount = v_discount,
        coupon_id = v_coupon.id,
        provider_txn_id = coalesce(nullif(trim(p_reference), ''), provider_txn_id)
    where id = v_order_id;
    return v_order_id;
  end if;

  insert into public.orders (
    user_id, course_id, amount, currency, coupon_id, discount_amount,
    provider, provider_txn_id, status
  )
  values (
    v_user, p_course_id, v_price - v_discount, 'EGP', v_coupon.id, v_discount,
    'instapay', nullif(trim(p_reference), ''), 'pending'
  )
  returning id into v_order_id;

  return v_order_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Admin confirmation: money seen -> access granted.
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

  insert into public.enrollments (user_id, course_id, order_id, status)
  values (v_order.user_id, v_order.course_id, v_order.id, 'active')
  on conflict (user_id, course_id) do update
    set status = 'active', order_id = excluded.order_id;

  if v_order.coupon_id is not null then
    update public.coupons
    set redemption_count = redemption_count + 1
    where id = v_order.coupon_id;
  end if;

  insert into public.audit_log (actor_id, action, entity, entity_id, diff)
  values (auth.uid(), 'confirm_order', 'orders', p_order_id,
          jsonb_build_object('amount', v_order.amount, 'user_id', v_order.user_id));
end;
$$;

create or replace function public.reject_order(p_order_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  update public.orders set status = 'failed' where id = p_order_id and status = 'pending';

  insert into public.audit_log (actor_id, action, entity, entity_id, diff)
  values (auth.uid(), 'reject_order', 'orders', p_order_id,
          jsonb_build_object('reason', p_reason));
end;
$$;

revoke all on function public.create_pending_order(uuid, text, text) from public, anon;
revoke all on function public.confirm_order(uuid)                    from public, anon;
revoke all on function public.reject_order(uuid, text)               from public, anon;
grant execute on function public.create_pending_order(uuid, text, text) to authenticated;
grant execute on function public.confirm_order(uuid)                    to authenticated;
grant execute on function public.reject_order(uuid, text)               to authenticated;
