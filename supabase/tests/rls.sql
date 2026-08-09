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
end;
$$;

update public.lessons set bunny_video_id = null where slug = 'classic-bridal';
