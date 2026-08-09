-- =====================================================================
-- Marie Ragaie Beauty Academy — 07: Storage buckets
--
-- Two public-read buckets:
--   `testimonials` — the original trainee screenshots (PRD §9.2 says the
--                    screenshot itself is stronger proof than retyped text)
--   `media`        — logo, hero photography, course thumbnails
--
-- Public read is deliberate: these render on marketing pages for logged-out
-- visitors. Every write path requires an admin.
-- =====================================================================

create policy "media_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('testimonials', 'media'));

create policy "media_admin_write" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('testimonials', 'media') and public.is_admin());

create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id in ('testimonials', 'media') and public.is_admin())
  with check (bucket_id in ('testimonials', 'media') and public.is_admin());

create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id in ('testimonials', 'media') and public.is_admin());
