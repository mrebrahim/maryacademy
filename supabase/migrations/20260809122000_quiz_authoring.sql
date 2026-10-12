-- =====================================================================
-- Marie Ragaie Beauty Academy — 21: authoring an exam
--
-- The academy writes exams from the dashboard, so the dashboard needs two
-- things the student side deliberately cannot have: to read the answer
-- key, and to write questions and options as one unit.
--
-- Both go through functions rather than direct table access, for the same
-- reason the rest of this schema does:
--
--   * Reading. `quiz_options.is_correct` has no SELECT privilege for any
--     client role (migration 20), and that is not a rule I want to put a
--     hole in for admins — a hole is a hole, and it would be reachable by
--     anyone who got hold of an admin session's token. A SECURITY DEFINER
--     function that checks `is_admin()` itself hands back the key without
--     the privilege ever existing on the table.
--
--   * Writing. An exam is only valid as a whole: a question with no
--     options, or with two correct answers, is not a question. Writing it
--     row by row from a form means every intermediate state is live and
--     gradable. `set_lesson_quiz` takes the entire exam, validates it,
--     and replaces what was there in one transaction.
--
-- Replacing rather than patching also means the editor needs no stable
-- ids for questions, which is what makes "drag the third option to the
-- top" a one-line change in the browser instead of a diffing problem.
-- Attempts are keyed on the quiz, not on its questions, so a rewrite
-- keeps the history. The stored `answers` then point at option ids that
-- no longer exist, which is correct: they are a record of what someone
-- picked that day, not a live foreign key.
-- =====================================================================

