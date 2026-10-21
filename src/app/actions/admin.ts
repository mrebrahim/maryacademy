'use server'

import { revalidatePath } from 'next/cache'

import { reportPurchase } from '@/lib/conversions'
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

    // The one moment money is known to have arrived, which is why the
    // purchase is reported from here and never from the browser. Read
    // after the confirmation so a failed confirmation reports nothing.
    const { data: order } = await supabase
      .from('orders')
      .select('id, amount, contact_email, contact_phone, course:courses(slug)')
      .eq('id', orderId)
      .maybeSingle()

    if (order) {
      const course = Array.isArray(order.course) ? order.course[0] : order.course
      // Deliberately awaited: a server action's process can be torn down
      // the moment it returns, and a floating promise would be killed
      // mid-flight. Every call inside has its own timeout.
      await reportPurchase({
        orderId: order.id,
        value: order.amount / 100,
        email: order.contact_email,
        phone: order.contact_phone,
        courseSlug: course?.slug ?? null,
      })
    }
  } catch (error) {
    console.error('[confirmOrder]', error)
    return { ok: false, messageAr: 'تعذّر تأكيد الطلب.' }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/admin')
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
