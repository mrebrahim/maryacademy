-- =====================================================================
-- Marie Ragaie Beauty Academy — 15: video testimonials
--
-- A written quote is good; the same trainee saying it on camera is the
-- strongest thing a sales page can carry. Kept in its own migration
-- because ALTER TYPE ... ADD VALUE has to commit before the new value can
-- be used, so it must not share a transaction with anything that uses it.
--
-- video_id holds a Bunny GUID rather than a URL, so playback goes through
-- the same embed as the course videos instead of a public file anyone can
-- hotlink.
-- =====================================================================

alter type public.testimonial_media add value if not exists 'video';

alter table public.testimonials add column if not exists video_id text;
