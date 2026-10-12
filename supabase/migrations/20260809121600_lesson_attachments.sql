-- =====================================================================
-- Marie Ragaie Beauty Academy — 17: lesson attachments
--
-- `lessons.attachments` has existed since the first migration and nothing
-- has ever read or written it. It holds the files that come with a lesson
-- — a PDF of the steps, a product list — as a list of
--   { "title": "...", "url": "..." }
--
-- The column is not added to `lessons_public`. Attachments are part of
-- what the course costs, so they go through the same gate the video does:
-- a function that checks enrolment, rather than a view anyone can read.
-- =====================================================================

create or replace function public.get_lesson_attachments(p_lesson_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_attachments jsonb;
  v_course      uuid;
  v_preview     boolean;
begin
  select l.attachments, l.course_id, l.is_free_preview
    into v_attachments, v_course, v_preview
  from public.lessons l
  where l.id = p_lesson_id;

  if not found then
    raise exception 'lesson_not_found';
  end if;

  if not v_preview and not public.has_course_access(v_course) then
    raise exception 'no_access';
  end if;

  return coalesce(v_attachments, '[]'::jsonb);
end;
$$;

revoke all on function public.get_lesson_attachments(uuid) from public;
grant execute on function public.get_lesson_attachments(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- set_lesson_attachments — admin only
--
-- Takes the whole list rather than appending one at a time, so the admin
-- screen can reorder and remove in a single write and two tabs open at
-- once cannot interleave into a half-list.
--
-- The shape is validated here because a malformed row would render as an
-- empty link in the player, which looks like a broken course rather than
-- like bad data.
-- ---------------------------------------------------------------------
create or replace function public.set_lesson_attachments(
  p_lesson_id   uuid,
  p_attachments jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
begin
  if not public.is_admin() then
    raise exception 'not_authorised' using errcode = '42501';
  end if;

  if jsonb_typeof(p_attachments) <> 'array' then
    raise exception 'attachments_must_be_array';
  end if;

  for item in select * from jsonb_array_elements(p_attachments) loop
    if coalesce(btrim(item ->> 'title'), '') = '' then
      raise exception 'attachment_title_required';
    end if;
    if coalesce(btrim(item ->> 'url'), '') !~ '^https?://' then
      raise exception 'attachment_url_invalid';
    end if;
  end loop;

  update public.lessons
  set attachments = p_attachments
  where id = p_lesson_id;

  if not found then
    raise exception 'lesson_not_found';
  end if;
end;
$$;

revoke all on function public.set_lesson_attachments(uuid, jsonb) from public, anon;
grant execute on function public.set_lesson_attachments(uuid, jsonb) to authenticated;
