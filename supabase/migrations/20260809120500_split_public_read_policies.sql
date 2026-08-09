-- =====================================================================
-- Marie Ragaie Beauty Academy — 06: split public-read policies by role
--
-- The original policies were declared `to anon, authenticated` and called
-- public.is_admin(). `anon` has no EXECUTE on that function (deliberately),
-- so evaluating the policy raised "permission denied for function
-- is_admin" and logged-out visitors could read nothing at all.
--
-- Fix: anon gets a policy with the plain published-content predicate;
-- authenticated keeps the full predicate including the admin escape hatch.
-- =====================================================================

-- courses ------------------------------------------------------------
drop policy courses_select_published on public.courses;

create policy courses_select_anon on public.courses
  for select to anon using (status = 'published');

create policy courses_select_auth on public.courses
  for select to authenticated using (status = 'published' or public.is_admin());

-- modules ------------------------------------------------------------
drop policy modules_select_public on public.modules;

create policy modules_select_anon on public.modules
  for select to anon
  using (exists (select 1 from public.courses c
                 where c.id = modules.course_id and c.status = 'published'));

create policy modules_select_auth on public.modules
  for select to authenticated
  using (
    exists (select 1 from public.courses c
            where c.id = modules.course_id and c.status = 'published')
    or public.has_course_access(modules.course_id)
    or public.is_admin()
  );

-- lessons ------------------------------------------------------------
drop policy lessons_select_public on public.lessons;

create policy lessons_select_anon on public.lessons
  for select to anon
  using (exists (select 1 from public.courses c
                 where c.id = lessons.course_id and c.status = 'published'));

create policy lessons_select_auth on public.lessons
  for select to authenticated
  using (
    exists (select 1 from public.courses c
            where c.id = lessons.course_id and c.status = 'published')
    or public.has_course_access(lessons.course_id)
    or public.is_admin()
  );

-- testimonials -------------------------------------------------------
drop policy testimonials_select_published on public.testimonials;

create policy testimonials_select_anon on public.testimonials
  for select to anon using (is_published);

create policy testimonials_select_auth on public.testimonials
  for select to authenticated using (is_published or public.is_admin());

-- posts --------------------------------------------------------------
drop policy posts_select_published on public.posts;

create policy posts_select_anon on public.posts
  for select to anon using (status = 'published');

create policy posts_select_auth on public.posts
  for select to authenticated using (status = 'published' or public.is_admin());
