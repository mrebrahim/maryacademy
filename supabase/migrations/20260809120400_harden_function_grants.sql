-- =====================================================================
-- Marie Ragaie Beauty Academy — 05: function hardening
--
-- Supabase exposes every function in `public` over PostgREST as
-- /rest/v1/rpc/<name>. Trigger functions and internal helpers must not be
-- callable that way, and every function needs a pinned search_path.
-- =====================================================================

alter function public.set_updated_at() set search_path = public;
alter function public.generate_certificate_serial() set search_path = public;

-- Trigger-only functions: nobody calls these directly.
revoke all on function public.set_updated_at()                  from public, anon, authenticated;
revoke all on function public.generate_certificate_serial()     from public, anon, authenticated;
revoke all on function public.handle_new_user()                 from public, anon, authenticated;
revoke all on function public.refresh_course_totals()           from public, anon, authenticated;
revoke all on function public.recalculate_enrollment_progress() from public, anon, authenticated;

-- Policy helpers: signed-in users only (RLS policies evaluate as the
-- caller's role, so `authenticated` genuinely needs EXECUTE here).
revoke all on function public.is_admin()                  from public, anon;
revoke all on function public.has_course_access(uuid)     from public, anon;
grant execute on function public.is_admin()               to authenticated;
grant execute on function public.has_course_access(uuid)  to authenticated;

-- validate_coupon stays callable by anon on purpose (checkout runs before
-- some users sign in) — it returns {valid, discount_amount, reason} only.
revoke all on function public.validate_coupon(text, uuid) from public;
grant execute on function public.validate_coupon(text, uuid) to anon, authenticated;
