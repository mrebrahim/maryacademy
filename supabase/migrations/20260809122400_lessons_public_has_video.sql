-- =====================================================================
-- Marie Ragaie Beauty Academy — 25: "does this lesson have a video?"
--
-- /admin/content was selecting `bunny_video_id` from `lessons` to show a
-- "no video yet" marker on each row. That read has been refused since the
-- column was locked down — and a refused SELECT in PostgREST returns no
-- rows at all, so the symptom was not a missing marker: the whole lesson
-- list was empty on every course. Nothing in the UI said why.
--
-- The page only ever needed a yes or no, and a yes/no cannot be played.
-- So the view carries the boolean, the column stays unreadable, and the
-- page asks the view like every other lesson read in the app.
--
-- The view is `security_invoker`, so the caller's RLS still applies — it
-- is not a way around the lessons policies, only around the column grant.
-- =====================================================================

-- `create or replace` rather than drop-and-create: a new column may be
-- appended to a view in place, and replacing keeps the grants and every
-- dependency instead of rebuilding them.
create or replace view public.lessons_public
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
  is_free_preview,
  (bunny_video_id is not null) as has_video
from public.lessons;

grant select on public.lessons_public to anon, authenticated;
