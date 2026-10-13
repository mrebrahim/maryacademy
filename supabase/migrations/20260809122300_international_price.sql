-- =====================================================================
-- Marie Ragaie Beauty Academy — 24: a second price, for outside Egypt
--
-- 6,000 EGP for Egyptians, 12,000 EGP for everyone else, "or the
-- equivalent in your currency".
--
-- Stored as a second EGP figure rather than converted into dollars on
-- purpose. A USD column would have to be kept correct against a rate that
-- moves weekly, and nobody is going to do that — the price on the page
-- would quietly drift away from the price the academy means. The academy
-- quotes a pound figure and settles the equivalent when the transfer is
-- arranged, so that is what the database should hold. `price_usd` stays
-- for the day a card processor actually charges in dollars.
--
-- Zero means "not offered abroad", which is the right default for a
-- course that has not thought about it yet: the site then shows one price
-- and no international line.
-- =====================================================================

alter table public.courses
  add column price_egp_intl int not null default 0,
  add constraint courses_price_egp_intl_non_negative check (price_egp_intl >= 0);

comment on column public.courses.price_egp_intl is
  'Price in piastres for buyers outside Egypt. 0 = not offered abroad.';

update public.courses
   set price_egp_intl = 1200000
 where slug = 'hairstyling-master-class';
