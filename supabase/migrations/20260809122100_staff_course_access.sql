-- =====================================================================
-- Marie Ragaie Beauty Academy — 22: the academy can watch its own course
--
-- `has_course_access` asked one question — is there an active enrolment —
-- so the only way for Marie to watch her own lessons was to enrol
-- herself. That works, and it is wrong: an enrolment is a sale. One for
-- the owner would sit in the enrolments table forever, counted as a
-- student on the dashboard and in every number taken from it.
--
-- An admin now has access by role, with no row created. The reading is
-- "staff may open the content they publish", which is also what the
-- attachments and quiz checks inherit, since all three go through this
-- function.
--
-- This deliberately does NOT make an admin *enrolled*. Progress,
-- certificates and "my courses" still follow the enrolments table, so
-- reviewing a lesson leaves no trace in a student's record, and the
-- player tells the admin which of the two they are.
-- =====================================================================

create or replace function public.has_course_access(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.enrollments e
    where e.course_id = p_course_id
      and e.user_id = auth.uid()
      and e.status = 'active'
      and (e.access_expires_at is null or e.access_expires_at > now())
  );
$$;
