-- =====================================================================
-- Marie Ragaie Beauty Academy — 20: actually hide the quiz answer key
--
-- Migration 19 ended with:
--
--   revoke select (is_correct) on public.quiz_options from anon, authenticated;
--
-- That line did nothing, and I only found out because I checked
-- `information_schema.column_privileges` afterwards: `is_correct` was
-- still SELECT-able by both roles.
--
-- The reason is worth writing down, because the same trap is waiting for
-- every future table here. A column-level REVOKE can only remove a
-- column-level GRANT; it cannot carve a hole out of a table-level one.
-- Supabase's default privileges hand `anon` and `authenticated` SELECT on
-- the whole table the moment it is created, so after the revoke above the
-- table grant was still standing and still covered every column.
--
-- The fix is the shape `lessons.bunny_video_id` already uses: drop the
-- table-level grant entirely, then grant back the columns that are safe,
-- one by one. Anything added to `quiz_options` later is therefore private
-- until someone names it here — which is the right default for a table
-- whose whole purpose is to hold answers.
--
-- Writes are granted back to `authenticated` because RLS, not the grant,
-- is the gate: `quiz_options_admin_all` requires `is_admin()`. A student
-- holds the privilege and is refused by the policy.
-- =====================================================================

revoke select, insert, update, delete on public.quiz_options from anon, authenticated;

-- The question text and ordering — everything a student needs to answer,
-- and nothing that says which answer is right.
grant select (id, question_id, body_ar, sort_order) on public.quiz_options to anon, authenticated;

-- Admin editing goes through here; `quiz_options_admin_all` decides who.
grant insert, update, delete on public.quiz_options to authenticated;

-- Attempts are written only by `submit_quiz_attempt`, which computes the
-- score itself. RLS already stops a direct INSERT — migration 19 wrote no
-- INSERT policy, and no policy means no rows — so this is a second lock on
-- the same door, in case a later migration adds a policy to this table
-- without remembering that awarding yourself a pass must stay impossible.
revoke insert, update, delete on public.quiz_attempts from anon, authenticated;