-- ---------------------------------------------------------------------
-- get_quiz_for_admin — the exam including the answer key
-- ---------------------------------------------------------------------
create or replace function public.get_quiz_for_admin(p_lesson_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quiz jsonb;
begin
  if not public.is_admin() then
    raise exception 'not_authorised';
  end if;

  select jsonb_build_object(
           'id', q.id,
           'title_ar', q.title_ar,
           'description_ar', q.description_ar,
           'pass_percent', q.pass_percent,
           'is_active', q.is_active,
           'questions', coalesce((
             select jsonb_agg(
                      jsonb_build_object(
                        'body_ar', qq.body_ar,
                        'options', coalesce((
                          select jsonb_agg(
                                   jsonb_build_object(
                                     'body_ar', qo.body_ar,
                                     'is_correct', qo.is_correct
                                   )
                                   order by qo.sort_order
                                 )
                          from public.quiz_options qo
                          where qo.question_id = qq.id
                        ), '[]'::jsonb)
                      )
                      order by qq.sort_order
                    )
             from public.quiz_questions qq
             where qq.quiz_id = q.id
           ), '[]'::jsonb)
         )
    into v_quiz
  from public.quizzes q
  where q.lesson_id = p_lesson_id;

  return v_quiz; -- null when the lesson has no exam yet
end;
$$;

revoke all on function public.get_quiz_for_admin(uuid) from public, anon;
grant execute on function public.get_quiz_for_admin(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- set_lesson_quiz — write the whole exam, or none of it
--
-- `p_quiz` is
--   { title_ar, description_ar, pass_percent, is_active,
--     questions: [ { body_ar, options: [ { body_ar, is_correct } ] } ] }
--
-- Every rule here is also a constraint on the tables where it can be one.
-- The ones that cannot — "exactly one correct option", "between two and
-- six options" — are the reason this function exists.
-- ---------------------------------------------------------------------
create or replace function public.set_lesson_quiz(p_lesson_id uuid, p_quiz jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quiz_id  uuid;
  v_title    text := nullif(btrim(p_quiz ->> 'title_ar'), '');
  v_desc     text := nullif(btrim(p_quiz ->> 'description_ar'), '');
  v_pass     int  := coalesce((p_quiz ->> 'pass_percent')::int, 60);
  v_active   boolean := coalesce((p_quiz ->> 'is_active')::boolean, true);
  v_questions jsonb := coalesce(p_quiz -> 'questions', '[]'::jsonb);
  v_question jsonb;
  v_options  jsonb;
  v_option   jsonb;
  v_q_id     uuid;
  v_q_index  int := 0;
  v_o_index  int;
  v_correct  int;
begin
  if not public.is_admin() then
    raise exception 'not_authorised';
  end if;

  if not exists (select 1 from public.lessons where id = p_lesson_id) then
    raise exception 'lesson_not_found';
  end if;

  if v_title is null then
    raise exception 'title_required';
  end if;

  if v_pass < 1 or v_pass > 100 then
    raise exception 'pass_percent_out_of_range';
  end if;

  if jsonb_typeof(v_questions) <> 'array' or jsonb_array_length(v_questions) = 0 then
    raise exception 'no_questions';
  end if;

  -- Validate everything before touching a row, so a rejected exam leaves
  -- the published one exactly as it was.
  for v_question in select * from jsonb_array_elements(v_questions) loop
    v_q_index := v_q_index + 1;

    if length(btrim(coalesce(v_question ->> 'body_ar', ''))) < 3 then
      raise exception 'question_body_too_short:%', v_q_index;
    end if;

    v_options := coalesce(v_question -> 'options', '[]'::jsonb);

    if jsonb_typeof(v_options) <> 'array'
       or jsonb_array_length(v_options) < 2
       or jsonb_array_length(v_options) > 6 then
      raise exception 'option_count:%', v_q_index;
    end if;

    v_correct := 0;
    for v_option in select * from jsonb_array_elements(v_options) loop
      if length(btrim(coalesce(v_option ->> 'body_ar', ''))) = 0 then
        raise exception 'option_body_empty:%', v_q_index;
      end if;
      if coalesce((v_option ->> 'is_correct')::boolean, false) then
        v_correct := v_correct + 1;
      end if;
    end loop;

    -- One right answer per question. Zero makes the question unpassable;
    -- more than one makes the score depend on which of them was picked.
    if v_correct <> 1 then
      raise exception 'needs_one_correct_answer:%', v_q_index;
    end if;
  end loop;

  insert into public.quizzes (lesson_id, title_ar, description_ar, pass_percent, is_active)
  values (p_lesson_id, v_title, v_desc, v_pass, v_active)
  on conflict (lesson_id) do update
    set title_ar       = excluded.title_ar,
        description_ar = excluded.description_ar,
        pass_percent   = excluded.pass_percent,
        is_active      = excluded.is_active
  returning id into v_quiz_id;

  -- Cascades to the options.
  delete from public.quiz_questions where quiz_id = v_quiz_id;

  v_q_index := 0;
  for v_question in select * from jsonb_array_elements(v_questions) loop
    insert into public.quiz_questions (quiz_id, body_ar, sort_order)
    values (v_quiz_id, btrim(v_question ->> 'body_ar'), v_q_index)
    returning id into v_q_id;

    v_o_index := 0;
    for v_option in select * from jsonb_array_elements(v_question -> 'options') loop
      insert into public.quiz_options (question_id, body_ar, is_correct, sort_order)
      values (
        v_q_id,
        btrim(v_option ->> 'body_ar'),
        coalesce((v_option ->> 'is_correct')::boolean, false),
        v_o_index
      );
      v_o_index := v_o_index + 1;
    end loop;

    v_q_index := v_q_index + 1;
  end loop;

  return v_quiz_id;
end;
$$;

revoke all on function public.set_lesson_quiz(uuid, jsonb) from public, anon;
grant execute on function public.set_lesson_quiz(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- delete_lesson_quiz
--
-- Separate from `set_lesson_quiz`, which refuses an exam with no
-- questions: deleting an exam and failing to save one should not be the
-- same gesture, because one of them throws away the attempts with it.
-- ---------------------------------------------------------------------
create or replace function public.delete_lesson_quiz(p_lesson_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_authorised';
  end if;

  delete from public.quizzes where lesson_id = p_lesson_id;
end;
$$;

revoke all on function public.delete_lesson_quiz(uuid) from public, anon;
grant execute on function public.delete_lesson_quiz(uuid) to authenticated;
