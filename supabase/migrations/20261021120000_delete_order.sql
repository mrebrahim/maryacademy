-- =====================================================================
-- delete_order() — remove a test or demo order from the admin screen
--
-- Why this exists: verifying the checkout path creates real rows, and
-- they are not cosmetic. A leftover test order counts a student who does
-- not exist and revenue that was never received — the two numbers the
-- academy will judge the launch by. Until now the only way to remove one
-- was a hand-written DELETE against the live database.
--
-- Three deliberate decisions:
--
--  1. SECURITY DEFINER with its own is_admin() check. Middleware keeps
--     non-admins off /admin, but a server action is a public HTTP
--     endpoint. The UI gate is not the security boundary.
--
--  2. Enrollments are deleted explicitly. enrollments.order_id is
--     ON DELETE SET NULL, so dropping the order alone would leave the
--     enrollment behind with a null order_id — a student permanently
--     enrolled in a paid course with no order to explain why. That is the
--     opposite of cleaning up.
--
--  3. The whole row is copied into audit_log before it goes. A delete
--     is the one admin action with nothing left to inspect afterwards,
--     so the record of what was removed, by whom, is the only way to
--     answer "where did that order go?" later.
-- =====================================================================

create or replace function public.delete_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order        public.orders%rowtype;
  v_enrollments  integer;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select * into v_order from public.orders where id = p_order_id;

  -- Not an error: two clicks on the same button, or two tabs open on the
  -- same list, should not produce a failure the admin has to interpret.
  if not found then
    return false;
  end if;

  delete from public.enrollments where order_id = p_order_id;
  get diagnostics v_enrollments = row_count;

  delete from public.orders where id = p_order_id;

  insert into public.audit_log (actor_id, action, entity, entity_id, diff)
  values (
    auth.uid(),
    'delete',
    'orders',
    p_order_id,
    jsonb_build_object(
      'deleted_order', to_jsonb(v_order),
      'deleted_enrollments', v_enrollments
    )
  );

  return true;
end;
$$;

comment on function public.delete_order(uuid) is
  'Admin-only. Permanently removes an order and any enrollment it created, '
  'keeping a copy of the deleted row in audit_log.';

revoke all on function public.delete_order(uuid) from public, anon;
grant execute on function public.delete_order(uuid) to authenticated;
