-- =====================================================================
-- Marie Ragaie Beauty Academy — 13: checkout leads
--
-- The biggest leak in the funnel is the person who types their email on
-- the checkout page and then leaves. Nothing recorded them, so nobody
-- could follow up. This table captures contact details the moment they
-- are entered, before any payment is attempted.
--
-- Writes go through a SECURITY DEFINER function rather than a table
-- INSERT grant. Checkout runs before sign-in, so the caller may be anon —
-- and an anon INSERT grant on a table holding names, phone numbers and
-- emails is an open write endpoint. The function is the only way in, and
-- it decides what a row may contain.
-- =====================================================================

create type public.checkout_lead_status as enum ('abandoned', 'started', 'paid');

create table public.checkout_leads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles (id) on delete set null,
  course_id     uuid references public.courses (id) on delete set null,
  name          text,
  phone         text,
  email         text,
  status        public.checkout_lead_status not null default 'abandoned',
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- One live lead per person per course, so repeated onBlur events update
  -- a single row instead of filling the table with near-duplicates.
  constraint checkout_leads_identity_unique unique nulls not distinct (email, phone, course_id)
);

create index checkout_leads_status_idx  on public.checkout_leads (status, created_at desc);
create index checkout_leads_course_idx  on public.checkout_leads (course_id);

create trigger checkout_leads_updated_at
  before update on public.checkout_leads
  for each row execute function public.set_updated_at();

-- Link an order back to the lead it came from, so "abandoned → paid" is
-- answerable without matching on email strings.
alter table public.orders
  add column if not exists lead_id uuid references public.checkout_leads (id) on delete set null;

-- ---------------------------------------------------------------------
-- RLS — admins read, nobody else touches it directly
-- ---------------------------------------------------------------------
alter table public.checkout_leads enable row level security;
revoke all on table public.checkout_leads from anon, authenticated;

create policy checkout_leads_admin_read on public.checkout_leads
  for select to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- capture_checkout_lead — the only write path
--
-- Returns the lead id so the client can pass it back when the order is
-- created. Status only ever moves forward: an 'abandoned' write arriving
-- late (a blur event after the order was placed) must not undo 'paid'.
-- ---------------------------------------------------------------------
create or replace function public.capture_checkout_lead(
  p_course_id    uuid,
  p_name         text default null,
  p_phone        text default null,
  p_email        text default null,
  p_status       public.checkout_lead_status default 'abandoned',
  p_utm_source   text default null,
  p_utm_medium   text default null,
  p_utm_campaign text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := nullif(btrim(lower(p_email)), '');
  v_phone text := nullif(btrim(p_phone), '');
  v_id    uuid;
begin
  -- A lead with neither an email nor a phone is not a lead.
  if v_email is null and v_phone is null then
    return null;
  end if;

  insert into public.checkout_leads as l
    (user_id, course_id, name, phone, email, status, utm_source, utm_medium, utm_campaign)
  values
    (auth.uid(), p_course_id, nullif(btrim(p_name), ''), v_phone, v_email, p_status,
     nullif(btrim(p_utm_source), ''), nullif(btrim(p_utm_medium), ''), nullif(btrim(p_utm_campaign), ''))
  on conflict (email, phone, course_id) do update
    set name    = coalesce(nullif(btrim(excluded.name), ''), l.name),
        user_id = coalesce(excluded.user_id, l.user_id),
        -- Never regress: paid outranks started outranks abandoned.
        status  = case
                    when l.status = 'paid' then l.status
                    when l.status = 'started' and excluded.status = 'abandoned' then l.status
                    else excluded.status
                  end,
        utm_source   = coalesce(l.utm_source, excluded.utm_source),
        utm_medium   = coalesce(l.utm_medium, excluded.utm_medium),
        utm_campaign = coalesce(l.utm_campaign, excluded.utm_campaign)
  returning l.id into v_id;

  return v_id;
end;
$$;

revoke all on function public.capture_checkout_lead(uuid, text, text, text, public.checkout_lead_status, text, text, text) from public;
-- anon included on purpose: the fields are filled before sign-in.
grant execute on function public.capture_checkout_lead(uuid, text, text, text, public.checkout_lead_status, text, text, text) to anon, authenticated;
