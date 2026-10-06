-- =====================================================================
-- Grant a test student access to a course — DEVELOPMENT ONLY
--
-- Run this in the Supabase SQL editor to open a course for an account
-- without taking money for it. It is the way to walk the student
-- experience end to end: the player, progress, the next-lesson control,
-- the certificate at 100%.
--
-- It is NOT a migration. It lives here rather than in supabase/migrations
-- so it never runs automatically against production, because what it does
-- — hand out a paid course — is exactly what must never happen by
-- accident.
--
-- Before running it, the account has to exist: sign in once at /login with
-- the address below so Supabase creates the auth user and the profile
-- trigger fires. This script will tell you if you have not.
-- =====================================================================

do $$
declare
  -- ---- edit these two ----
  v_email  text := 'test-student@example.com';
  v_slug   text := 'hairstyling-master-class';
  -- ------------------------
  v_user   uuid;
  v_course uuid;
  v_order  uuid;
begin
  select id into v_user from auth.users where lower(email) = lower(btrim(v_email));
  if v_user is null then
    raise exception
      'No account for %. Sign in once at /login with that address first, then re-run.',
      v_email;
  end if;

  select id into v_course from public.courses where slug = v_slug;
  if v_course is null then
    raise exception 'No course with slug %', v_slug;
  end if;

  -- A paid order of zero, so the enrolment has the same shape a real one
  -- does and nothing downstream has to special-case a comped student.
  insert into public.orders
    (user_id, course_id, amount, discount_amount, provider, status, paid_at,
     contact_email, provider_txn_id)
  values
    (v_user, v_course, 0, 0, 'manual', 'paid', now(), lower(btrim(v_email)), 'TEST-ACCESS')
  returning id into v_order;

  insert into public.enrollments (user_id, course_id, order_id, status)
  values (v_user, v_course, v_order, 'active')
  on conflict (user_id, course_id) do update
    set status = 'active', order_id = excluded.order_id;

  raise notice 'Access granted: % -> %', v_email, v_slug;
end $$;

-- ---------------------------------------------------------------------
-- To take it away again:
--
--   delete from public.enrollments e
--    using auth.users u, public.courses c
--    where e.user_id = u.id and e.course_id = c.id
--      and lower(u.email) = lower('test-student@example.com')
--      and c.slug = 'hairstyling-master-class';
--
--   delete from public.orders
--    where provider_txn_id = 'TEST-ACCESS'
--      and lower(contact_email) = lower('test-student@example.com');
-- ---------------------------------------------------------------------
