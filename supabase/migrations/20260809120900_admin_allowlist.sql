-- =====================================================================
-- Marie Ragaie Beauty Academy — 10: admin allowlist
--
-- Bootstrapping the first admin is a chicken-and-egg problem: the admin
-- panel needs `profiles.role = 'admin'`, but a profile only exists after
-- the person has signed in at least once, and by then nobody with admin
-- rights exists to promote them.
--
-- The allowlist resolves it. An email listed here is granted the admin
-- role by `handle_new_user()` the first time that address signs in.
-- Adding a row is a database-side action (service role / SQL editor),
-- never something the application can do, so a signed-in student cannot
-- promote themselves by any request the app can make.
-- =====================================================================

create table if not exists public.admin_allowlist (
  email      text primary key,
  note       text,
  created_at timestamptz not null default now()
);

-- Locked down completely: no policies, so anon and authenticated read
-- and write nothing. Only SECURITY DEFINER functions and the service
-- role ever touch it.
alter table public.admin_allowlist enable row level security;
revoke all on table public.admin_allowlist from anon, authenticated;

-- Emails are matched case-insensitively; store them folded so the
-- lookup is a plain primary-key hit.
create or replace function public.normalize_allowlist_email()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

revoke all on function public.normalize_allowlist_email() from public, anon, authenticated;

drop trigger if exists admin_allowlist_normalize on public.admin_allowlist;
create trigger admin_allowlist_normalize
  before insert or update on public.admin_allowlist
  for each row execute function public.normalize_allowlist_email();

-- ---------------------------------------------------------------------
-- handle_new_user() now consults the allowlist
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
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Seed + backfill
--
-- The seed is the academy owner. The backfill covers the case where the
-- address already signed in before this migration ran — without it, the
-- allowlist would only take effect for accounts created afterwards.
-- ---------------------------------------------------------------------
insert into public.admin_allowlist (email, note)
values ('maryragaay211@gmail.com', 'Academy owner — Marie Ragaie')
on conflict (email) do nothing;

update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id
  and p.role <> 'admin'
  and lower(trim(u.email)) in (select email from public.admin_allowlist);
