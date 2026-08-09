-- =====================================================================
-- Marie Ragaie Beauty Academy — 01: extensions, enums, shared helpers
-- PRD §5
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.user_role            as enum ('student', 'admin');
create type public.content_status       as enum ('draft', 'published', 'archived');
create type public.course_level         as enum ('beginner', 'intermediate', 'advanced');
create type public.enrollment_status    as enum ('active', 'revoked', 'expired');
create type public.order_status         as enum ('pending', 'paid', 'failed', 'refunded');
create type public.payment_provider     as enum ('paymob', 'stripe', 'manual');
create type public.currency_code        as enum ('EGP', 'USD');
create type public.coupon_type          as enum ('percent', 'fixed');
create type public.testimonial_source   as enum ('in_person_training', 'online_course');
create type public.testimonial_media    as enum ('text', 'screenshot', 'result_photo', 'certificate');
create type public.permission_status    as enum ('pending', 'granted', 'denied');
create type public.lead_source          as enum ('newsletter', 'contact_form', 'course_interest');
create type public.locale_code          as enum ('ar', 'en');

-- ---------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
