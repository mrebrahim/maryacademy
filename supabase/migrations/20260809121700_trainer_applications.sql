-- =====================================================================
-- Marie Ragaie Beauty Academy — 18: trainer applications
--
-- "كن مدرس معنا". The academy is positioned as a house that gathers
-- specialists, not as one person's brand, so a way in for other trainers
-- is part of the proposition rather than an extra.
--
-- A table of its own rather than a row in `leads`: an application carries
-- a speciality, years of experience, a portfolio link and a review state,
-- and none of that belongs in a newsletter table. Mixing them would also
-- mean a marketing export quietly containing people's CVs.
-- =====================================================================

create type public.application_status as enum ('new', 'reviewing', 'accepted', 'rejected');

create table public.trainer_applications (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  phone          text not null,
  email          text not null,
  speciality_ar  text not null,
  years_experience int,
  portfolio_url  text,
  about_ar       text,
  status         public.application_status not null default 'new',
  admin_note     text,
  reviewed_by    uuid references public.profiles (id) on delete set null,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint trainer_applications_experience_sane
    check (years_experience is null or years_experience between 0 and 60)
);

create index trainer_applications_status_idx
  on public.trainer_applications (status, created_at desc);

create trigger trainer_applications_updated_at
  before update on public.trainer_applications
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RLS — admins read and review; nobody writes directly
-- ---------------------------------------------------------------------
alter table public.trainer_applications enable row level security;
revoke all on table public.trainer_applications from anon, authenticated;

create policy trainer_applications_admin_read on public.trainer_applications
  for select to authenticated using (public.is_admin());

create policy trainer_applications_admin_update on public.trainer_applications
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- submit_trainer_application — the only write path
--
-- The form is public, so the alternative is an INSERT grant to anon on a
-- table of names, phone numbers and CVs. A function instead: it decides
-- what a row may contain, and it cannot be used to set a status.
-- ---------------------------------------------------------------------
create or replace function public.submit_trainer_application(
  p_full_name        text,
  p_phone            text,
  p_email            text,
  p_speciality_ar    text,
  p_years_experience int default null,
  p_portfolio_url    text default null,
  p_about_ar         text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := nullif(btrim(lower(p_email)), '');
  v_name  text := nullif(btrim(p_full_name), '');
  v_phone text := nullif(btrim(p_phone), '');
  v_spec  text := nullif(btrim(p_speciality_ar), '');
begin
  if v_name is null or v_phone is null or v_email is null or v_spec is null then
    raise exception 'missing_required_fields';
  end if;

  -- One open application per address. Re-applying updates what is there
  -- rather than filling the queue with the same person three times.
  if exists (
    select 1 from public.trainer_applications
    where lower(email) = v_email and status in ('new', 'reviewing')
  ) then
    update public.trainer_applications
    set full_name        = v_name,
        phone            = v_phone,
        speciality_ar    = v_spec,
        years_experience = p_years_experience,
        portfolio_url    = nullif(btrim(p_portfolio_url), ''),
        about_ar         = nullif(btrim(p_about_ar), '')
    where lower(email) = v_email and status in ('new', 'reviewing');
    return;
  end if;

  insert into public.trainer_applications
    (full_name, phone, email, speciality_ar, years_experience, portfolio_url, about_ar)
  values
    (v_name, v_phone, v_email, v_spec, p_years_experience,
     nullif(btrim(p_portfolio_url), ''), nullif(btrim(p_about_ar), ''));
end;
$$;

revoke all on function public.submit_trainer_application(text, text, text, text, int, text, text)
  from public;
grant execute on function public.submit_trainer_application(text, text, text, text, int, text, text)
  to anon, authenticated;
