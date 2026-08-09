-- =====================================================================
-- Marie Ragaie Beauty Academy — 02: core tables
-- PRD §5.1
-- Money is always stored in the currency's minor unit:
--   price_egp -> piastres, price_usd -> cents.
-- =====================================================================

-- ---------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  full_name       text,
  phone           text,                       -- E.164, Egypt default (+20)
  avatar_url      text,
  role            public.user_role not null default 'student',
  whatsapp_opt_in boolean not null default false,
  country         text default 'EG',
  last_seen_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint profiles_phone_e164 check (phone is null or phone ~ '^\+[1-9]\d{6,14}$')
);

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name_ar    text not null,
  slug       text not null unique,
  icon       text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------
create table public.courses (
  id                     uuid primary key default gen_random_uuid(),
  title_ar               text not null,
  slug                   text not null unique,
  subtitle_ar            text,
  description_ar         text,
  category_id            uuid references public.categories (id) on delete set null,
  thumbnail_url          text,
  promo_video_id         text,                -- Bunny Stream GUID (promo is public)
  level                  public.course_level not null default 'beginner',
  total_duration_minutes int not null default 0,   -- denormalized, trigger-maintained
  lesson_count           int not null default 0,   -- denormalized, trigger-maintained
  price_egp              int not null default 0,   -- piastres
  price_usd              int,                      -- cents, null = not sold in USD
  compare_at_price_egp   int,                      -- strikethrough price, piastres
  status                 public.content_status not null default 'draft',
  published_at           timestamptz,
  certificate_enabled    boolean not null default true,
  sequential_unlock      boolean not null default false,  -- PRD §6.3
  what_you_learn         jsonb not null default '[]'::jsonb,
  requirements           jsonb not null default '[]'::jsonb,
  target_audience        jsonb not null default '[]'::jsonb,
  faq                    jsonb not null default '[]'::jsonb,  -- [{q, a}]
  seo_title              text,
  seo_description        text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint courses_price_egp_nonneg check (price_egp >= 0),
  constraint courses_price_usd_nonneg check (price_usd is null or price_usd >= 0),
  constraint courses_compare_at_gt_price
    check (compare_at_price_egp is null or compare_at_price_egp >= price_egp)
);

create index courses_status_idx      on public.courses (status);
create index courses_category_id_idx on public.courses (category_id);

-- ---------------------------------------------------------------------
-- modules
-- ---------------------------------------------------------------------
create table public.modules (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses (id) on delete cascade,
  title_ar   text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index modules_course_id_idx on public.modules (course_id, sort_order);

-- ---------------------------------------------------------------------
-- lessons
-- `bunny_video_id` and `attachments` are the protected columns; they are
-- never exposed through the public path (see lessons_public view, PRD §5.2).
-- ---------------------------------------------------------------------
create table public.lessons (
  id               uuid primary key default gen_random_uuid(),
  module_id        uuid not null references public.modules (id) on delete cascade,
  course_id        uuid not null references public.courses (id) on delete cascade,
  title_ar         text not null,
  slug             text not null,
  description_ar   text,
  bunny_video_id   text,
  duration_seconds int not null default 0,
  sort_order       int not null default 0,
  is_free_preview  boolean not null default false,
  attachments      jsonb not null default '[]'::jsonb,  -- [{name, storage_path, size}]
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint lessons_slug_unique_per_course unique (course_id, slug),
  constraint lessons_duration_nonneg check (duration_seconds >= 0)
);

create index lessons_course_id_idx on public.lessons (course_id, sort_order);
create index lessons_module_id_idx on public.lessons (module_id, sort_order);

-- PRD §6.2: at most one free-preview lesson per course.
create unique index lessons_one_free_preview_per_course
  on public.lessons (course_id)
  where is_free_preview;

-- ---------------------------------------------------------------------
-- coupons (declared before orders — orders references it)
-- ---------------------------------------------------------------------
create table public.coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  type             public.coupon_type not null,
  value            int not null,          -- percent: 1..100, fixed: minor units
  max_redemptions  int,
  redemption_count int not null default 0,
  starts_at        timestamptz,
  expires_at       timestamptz,
  course_id        uuid references public.courses (id) on delete cascade,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint coupons_code_uppercase check (code = upper(code)),
  constraint coupons_value_positive check (value > 0),
  constraint coupons_percent_range check (type <> 'percent' or value <= 100)
);

