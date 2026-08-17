'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

/**
 * Admin order decisions.
 *
 * Both call SECURITY DEFINER functions that re-check `is_admin()` in the
 * database. Middleware already keeps non-admins off these pages, but a
 * server action is a public HTTP endpoint — the UI gate is not the security
 * boundary, the database check is.
 */

export type AdminActionState = { ok: boolean; messageAr: string } | null

export async function confirmOrder(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const orderId = String(formData.get('orderId') ?? '')

  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc('confirm_order', { p_order_id: orderId })
    if (error) throw error
  } catch (error) {
    console.error('[confirmOrder]', error)
    return { ok: false, messageAr: 'تعذّر تأكيد الطلب.' }
  }

  revalidatePath('/admin/orders')
  return { ok: true, messageAr: 'تم التأكيد وفُتح الوصول للدورة.' }
}

export async function rejectOrder(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const orderId = String(formData.get('orderId') ?? '')
  const reason = String(formData.get('reason') ?? '').trim() || null

  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc('reject_order', {
      p_order_id: orderId,
      p_reason: reason ?? undefined,
    })
    if (error) throw error
  } catch (error) {
    console.error('[rejectOrder]', error)
    return { ok: false, messageAr: 'تعذّر رفض الطلب.' }
  }

  revalidatePath('/admin/orders')
  return { ok: true, messageAr: 'تم رفض الطلب.' }
}
