-- =====================================================================
-- Marie Ragaie Beauty Academy — 23: is the content actually ready?
--
-- "How many lessons are still missing a video" is the question the
-- dashboard most needs to answer before a launch, and it is the one
-- question the dashboard cannot ask directly: `lessons.bunny_video_id`
-- has no SELECT privilege for any client role, and Postgres requires that
-- privilege for a WHERE clause too, so even `count(*) where
-- bunny_video_id is null` is refused.
--
-- A function that counts without returning is the whole answer. The admin
-- learns that three lessons are unplayable; nobody learns which video id
-- belongs to which lesson.
-- =====================================================================

create or replace function public.get_content_readiness()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when public.is_admin() then coalesce(
    (select jsonb_agg(row order by row ->> 'title_ar')
     from (
       select jsonb_build_object(
                'course_id',  c.id,
                'slug',       c.slug,
                'title_ar',   c.title_ar,
                'status',     c.status,
                'lessons',    count(l.id),
                'with_video', count(l.bunny_video_id),
                'with_quiz',  count(q.id),
                'previews',   count(*) filter (where l.is_free_preview)
              ) as row
       from public.courses c
       left join public.lessons l on l.course_id = c.id
       left join public.quizzes q on q.lesson_id = l.id and q.is_active
       group by c.id, c.slug, c.title_ar, c.status
     ) rows),
    '[]'::jsonb)
  end;
$$;

revoke all on function public.get_content_readiness() from public, anon;
grant execute on function public.get_content_readiness() to authenticated;
