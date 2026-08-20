-- =====================================================================
-- Marie Ragaie Beauty Academy — 12: community
--
-- Two rules shape the whole design:
--
--   1. Only an admin creates a group. A group carries an audience and,
--      optionally, the courses it belongs to — so the academy can run one
--      space for the students of a given course and a separate one for
--      people who have not bought yet.
--   2. Anyone may submit a question, a discussion or a useful resource,
--      but nothing is visible until an admin approves it. Moderation is
--      the default state, not an afterthought: rows are born 'pending'
--      and the insert policy refuses any other status.
-- =====================================================================

create type public.community_audience   as enum ('enrolled', 'not_enrolled', 'everyone');
create type public.community_post_kind  as enum ('question', 'discussion', 'resource');
create type public.community_post_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------
-- Groups
-- ---------------------------------------------------------------------
create table public.community_groups (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name_ar        text not null,
  description_ar text,
  audience       public.community_audience not null,
  -- A general group is not tied to any course. Kept as an explicit flag
  -- rather than inferred from "no courses attached", so an admin who has
  -- not picked courses yet cannot accidentally publish a general group.
  is_general     boolean not null default false,
  is_active      boolean not null default true,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger community_groups_updated_at
  before update on public.community_groups
  for each row execute function public.set_updated_at();

-- Which courses a group covers. Empty for a general group.
create table public.community_group_courses (
  group_id  uuid not null references public.community_groups (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  primary key (group_id, course_id)
);

create index community_group_courses_course_idx on public.community_group_courses (course_id);

-- ---------------------------------------------------------------------
-- Posts
-- ---------------------------------------------------------------------
create table public.community_posts (
  id               uuid primary key default gen_random_uuid(),
  group_id         uuid not null references public.community_groups (id) on delete cascade,
  author_id        uuid not null references public.profiles (id) on delete cascade,
  kind             public.community_post_kind not null,
  title_ar         text not null,
  body_ar          text,
  -- Resources are usually a link. Constrained so a "resource" without one
  -- cannot be filed, which is the whole value of the category.
  link_url         text,
  status           public.community_post_status not null default 'pending',
  moderated_by     uuid references public.profiles (id) on delete set null,
  moderated_at     timestamptz,
  moderation_note  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint community_posts_resource_needs_link
    check (kind <> 'resource' or (link_url is not null and length(link_url) > 0)),
  constraint community_posts_title_length check (length(btrim(title_ar)) between 3 and 200)
);

create index community_posts_group_idx  on public.community_posts (group_id, status, created_at desc);
create index community_posts_status_idx on public.community_posts (status, created_at);
create index community_posts_author_idx on public.community_posts (author_id);

create trigger community_posts_updated_at
  before update on public.community_posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- can_see_group — the membership rule, in one place
--
-- SECURITY DEFINER because it reads enrollments across users; STABLE so
-- the planner can call it once per group rather than once per row.
-- ---------------------------------------------------------------------
create or replace function public.can_see_group(p_group_id uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_audience   public.community_audience;
  v_general    boolean;
  v_active     boolean;
  v_has_course boolean;
begin
  if auth.uid() is null then
    return false;
  end if;

  select g.audience, g.is_general, g.is_active
    into v_audience, v_general, v_active
  from public.community_groups g
  where g.id = p_group_id;

  if not found or not v_active then
    return false;
  end if;

  if v_audience = 'everyone' then
    return true;
  end if;

  -- Does the caller hold an active enrolment that this group cares about?
  -- A general group cares about any course at all.
  select exists (
    select 1
    from public.enrollments e
    where e.user_id = auth.uid()
      and e.status = 'active'
      and (
        v_general
        or e.course_id in (
          select gc.course_id
          from public.community_group_courses gc
          where gc.group_id = p_group_id
        )
      )
  ) into v_has_course;

  return case v_audience
    when 'enrolled'     then v_has_course
    when 'not_enrolled' then not v_has_course
    else false
  end;
end;
$$;

revoke all on function public.can_see_group(uuid) from public, anon;
grant execute on function public.can_see_group(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- RLS
--
-- Policies are written per role rather than `to anon, authenticated`:
-- anon has no EXECUTE on is_admin() or can_see_group(), and a policy that
-- calls a function the role cannot execute fails the whole query instead
-- of simply denying the row. That mistake cost a day earlier in this
-- project — see 20260809120500_split_public_read_policies.sql.
-- ---------------------------------------------------------------------
alter table public.community_groups        enable row level security;
alter table public.community_group_courses enable row level security;
alter table public.community_posts         enable row level security;

-- Groups: members read the ones they qualify for; admins do everything.
create policy community_groups_read_member on public.community_groups
  for select to authenticated
  using (public.can_see_group(id));

create policy community_groups_admin_all on public.community_groups
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Group ↔ course links follow the group's visibility.
create policy community_group_courses_read on public.community_group_courses
  for select to authenticated
  using (public.can_see_group(group_id));

create policy community_group_courses_admin_all on public.community_group_courses
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Posts: approved ones are visible to the group; authors always see their
-- own, including while pending, so a submission does not appear to vanish.
create policy community_posts_read_approved on public.community_posts
  for select to authenticated
  using (status = 'approved' and public.can_see_group(group_id));

create policy community_posts_read_own on public.community_posts
  for select to authenticated
  using (author_id = auth.uid());

-- Submission. The status check is what makes moderation mandatory: a
-- crafted request cannot insert an already-approved row.
create policy community_posts_insert_own on public.community_posts
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and status = 'pending'
    and public.can_see_group(group_id)
  );

create policy community_posts_admin_all on public.community_posts
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- moderate_post — approve or reject, stamping who did it
-- ---------------------------------------------------------------------
create or replace function public.moderate_post(
  p_post_id uuid,
  p_approve boolean,
  p_note    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;

  update public.community_posts
  set status          = case when p_approve then 'approved' else 'rejected' end::public.community_post_status,
      moderated_by    = auth.uid(),
      moderated_at    = now(),
      moderation_note = p_note
  where id = p_post_id;

  if not found then
    raise exception 'post_not_found';
  end if;
end;
$$;

revoke all on function public.moderate_post(uuid, boolean, text) from public, anon;
grant execute on function public.moderate_post(uuid, boolean, text) to authenticated;
