-- =====================================================================
-- Remove the guest-checkout verification rows — RUN THIS ONCE
--
-- The guest checkout path was verified against the live database on
-- 2026-10-06 by creating a real order and walking it through confirmation
-- and claim. Those rows are still there, because the Supabase connector
-- refuses DELETE without an interactive confirmation it could not get.
--
-- They are not harmless. Until this runs, the admin dashboard counts a
-- student who does not exist and 6,000 EGP of revenue that was never
-- received — which is exactly the number the academy will judge the launch
-- by. Delete them before looking at /admin.
-- =====================================================================

delete from public.enrollments
 where order_id in (
   select id from public.orders where contact_email = 'guest.test@example.com'
 );

delete from public.orders
 where contact_email = 'guest.test@example.com';

delete from public.checkout_leads
 where email = 'guest.test@example.com';

-- Cascades to the profile row.
delete from auth.users
 where email = 'guest.test@example.com';

-- The trainer application created while verifying that path.
delete from public.trainer_applications
 where lower(email) = 'trainer.test@example.com';

-- Should all be zero except users = 1 (the admin).
select (select count(*) from auth.users)           as users,
       (select count(*) from public.orders)        as orders,
       (select count(*) from public.checkout_leads) as leads,
       (select count(*) from public.enrollments)   as enrollments;
