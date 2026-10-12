-- =====================================================================
-- Marie Ragaie Beauty Academy — 19: lesson quizzes
--
-- An exam after each lesson. One quiz per lesson at most.
--
-- The whole design turns on one thing: **a student must never be able to
-- read which option is correct.** A quiz whose answers are in the page
-- source is not an exam, it is a formality — and it would be, because the
-- obvious implementation hands the options to the browser to render.
--
-- So:
--   * `quiz_options.is_correct` has SELECT revoked from anon and
--     authenticated, the same treatment `lessons.bunny_video_id` gets.
--   * Students read questions through `quiz_questions_public` and
--     `quiz_options_public`, views that simply do not carry the column.
--   * Grading happens in `submit_quiz_attempt`, server-side, from the
--     stored answers. The browser sends choices, never a score.
-- =====================================================================

create table public.quizzes (
  id            uuid primary key default gen_random_uuid(),
  lesson_id     uuid not null unique references public.lessons (id) on delete cascade,
  title_ar      text not null default 'امتحان الدرس',
  description_ar text,
  -- Out of 100. 60 is a pass by default; the academy can change it.
  pass_percent  int not null default 60,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint quizzes_pass_percent_range check (pass_percent between 1 and 100)
);

create trigger quizzes_updated_at
  before update on public.quizzes
  for each row execute function public.set_updated_at();

create table public.quiz_questions (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid not null references public.quizzes (id) on delete cascade,
  body_ar     text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  constraint quiz_questions_body_length check (length(btrim(body_ar)) between 3 and 1000)
);

create index quiz_questions_quiz_idx on public.quiz_questions (quiz_id, sort_order);

create table public.quiz_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  body_ar     text not null,
  is_correct  boolean not null default false,
  sort_order  int not null default 0,
  constraint quiz_options_body_length check (length(btrim(body_ar)) between 1 and 500)
);

create index quiz_options_question_idx on public.quiz_options (question_id, sort_order);

-- ---------------------------------------------------------------------
-- Attempts
-- ---------------------------------------------------------------------
create table public.quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  quiz_id      uuid not null references public.quizzes (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  score_percent int not null,
  passed       boolean not null,
  answers      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  constraint quiz_attempts_score_range check (score_percent between 0 and 100)
);

create index quiz_attempts_user_idx on public.quiz_attempts (user_id, quiz_id, created_at desc);

-- ---------------------------------------------------------------------
-- Views without the answer key
-- ---------------------------------------------------------------------
create view public.quiz_questions_public
with (security_invoker = true)
as select id, quiz_id, body_ar, sort_order from public.quiz_questions;

create view public.quiz_options_public
with (security_invoker = true)
as select id, question_id, body_ar, sort_order from public.quiz_options;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.quizzes        enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options   enable row level security;
alter table public.quiz_attempts  enable row level security;

-- A quiz is readable by someone who can reach its lesson.
create policy quizzes_read on public.quizzes
  for select to authenticated
  using (
    is_active and exists (
      select 1 from public.lessons l
      where l.id = quizzes.lesson_id
        and (l.is_free_preview or public.has_course_access(l.course_id))
    )
  );

create policy quizzes_admin_all on public.quizzes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy quiz_questions_read on public.quiz_questions
  for select to authenticated
  using (exists (select 1 from public.quizzes q where q.id = quiz_questions.quiz_id));

create policy quiz_questions_admin_all on public.quiz_questions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy quiz_options_read on public.quiz_options
  for select to authenticated
  using (
    exists (
      select 1 from public.quiz_questions qq
      where qq.id = quiz_options.question_id
    )
  );

create policy quiz_options_admin_all on public.quiz_options
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy quiz_attempts_read_own on public.quiz_attempts
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Attempts are written only by submit_quiz_attempt. No insert policy: a
-- student who could insert one could award themselves a pass.

-- ---------------------------------------------------------------------
-- The answer key never leaves the database
-- ---------------------------------------------------------------------
revoke select (is_correct) on public.quiz_options from anon, authenticated;

grant select on public.quiz_questions_public to anon, authenticated;
grant select on public.quiz_options_public   to anon, authenticated;

-- ---------------------------------------------------------------------
-- submit_quiz_attempt
--
-- `p_answers` maps question id -> chosen option id. The score is computed
-- here from the stored key; nothing the browser sends can influence it
-- beyond which options were chosen.
-- ---------------------------------------------------------------------
create or replace function public.submit_quiz_attempt(
  p_quiz_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson   uuid;
  v_course   uuid;
  v_preview  boolean;
  v_total    int;
  v_correct  int := 0;
  v_percent  int;
  v_pass     int;
  v_passed   boolean;
  r          record;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select q.lesson_id, q.pass_percent into v_lesson, v_pass
  from public.quizzes q
  where q.id = p_quiz_id and q.is_active;

  if not found then
    raise exception 'quiz_not_found';
  end if;

  select l.course_id, l.is_free_preview into v_course, v_preview
  from public.lessons l where l.id = v_lesson;

  if not v_preview and not public.has_course_access(v_course) then
    raise exception 'no_access';
  end if;

  select count(*) into v_total from public.quiz_questions where quiz_id = p_quiz_id;

  if v_total = 0 then
    raise exception 'quiz_has_no_questions';
  end if;

  -- One point per question whose chosen option is the correct one. A
  -- question left unanswered simply scores nothing.
  for r in
    select qq.id as question_id,
           (p_answers ->> qq.id::text)::uuid as chosen
    from public.quiz_questions qq
    where qq.quiz_id = p_quiz_id
  loop
    if r.chosen is not null and exists (
      select 1 from public.quiz_options qo
      where qo.id = r.chosen
        and qo.question_id = r.question_id
        and qo.is_correct
    ) then
      v_correct := v_correct + 1;
    end if;
  end loop;

  v_percent := round((v_correct::numeric / v_total) * 100);
  v_passed  := v_percent >= v_pass;

  insert into public.quiz_attempts (quiz_id, user_id, score_percent, passed, answers)
  values (p_quiz_id, auth.uid(), v_percent, v_passed, p_answers);

  return jsonb_build_object(
    'score_percent', v_percent,
    'correct', v_correct,
    'total', v_total,
    'passed', v_passed,
    'pass_percent', v_pass
  );
end;
$$;

revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public, anon;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;