-- ---------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------
create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete restrict,
  course_id         uuid not null references public.courses (id) on delete restrict,
  amount            int not null,          -- minor units, after discount
  currency          public.currency_code not null default 'EGP',
  coupon_id         uuid references public.coupons (id) on delete set null,
  discount_amount   int not null default 0,
  provider          public.payment_provider not null,
  provider_order_id text,
  provider_txn_id   text,
  status            public.order_status not null default 'pending',
  paid_at           timestamptz,
  utm               jsonb not null default '{}'::jsonb,
  raw_payload       jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint orders_amount_nonneg check (amount >= 0)
);

create index orders_provider_order_id_idx on public.orders (provider_order_id);
create index orders_user_id_idx           on public.orders (user_id);
create index orders_status_idx            on public.orders (status);

-- Webhook idempotency (PRD §6.1 step 6): the same provider transaction can
-- never be recorded twice.
create unique index orders_provider_txn_unique
  on public.orders (provider, provider_txn_id)
  where provider_txn_id is not null;

-- ---------------------------------------------------------------------
-- enrollments
-- ---------------------------------------------------------------------
create table public.enrollments (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  course_id          uuid not null references public.courses (id) on delete cascade,
  order_id           uuid references public.orders (id) on delete set null,  -- null = granted by admin
  status             public.enrollment_status not null default 'active',
  access_expires_at  timestamptz,           -- null = lifetime access
  progress_percent   int not null default 0,
  completed_at       timestamptz,
  certificate_serial text unique,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint enrollments_user_course_unique unique (user_id, course_id),
  constraint enrollments_progress_range check (progress_percent between 0 and 100)
);

create index enrollments_user_id_idx   on public.enrollments (user_id);
create index enrollments_course_id_idx on public.enrollments (course_id);

-- ---------------------------------------------------------------------
-- lesson_progress
-- ---------------------------------------------------------------------
create table public.lesson_progress (
  id             uuid primary key default gen_random_uuid(),
  enrollment_id  uuid not null references public.enrollments (id) on delete cascade,
  lesson_id      uuid not null references public.lessons (id) on delete cascade,
  watched_seconds int not null default 0,
  is_completed   boolean not null default false,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint lesson_progress_unique unique (enrollment_id, lesson_id),
  constraint lesson_progress_watched_nonneg check (watched_seconds >= 0)
);

create index lesson_progress_enrollment_idx on public.lesson_progress (enrollment_id);

-- ---------------------------------------------------------------------
-- testimonials — PRD §9.2. `source` is a hard requirement, never nullable.
-- ---------------------------------------------------------------------
create table public.testimonials (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  handle            text,                  -- instagram / whatsapp handle
  role_ar           text,
  body_ar           text not null,
  rating            int not null default 5,
  avatar_url        text,
  source            public.testimonial_source not null,
  media_type        public.testimonial_media not null default 'text',
  asset_path        text,                  -- original screenshot in Storage
  permission_status public.permission_status not null default 'pending',
  locale            public.locale_code not null default 'ar',
  course_id         uuid references public.courses (id) on delete set null,
  is_published      boolean not null default false,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint testimonials_rating_range check (rating between 1 and 5),
  -- PRD §9.2: nothing goes live without written permission from the person.
  constraint testimonials_publish_requires_permission
    check (not is_published or permission_status = 'granted')
);

create index testimonials_published_idx on public.testimonials (is_published, sort_order);

-- ---------------------------------------------------------------------
-- posts (blog)
-- ---------------------------------------------------------------------
create table public.posts (
  id              uuid primary key default gen_random_uuid(),
  title_ar        text not null,
  slug            text not null unique,
  excerpt_ar      text,
  body_ar         text,
  cover_url       text,
  author_name     text,
  status          public.content_status not null default 'draft',
  published_at    timestamptz,
  seo_title       text,
  seo_description text,
  tags            text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index posts_status_idx on public.posts (status, published_at desc);

-- ---------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  email      text,
  phone      text,
  name       text,
  source     public.lead_source not null,
  course_id  uuid references public.courses (id) on delete set null,
  message    text,
  utm        jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_needs_a_contact check (email is not null or phone is not null)
);

create index leads_source_idx     on public.leads (source, created_at desc);
create index leads_created_at_idx on public.leads (created_at desc);

-- ---------------------------------------------------------------------
-- audit_log — PRD §8, every admin write is recorded
-- ---------------------------------------------------------------------
create table public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.profiles (id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  diff       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_entity_idx     on public.audit_log (entity, entity_id);
create index audit_log_created_at_idx on public.audit_log (created_at desc);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'categories', 'courses', 'modules', 'lessons', 'coupons',
    'orders', 'enrollments', 'lesson_progress', 'testimonials', 'posts', 'leads'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t
    );
  end loop;
end;
$$;
