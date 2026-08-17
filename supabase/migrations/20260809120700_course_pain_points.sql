-- =====================================================================
-- Marie Ragaie Beauty Academy — 08: per-course pain points
--
-- The sales page's "المشكلة" block (PRD §7.2.2) was hardcoded in the route
-- template with hairstyling copy — "the hairstyle falls out after two
-- hours". The academy is bringing in trainers across other beauty fields,
-- so that copy would have followed a makeup or skincare course onto its own
-- sales page and read as nonsense.
--
-- Pain points are course content, like what_you_learn, requirements,
-- target_audience and faq already are. The template renders whatever the
-- course carries, and skips the block entirely when the array is empty.
-- =====================================================================

alter table public.courses
  add column if not exists pain_points jsonb not null default '[]'::jsonb;

comment on column public.courses.pain_points is
  'Array of Arabic strings for the sales-page pain block. Specific to this course — never generic academy copy.';
