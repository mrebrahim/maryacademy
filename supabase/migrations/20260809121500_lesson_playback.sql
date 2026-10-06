-- =====================================================================
-- Marie Ragaie Beauty Academy — 16: lesson playback and progress
--
-- `lessons.bunny_video_id` has SELECT revoked from anon and authenticated
-- (PRD §5.2), so no client query can read it. These SECURITY DEFINER
-- functions are the only way through, and each re-checks authorization
-- itself rather than trusting the caller.
--
-- Doing it this way keeps SUPABASE_SERVICE_ROLE_KEY out of the app: a
-- service-role client could read every video id for every lesson, and one
-- mistake in a route handler would leak the whole catalogue.
-- =====================================================================

-- ---------------------------------------------------------------------
-- get_lesson_video — the video id for one lesson, if the caller may watch
--
-- Two ways in: an active enrolment, or the lesson being a free preview.
-- Previews are deliberately readable by anon, because the whole point is
-- that someone who has not signed in can watch them.
-- ---------------------------------------------------------------------
create or replace function public.get_lesson_video(p_lesson_id uuid)
returns text
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_video   text;
  v_course  uuid;
  v_preview boolean;
begin
  select l.bunny_video_id, l.course_id, l.is_free_preview
    into v_video, v_course, v_preview
  from public.lessons l
  where l.id = p_lesson_id;

  if not found then
    raise exception 'lesson_not_found';
  end if;

  if not v_preview and not public.has_course_access(v_course) then
    raise exception 'no_access';
  end if;

  return v_video;
end;
$$;

revoke all on function public.get_lesson_video(uuid) from public;
grant execute on function public.get_lesson_video(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- mark_lesson_complete — record progress against the caller's enrolment
--
-- The enrolment is looked up from auth.uid(), never passed in, so one
-- student cannot write progress onto another's row. Completing the last
-- lesson trips recalculate_enrollment_progress(), which sets the
-- enrolment to 100% and mints the certificate serial.
-- ---------------------------------------------------------------------
create or replace function public.mark_lesson_complete(
  p_lesson_id       uuid,
  p_watched_seconds integer default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course     uuid;
  v_enrollment uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select l.course_id into v_course
  from public.lessons l
  where l.id = p_lesson_id;

  if not found then
    raise exception 'lesson_not_found';
  end if;

  select e.id into v_enrollment
  from public.enrollments e
  where e.user_id = auth.uid()
    and e.course_id = v_course
    and e.status = 'active';

  if not found then
    raise exception 'not_enrolled';
  end if;

  insert into public.lesson_progress (enrollment_id, lesson_id, is_completed, completed_at, watched_seconds)
  values (v_enrollment, p_lesson_id, true, now(), coalesce(p_watched_seconds, 0))
  on conflict (enrollment_id, lesson_id) do update
    set is_completed    = true,
        completed_at    = coalesce(public.lesson_progress.completed_at, now()),
        -- Never move the watched counter backwards: a rewatch that is
        -- interrupted early would otherwise erase real progress.
        watched_seconds = greatest(
          public.lesson_progress.watched_seconds,
          coalesce(p_watched_seconds, 0)
        );
end;
$$;

revoke all on function public.mark_lesson_complete(uuid, integer) from public, anon;
grant execute on function public.mark_lesson_complete(uuid, integer) to authenticated;
