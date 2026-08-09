-- =====================================================================
-- Marie Ragaie Beauty Academy — 03: domain functions & triggers
-- PRD §5.1 (denormalized counters), §6.1 (coupons), §6.3 (progress)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Role helper. SECURITY DEFINER so RLS policies on `profiles` can call it
-- without recursing into `profiles` policies.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Does the current user hold usable access to a course?
create or replace function public.has_course_access(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.enrollments e
    where e.course_id = p_course_id
      and e.user_id = auth.uid()
      and e.status = 'active'
      and (e.access_expires_at is null or e.access_expires_at > now())
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.has_course_access(uuid) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_course_access(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- auth.users -> profiles
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, whatsapp_opt_in)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce((new.raw_user_meta_data ->> 'whatsapp_opt_in')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- courses.lesson_count / total_duration_minutes stay in sync with lessons
-- ---------------------------------------------------------------------
create or replace function public.refresh_course_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected uuid[];
  cid uuid;
begin
  affected := array_remove(
    array[ (case when tg_op <> 'INSERT' then old.course_id end),
           (case when tg_op <> 'DELETE' then new.course_id end) ],
    null
  );

  foreach cid in array affected loop
    update public.courses c
    set lesson_count = t.cnt,
        total_duration_minutes = ceil(t.secs / 60.0)
    from (
      select count(*)::int as cnt, coalesce(sum(duration_seconds), 0)::int as secs
      from public.lessons where course_id = cid
    ) t
    where c.id = cid;
  end loop;

  return null;
end;
$$;

create trigger lessons_refresh_course_totals
  after insert or update of duration_seconds, course_id or delete on public.lessons
  for each row execute function public.refresh_course_totals();

-- ---------------------------------------------------------------------
-- Certificate serial: MR-{YYYY}-{6-char base32}   (PRD §6.3)
-- ---------------------------------------------------------------------
create or replace function public.generate_certificate_serial()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';  -- RFC 4648 base32
  candidate text;
  i int;
begin
  loop
    candidate := '';
    for i in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * 32)::int, 1);
    end loop;
    candidate := 'MR-' || to_char(now(), 'YYYY') || '-' || candidate;
    exit when not exists (
      select 1 from public.enrollments where certificate_serial = candidate
    );
  end loop;
  return candidate;
end;
$$;

-- ---------------------------------------------------------------------
-- Progress rollup. A lesson counts as complete at >= 90% watched
-- (enforced by the API layer); this recomputes the enrollment percentage
-- and stamps completion + certificate serial at 100%.
-- ---------------------------------------------------------------------
create or replace function public.recalculate_enrollment_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enrollment_id uuid := coalesce(new.enrollment_id, old.enrollment_id);
  v_course_id     uuid;
  v_total         int;
  v_done          int;
  v_percent       int;
  v_cert_enabled  boolean;
begin
  select e.course_id, c.certificate_enabled
    into v_course_id, v_cert_enabled
  from public.enrollments e
  join public.courses c on c.id = e.course_id
  where e.id = v_enrollment_id;

  select count(*)::int into v_total
  from public.lessons where course_id = v_course_id;

  select count(*)::int into v_done
  from public.lesson_progress lp
  join public.lessons l on l.id = lp.lesson_id
  where lp.enrollment_id = v_enrollment_id
    and lp.is_completed
    and l.course_id = v_course_id;

  v_percent := case when v_total = 0 then 0
                    else least(100, floor(v_done * 100.0 / v_total)::int) end;

  update public.enrollments e
  set progress_percent = v_percent,
      completed_at = case
        when v_percent = 100 then coalesce(e.completed_at, now())
        else null
      end,
      certificate_serial = case
        when v_percent = 100 and v_cert_enabled
          then coalesce(e.certificate_serial, public.generate_certificate_serial())
        else e.certificate_serial
      end
  where e.id = v_enrollment_id;

  return null;
end;
$$;

create trigger lesson_progress_recalculate
  after insert or update or delete on public.lesson_progress
  for each row execute function public.recalculate_enrollment_progress();

-- ---------------------------------------------------------------------
-- Coupon validation. Callable by clients, but returns only
-- {valid, discount_amount, reason} — never the coupon row. PRD §5.2.
-- ---------------------------------------------------------------------
create or replace function public.validate_coupon(p_code text, p_course_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  c public.coupons%rowtype;
  v_price int;
  v_discount int;
begin
  select price_egp into v_price from public.courses
  where id = p_course_id and status = 'published';

  if v_price is null then
    return jsonb_build_object('valid', false, 'discount_amount', 0, 'reason', 'course_not_found');
  end if;

  select * into c from public.coupons where code = upper(trim(p_code));

  if c.id is null or not c.is_active then
    return jsonb_build_object('valid', false, 'discount_amount', 0, 'reason', 'not_found');
  end if;
  if c.course_id is not null and c.course_id <> p_course_id then
    return jsonb_build_object('valid', false, 'discount_amount', 0, 'reason', 'wrong_course');
  end if;
  if c.starts_at is not null and c.starts_at > now() then
    return jsonb_build_object('valid', false, 'discount_amount', 0, 'reason', 'not_started');
  end if;
  if c.expires_at is not null and c.expires_at <= now() then
    return jsonb_build_object('valid', false, 'discount_amount', 0, 'reason', 'expired');
  end if;
  if c.max_redemptions is not null and c.redemption_count >= c.max_redemptions then
    return jsonb_build_object('valid', false, 'discount_amount', 0, 'reason', 'exhausted');
  end if;

  v_discount := case c.type
    when 'percent' then floor(v_price * c.value / 100.0)::int
    else c.value
  end;
  v_discount := least(v_discount, v_price);

  return jsonb_build_object('valid', true, 'discount_amount', v_discount, 'reason', null);
end;
$$;

revoke all on function public.validate_coupon(text, uuid) from public;
grant execute on function public.validate_coupon(text, uuid) to anon, authenticated;
