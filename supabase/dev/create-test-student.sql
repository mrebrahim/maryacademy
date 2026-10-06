-- =====================================================================
-- Create a test student and put them on a course — DEVELOPMENT ONLY
--
-- Creating an auth user straight in SQL has one trap, and it is silent:
-- GoTrue (Supabase Auth) reads several token columns as plain strings,
-- not nullable ones. Leave them NULL and every later call for that address
-- fails with
--
--   error finding user: sql: Scan error on column index 3,
--   name "confirmation_token": converting NULL to string is unsupported
--
-- which surfaces in the app as "couldn't send the code" and in the logs as
-- a 500 on /otp. The row looks perfectly fine in the table editor. Hence
-- the empty strings below — they are not decoration.
--
-- Prefer signing in through /login when you can; this is for when you need
-- the account to exist before the first sign-in.
-- =====================================================================

do $$
declare
  -- ---- edit these ----
  v_email text := 'test-student@example.com';
  v_name  text := 'طالب تجريبي';
  v_slug  text := 'hairstyling-master-class';
  -- --------------------
  v_user   uuid;
  v_course uuid;
  v_order  uuid;
begin
  select id into v_course from public.courses where slug = v_slug;
  if v_course is null then
    raise exception 'No course with slug %', v_slug;
  end if;

  select id into v_user from auth.users where lower(email) = lower(btrim(v_email));

  if v_user is null then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      -- Empty strings, never NULL. See the header.
      confirmation_token, recovery_token, email_change_token_new,
      email_change_token_current, email_change, phone_change,
      phone_change_token, reauthentication_token
    )
    values (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
      'authenticated', 'authenticated', lower(btrim(v_email)), '',
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_name),
      '', '', '', '', '', '', '', ''
    )
    returning id into v_user;
  end if;

  -- A paid order of zero, so the enrolment has the same shape a real one
  -- does and nothing downstream has to special-case a comped student.
  insert into public.orders
    (user_id, course_id, amount, discount_amount, provider, status, paid_at,
     contact_email, contact_name, provider_txn_id)
  values
    (v_user, v_course, 0, 0, 'manual', 'paid', now(),
     lower(btrim(v_email)), v_name, 'TEST-ACCESS')
  returning id into v_order;

  insert into public.enrollments (user_id, course_id, order_id, status)
  values (v_user, v_course, v_order, 'active')
  on conflict (user_id, course_id) do update
    set status = 'active', order_id = excluded.order_id;

  raise notice 'Test student ready: % on %', v_email, v_slug;
end $$;

-- ---------------------------------------------------------------------
-- If an account ever stops being able to request a code, this is the
-- first thing to check — and the repair is safe to run on every row.
--
--   update auth.users set
--     confirmation_token         = coalesce(confirmation_token, ''),
--     recovery_token             = coalesce(recovery_token, ''),
--     email_change_token_new     = coalesce(email_change_token_new, ''),
--     email_change_token_current = coalesce(email_change_token_current, ''),
--     email_change               = coalesce(email_change, ''),
--     phone_change               = coalesce(phone_change, ''),
--     phone_change_token         = coalesce(phone_change_token, ''),
--     reauthentication_token     = coalesce(reauthentication_token, '');
-- ---------------------------------------------------------------------
