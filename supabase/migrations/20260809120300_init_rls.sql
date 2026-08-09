-- =====================================================================
-- Marie Ragaie Beauty Academy — 04: views + RLS
-- PRD §5.2. Default deny everywhere; every table has RLS enabled.
--
-- Layering used here:
--   1. RLS policies decide WHICH ROWS a role may see.
--   2. Column-level GRANTs decide WHICH COLUMNS. `lessons.bunny_video_id`
--      is revoked from anon AND authenticated outright — only the service
--      role (server-side video token endpoint, PRD §6.2) can ever read it.
--   3. `lessons_public` is the view marketing pages query. It is
--      security_invoker, so it inherits the caller's RLS.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enable RLS on everything
-- ---------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.courses         enable row level security;
alter table public.modules         enable row level security;
alter table public.lessons         enable row level security;
alter table public.coupons         enable row level security;
alter table public.orders          enable row level security;
alter table public.enrollments     enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.testimonials    enable row level security;
alter table public.posts           enable row level security;
alter table public.leads           enable row level security;
alter table public.audit_log       enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- `role` is not self-serve: a student must not be able to promote herself.
revoke update on public.profiles from authenticated;
grant update (full_name, phone, avatar_url, whatsapp_opt_in, country, last_seen_at)
  on public.profiles to authenticated;

-- ---------------------------------------------------------------------
-- categories — public read, admin write
-- ---------------------------------------------------------------------
create policy categories_select_public on public.categories
  for select to anon, authenticated using (true);

create policy categories_admin_write on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- courses — published only for the public
-- ---------------------------------------------------------------------
create policy courses_select_published on public.courses
  for select to anon, authenticated
  using (status = 'published' or public.is_admin());

create policy courses_admin_write on public.courses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- modules — visible when the parent course is published (curriculum
-- accordion on the sales page) or when the caller is enrolled.
-- ---------------------------------------------------------------------
create policy modules_select_public on public.modules
  for select to anon, authenticated
  using (
    exists (select 1 from public.courses c
            where c.id = modules.course_id and c.status = 'published')
    or public.has_course_access(modules.course_id)
    or public.is_admin()
  );

create policy modules_admin_write on public.modules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- lessons — rows follow the same rule as modules; the protected columns
-- are handled by the grants below, not by the policy.
-- ---------------------------------------------------------------------
create policy lessons_select_public on public.lessons
  for select to anon, authenticated
  using (
    exists (select 1 from public.courses c
            where c.id = lessons.course_id and c.status = 'published')
    or public.has_course_access(lessons.course_id)
    or public.is_admin()
  );

create policy lessons_admin_write on public.lessons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Column-level lockdown: `bunny_video_id` is unreadable by any client role.
revoke select on public.lessons from anon, authenticated;
grant select (
  id, module_id, course_id, title_ar, slug, description_ar,
  duration_seconds, sort_order, is_free_preview, attachments,
  created_at, updated_at
) on public.lessons to authenticated;
grant select (
  id, module_id, course_id, title_ar, slug, description_ar,
  duration_seconds, sort_order, is_free_preview,
  created_at, updated_at
) on public.lessons to anon;

-- ---------------------------------------------------------------------
-- lessons_public — the view marketing pages read. No bunny_video_id,
-- no attachments, regardless of caller.
-- ---------------------------------------------------------------------
create view public.lessons_public
with (security_invoker = on) as
select
  l.id,
  l.module_id,
  l.course_id,
  l.title_ar,
  l.slug,
  l.description_ar,
  l.duration_seconds,
  l.sort_order,
  l.is_free_preview
from public.lessons l;

grant select on public.lessons_public to anon, authenticated;

-- ---------------------------------------------------------------------
-- coupons — never readable by a client. Discounts are resolved through
-- public.validate_coupon() only.
-- ---------------------------------------------------------------------
create policy coupons_admin_all on public.coupons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke all on public.coupons from anon;

-- ---------------------------------------------------------------------
-- orders / enrollments — read-own only. Writes are service-role only
-- (webhook-verified fulfilment, PRD §6.1); deliberately no INSERT or
-- UPDATE policy exists for anon/authenticated.
-- ---------------------------------------------------------------------
create policy orders_select_own on public.orders
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

revoke insert, update, delete on public.orders from anon, authenticated;

create policy enrollments_select_own on public.enrollments
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

revoke insert, update, delete on public.enrollments from anon, authenticated;

-- ---------------------------------------------------------------------
-- lesson_progress — a student may write only her own progress rows.
-- ---------------------------------------------------------------------
create policy lesson_progress_select_own on public.lesson_progress
  for select to authenticated
  using (
    exists (select 1 from public.enrollments e
            where e.id = lesson_progress.enrollment_id and e.user_id = auth.uid())
    or public.is_admin()
  );

create policy lesson_progress_insert_own on public.lesson_progress
  for insert to authenticated
  with check (
    exists (select 1 from public.enrollments e
            where e.id = lesson_progress.enrollment_id
              and e.user_id = auth.uid()
              and e.status = 'active')
  );

create policy lesson_progress_update_own on public.lesson_progress
  for update to authenticated
  using (
    exists (select 1 from public.enrollments e
            where e.id = lesson_progress.enrollment_id
              and e.user_id = auth.uid()
              and e.status = 'active')
  )
  with check (
    exists (select 1 from public.enrollments e
            where e.id = lesson_progress.enrollment_id
              and e.user_id = auth.uid()
              and e.status = 'active')
  );

revoke delete on public.lesson_progress from anon, authenticated;

-- ---------------------------------------------------------------------
-- testimonials — published only. PRD §9.2: `source` travels with every
-- row so the UI can label it honestly.
-- ---------------------------------------------------------------------
create policy testimonials_select_published on public.testimonials
  for select to anon, authenticated
  using (is_published or public.is_admin());

create policy testimonials_admin_write on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------
create policy posts_select_published on public.posts
  for select to anon, authenticated
  using (status = 'published' or public.is_admin());

create policy posts_admin_write on public.posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- leads — public insert (rate-limited at the app layer), admin read.
-- ---------------------------------------------------------------------
create policy leads_insert_public on public.leads
  for insert to anon, authenticated with check (true);

create policy leads_select_admin on public.leads
  for select to authenticated using (public.is_admin());

revoke update, delete on public.leads from anon, authenticated;

-- ---------------------------------------------------------------------
-- audit_log — admin reads, service role writes.
-- ---------------------------------------------------------------------
create policy audit_log_select_admin on public.audit_log
  for select to authenticated using (public.is_admin());

revoke insert, update, delete on public.audit_log from anon, authenticated;
