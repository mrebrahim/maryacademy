-- =====================================================================
-- Marie Ragaie Beauty Academy — 25: "does this lesson have a video?"
--
-- /admin/content shows a "no video yet" marker per lesson, and was
-- reading `lessons.bunny_video_id` to decide. That read has been refused
-- since the column was locked down, and PostgREST answers a refused
-- column by returning no rows at all — so the symptom was not a missing
-- marker but an empty lesson list on every course.
--
-- My first fix made it dramatically worse, and the mistake is worth
-- recording because it is the same trap as migration 20 wearing a
-- different hat. I added `(bunny_video_id is not null) as has_video` to
-- `lessons_public`. The view is `security_invoker`, which means the
-- CALLER's privileges are checked against every column the view touches
-- — including ones that only appear inside an expression and never reach
-- the output. Neither `anon` nor `authenticated` may read that column, so
-- the whole view became unreadable to everyone: the course page, the
-- landing curriculum, the player and "my courses" all went blank at once.
-- The public pages degrade quietly by design, so nothing turned red; the
-- academy saw "0 lessons" next to each part and the site kept selling.
--
-- The rule to remember: a `security_invoker` view can never reference a
-- column its readers cannot read, not even in a boolean. A protected
-- column needs a SECURITY DEFINER function, which is what this is — it
-- hands back a map of lesson id to yes/no, checks `is_admin()` itself,
-- and returns null to everyone else.
-- =====================================================================

-- Restores the view to exactly the columns it carried before, in case a
-- database was migrated while the broken version was live.
drop view if exists public.lessons_public;

create view public.lessons_public
with (security_invoker = true)
as select
  id,
  module_id,
  course_id,
  title_ar,
  slug,
  description_ar,
  duration_seconds,
  sort_order,
  is_free_preview
from public.lessons;

grant select on public.lessons_public to anon, authenticated;

-- ---------------------------------------------------------------------
-- get_lesson_video_flags — lesson id -> has a video, for admins
--
-- A yes/no cannot be played, which is the whole point: the dashboard
-- learns which lessons are unplayable without anyone learning which video
-- belongs to which lesson.
-- ---------------------------------------------------------------------
create or replace function public.get_lesson_video_flags(p_course_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when public.is_admin() then coalesce(
    (select jsonb_object_agg(l.id::text, l.bunny_video_id is not null)
       from public.lessons l
      where l.course_id = p_course_id),
    '{}'::jsonb)
  end;
$$;

revoke all on function public.get_lesson_video_flags(uuid) from public, anon;
grant execute on function public.get_lesson_video_flags(uuid) to authenticated;
