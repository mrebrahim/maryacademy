-- =====================================================================
-- Marie Ragaie Beauty Academy — 26: two prices, two wallets
--
-- Two changes the academy asked for, both of which end at the same
-- question: who decides what is owed.
--
-- 1. The buyer now declares where she is before a price is shown, because
--    buyers abroad were paying the Egyptian price and sending the
--    transfer as though they were in Egypt. The declaration is a claim,
--    not a check — nothing can stop someone choosing Egypt — so it is
--    stored on the order rather than trusted: a transfer that arrives
--    from elsewhere is then visibly a mismatch at the moment an admin
--    reviews it, which is where the control has always really been.
--
--    The price still comes from the course row. The browser sends which
--    band was claimed, never an amount.
--
-- 2. Vodafone Cash joins InstaPay. Both are manual, both end in a
--    screenshot on WhatsApp; the enum just needs to be able to say which
--    one the money came through, or the orders screen cannot tell an
--    admin where to go looking for it.
-- =====================================================================

-- Run this statement on its own and let it commit before the rest.
-- Postgres will not let a new enum value be USED in the same transaction
-- that adds it, and pasting the whole file into one editor tab is exactly
-- that transaction.
alter type public.payment_provider add value if not exists 'vodafone_cash';

alter table public.orders
  add column if not exists is_international boolean not null default false;

comment on column public.orders.is_international is
  'What the buyer declared at checkout, which decided the price. A claim, not a verified fact.';

-- ---------------------------------------------------------------------
-- create_guest_order, now with a declared region and a chosen wallet
--
-- New arguments are appended with defaults so the old four-argument call
-- keeps working while a deploy rolls over.
--
-- `p_international` picks the band; it never carries an amount. The price
-- is still read from the course row here, because a browser that can name
-- its own price will eventually name zero.
-- ---------------------------------------------------------------------
create or replace function public.create_guest_order(
  p_course_id     uuid,
  p_name          text,
  p_phone         text,
  p_email         text,
  p_reference     text default null,
  p_coupon_code   text default null,
  p_international boolean default false,
  p_provider      text default 'instapay'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price     int;
  v_intl      int;
  v_discount  int := 0;
  v_coupon    uuid;
  v_email     text := nullif(btrim(lower(p_email)), '');
  v_order     uuid;
  v_lead      uuid;
  v_coupon_result jsonb;
  v_provider  public.payment_provider;
begin
  if v_email is null then
    raise exception 'email_required';
  end if;

  -- Only the manual wallets may be chosen from a form. Anything else is
  -- either a card flow that reports its own result, or a typo.
  v_provider := case lower(coalesce(p_provider, ''))
                  when 'vodafone_cash' then 'vodafone_cash'::public.payment_provider
                  else 'instapay'::public.payment_provider
                end;

  select price_egp, price_egp_intl into v_price, v_intl
  from public.courses
  where id = p_course_id and status = 'published';

  if not found then
    raise exception 'course_not_priced';
  end if;

  if p_international then
    -- A course with no international price is not sold abroad; refusing
    -- is better than quietly charging the local one.
    if coalesce(v_intl, 0) <= 0 then
      raise exception 'not_sold_internationally';
    end if;
    v_price := v_intl;
  end if;

  if v_price is null or v_price <= 0 then
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

  select id into v_order
  from public.orders
  where course_id = p_course_id
    and status = 'pending'
    and lower(contact_email) = v_email
  limit 1;

  if v_order is not null then
    update public.orders
    set amount           = greatest(v_price - v_discount, 0),
        discount_amount  = v_discount,
        coupon_id        = v_coupon,
        provider         = v_provider,
        is_international = p_international,
        provider_txn_id  = coalesce(nullif(btrim(p_reference), ''), provider_txn_id),
        contact_name     = coalesce(nullif(btrim(p_name), ''), contact_name),
        contact_phone    = coalesce(nullif(btrim(p_phone), ''), contact_phone),
        lead_id          = coalesce(v_lead, lead_id)
    where id = v_order;
    return v_order;
  end if;

  insert into public.orders (
    user_id, course_id, amount, discount_amount, coupon_id, provider,
    provider_txn_id, status, contact_name, contact_phone, contact_email,
    lead_id, is_international
  )
  values (
    auth.uid(), p_course_id, greatest(v_price - v_discount, 0), v_discount, v_coupon,
    v_provider, nullif(btrim(p_reference), ''), 'pending',
    nullif(btrim(p_name), ''), nullif(btrim(p_phone), ''), v_email, v_lead,
    p_international
  )
  returning id into v_order;

  return v_order;
end;
$$;

revoke all on function public.create_guest_order(uuid, text, text, text, text, text, boolean, text)
  from public;
grant execute on function public.create_guest_order(uuid, text, text, text, text, text, boolean, text)
  to anon, authenticated;
