'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * Checkout actions.
 *
 * Both go through SECURITY DEFINER database functions rather than writing
 * to `orders` directly: the client role has no INSERT on that table by
 * design (PRD §5.2), and the amount owed is computed in the database from
 * the course row, so nothing the browser sends can change the price.
 */

export type CouponState = {
  ok: boolean
  messageAr: string
  discountAmount?: number
  code?: string
} | null

const REASONS: Record<string, string> = {
  not_found: 'الكود ده مش موجود',
  expired: 'الكود ده انتهت صلاحيته',
  not_started: 'الكود ده لسه ما اشتغلش',
  exhausted: 'الكود ده وصل للحد الأقصى للاستخدام',
  wrong_course: 'الكود ده مش على الدورة دي',
  course_not_found: 'الدورة غير متاحة',
}

export async function applyCoupon(_prev: CouponState, formData: FormData): Promise<CouponState> {
  const code = String(formData.get('code') ?? '').trim()
  const courseId = String(formData.get('courseId') ?? '')

  if (!code) return { ok: false, messageAr: 'اكتب كود الخصم' }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('validate_coupon', {
      p_code: code,
      p_course_id: courseId,
    })

    if (error) throw error

    const result = data as { valid: boolean; discount_amount: number; reason: string | null }

    if (!result.valid) {
      return { ok: false, messageAr: REASONS[result.reason ?? ''] ?? 'الكود غير صالح' }
    }

    return {
      ok: true,
      messageAr: 'تم تطبيق الخصم',
      discountAmount: result.discount_amount,
      code: code.toUpperCase(),
    }
  } catch (error) {
    console.error('[applyCoupon]', error)
    return { ok: false, messageAr: 'تعذّر التحقق من الكود، حاول تاني.' }
  }
}

export type OrderState = { ok: boolean; messageAr: string } | null

const orderSchema = z.object({
  courseId: z.uuid(),
  reference: z
    .string()
    .trim()
    .min(4, 'اكتب رقم أو مرجع العملية زي ما ظهرلك في إنستا باي')
    .max(120),
  couponCode: z.string().trim().max(60).optional().or(z.literal('')),
})

export async function submitTransfer(_prev: OrderState, formData: FormData): Promise<OrderState> {
  const parsed = orderSchema.safeParse({
    courseId: formData.get('courseId'),
    reference: formData.get('reference'),
    couponCode: formData.get('couponCode') ?? '',
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجع البيانات' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc('create_pending_order', {
      p_course_id: parsed.data.courseId,
      p_coupon_code: parsed.data.couponCode || undefined,
      p_reference: parsed.data.reference,
    })

    if (error) {
      // The database raises named errors; map the ones a student can act on.
      if (error.message.includes('already_enrolled')) {
        return { ok: false, messageAr: 'إنت مشترك في الدورة دي بالفعل.' }
      }
      if (error.message.includes('course_not_priced')) {
        return { ok: false, messageAr: 'الدورة دي مش متاحة للحجز حاليًا.' }
      }
      throw error
    }
  } catch (error) {
    console.error('[submitTransfer]', error)
    return { ok: false, messageAr: 'تعذّر تسجيل الحجز، حاول تاني بعد شوية.' }
  }

  revalidatePath('/learn')
  redirect('/checkout/received')
}
