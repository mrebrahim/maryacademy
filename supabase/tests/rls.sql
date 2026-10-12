-- =====================================================================
-- RLS proof — PRD §5.2 ("write an automated test proving that an
-- anonymous client and a logged-in-but-not-enrolled client cannot read
-- lessons.bunny_video_id").
--
-- Run against a seeded database:
--   psql "$SUPABASE_DB_URL" -f supabase/tests/rls.sql
-- or paste into the Supabase SQL editor. It raises an exception on the
-- first failure and leaves no data behind.
--
-- The over-the-wire counterpart (same assertions through PostgREST with
-- the anon key) is `npm run test:rls` — scripts/verify-rls.ts.
-- =====================================================================

update public.lessons set bunny_video_id = 'LEAK-SENTINEL-0001'
where slug = 'classic-bridal';

do $$
declare
  leaked text;
  n int;
begin
  -- 1. anonymous must not reach bunny_video_id
  set local role anon;
  begin
    select bunny_video_id into leaked from public.lessons where slug = 'classic-bridal';
    reset role;
    raise exception 'FAIL: anon read bunny_video_id (%)', leaked;
  exception when insufficient_privilege then
    raise notice 'PASS: anon denied lessons.bunny_video_id';
  end;
  reset role;

  -- 2. ...but anonymous must still reach lesson metadata (sales page)
  set local role anon;
  select count(*) into n from public.lessons_public where slug = 'classic-bridal';
  reset role;
  if n <> 1 then raise exception 'FAIL: anon cannot read lessons_public (% rows)', n; end if;
  raise notice 'PASS: anon reads lessons_public metadata';

  -- 3. anonymous sees the published course
  set local role anon;
  select count(*) into n from public.courses where slug = 'hairstyling-master-class';
  reset role;
  if n <> 1 then raise exception 'FAIL: anon cannot read published course'; end if;
  raise notice 'PASS: anon reads published course';

  -- 4. signed in but not enrolled: still no bunny_video_id
  set local role authenticated;
  begin
    select bunny_video_id into leaked from public.lessons where slug = 'classic-bridal';
    reset role;
    raise exception 'FAIL: authenticated read bunny_video_id (%)', leaked;
  exception when insufficient_privilege then
    raise notice 'PASS: authenticated denied lessons.bunny_video_id';
  end;
  reset role;

  -- 5. unpublished testimonials stay invisible (PRD §9.2)
  set local role anon;
  select count(*) into n from public.testimonials;
  reset role;
  if n <> 0 then raise exception 'FAIL: anon saw % unpublished testimonials', n; end if;
  raise notice 'PASS: anon sees 0 unpublished testimonials';

  -- 6. the public view carries no protected columns
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'lessons_public'
               and column_name in ('bunny_video_id', 'attachments')) then
    raise exception 'FAIL: lessons_public exposes a protected column';
  end if;
  raise notice 'PASS: lessons_public carries no protected columns';

  -- ---------------------------------------------------------------
  -- The exam answer key (migrations 19–21)
  --
  -- Privilege checks rather than reads, deliberately: migration 19's
  -- `revoke select (is_correct)` was a silent no-op against the
  -- table-level grant Supabase creates by default, and a read-based test
  -- on a database with no quiz rows would have passed anyway.
  -- ---------------------------------------------------------------

  -- 7. is_correct is unreadable by every client role
  if exists (
    select 1 from information_schema.column_privileges
    where table_schema = 'public' and table_name = 'quiz_options'
      and column_name = 'is_correct' and privilege_type = 'SELECT'
      and grantee in ('anon', 'authenticated')
  ) then
    raise exception 'FAIL: a client role can SELECT quiz_options.is_correct';
  end if;
  raise notice 'PASS: quiz_options.is_correct is unreadable by anon and authenticated';

  -- 8. ...while the columns a student needs stayed readable, or the exam
  --    would not render at all
  select count(*) into n from information_schema.column_privileges
  where table_schema = 'public' and table_name = 'quiz_options'
    and privilege_type = 'SELECT' and grantee = 'authenticated'
    and column_name in ('id', 'question_id', 'body_ar', 'sort_order');
  if n <> 4 then
    raise exception 'FAIL: authenticated lost SELECT on the safe quiz_options columns (% of 4)', n;
  end if;
  raise notice 'PASS: the answer-free quiz_options columns stay readable';

  -- 9. neither public view carries the key
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name in ('quiz_questions_public', 'quiz_options_public')
      and column_name = 'is_correct'
  ) then
    raise exception 'FAIL: a public quiz view exposes is_correct';
  end if;
  raise notice 'PASS: the public quiz views carry no answer key';

  -- 10. a student cannot write their own passing attempt
  if exists (
    select 1 from information_schema.table_privileges
    where table_schema = 'public' and table_name = 'quiz_attempts'
      and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
      and grantee in ('anon', 'authenticated')
  ) then
    raise exception 'FAIL: a client role can write quiz_attempts directly';
  end if;
  raise notice 'PASS: quiz_attempts is written only by submit_quiz_attempt';
end;
$$;

update public.lessons set bunny_video_id = null where slug = 'classic-bridal';
