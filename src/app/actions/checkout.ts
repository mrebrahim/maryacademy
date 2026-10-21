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
  couponCode: z.string().trim().max(60).optional().or(z.literal('')),
  // Where the buyer says she is. It selects a price band in the database;
  // it never carries an amount.
  region: z.enum(['eg', 'intl']),
  method: z.enum(['instapay', 'vodafone_cash']).optional().or(z.literal('')),
  // Guest checkout: these three are the identity the order is recorded
  // against and later claimed by.
  name: z.string().trim().min(2, 'اكتب اسمك').max(120),
  // Egyptian numbers are checked only for Egyptian buyers. The rule used
  // to be unconditional, which made the form unsubmittable for exactly
  // the people the international price exists for.
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s/g, ''))
    .refine((v) => v.length >= 6, 'اكتبي رقم موبايل صحيح'),
  email: z.email({ error: 'البريد الإلكتروني مكتوب غلط' }),
})

export async function submitTransfer(_prev: OrderState, formData: FormData): Promise<OrderState> {
  const parsed = orderSchema.safeParse({
    courseId: formData.get('courseId'),
    couponCode: formData.get('couponCode') ?? '',
    region: formData.get('region'),
    method: formData.get('method') ?? '',
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجع البيانات' }
  }

  if (parsed.data.region === 'eg' && !/^01[0125]\d{8}$/.test(parsed.data.phone)) {
    return { ok: false, messageAr: 'اكتبي رقم موبايل مصري صحيح' }
  }

  try {
    const supabase = await createClient()
    // Works signed in or not: the function records auth.uid() when there is
    // one, and the email when there is not. The price and the discount are
    // computed in the database either way.
    const { error } = await supabase.rpc('create_guest_order', {
      p_course_id: parsed.data.courseId,
      p_name: parsed.data.name,
      p_phone: parsed.data.phone,
      p_email: parsed.data.email,
      p_coupon_code: parsed.data.couponCode || undefined,
      p_international: parsed.data.region === 'intl',
      p_provider: parsed.data.method || 'instapay',
    })

    if (error) {
      // The database raises named errors; map the ones a student can act on.
      if (error.message.includes('already_enrolled')) {
        return { ok: false, messageAr: 'إنت مشترك في الدورة دي بالفعل.' }
      }
      if (error.message.includes('course_not_priced')) {
        return { ok: false, messageAr: 'الدورة دي مش متاحة للحجز حاليًا.' }
      }
      if (error.message.includes('not_sold_internationally')) {
        return { ok: false, messageAr: 'الدورة دي بتتباع جوه مصر بس حاليًا — كلّمينا على واتساب.' }
      }
      throw error
    }
  } catch (error) {
    console.error('[submitTransfer]', error)
    return { ok: false, messageAr: 'تعذّر تسجيل الحجز، حاول تاني بعد شوية.' }
  }

  revalidatePath('/learn')
  // The email travels to the confirmation page so it can tell them where
  // the sign-in code is going, without needing a session to read it.
  redirect(`/checkout/success?email=${encodeURIComponent(parsed.data.email)}`)
}

// ---------------------------------------------------------------------
// Lead capture
// ---------------------------------------------------------------------

/**
 * Records contact details the moment they are entered, before payment.
 *
 * This runs on blur, so it fires often and on partial input. It is
 * deliberately forgiving — a half-typed email is not an error the student
 * should ever see — and it never blocks the form. The value is in the rows
 * it saves: the person who fills in an email and leaves used to vanish
 * without trace, and they are the most recoverable lost sale there is.
 */
const leadSchema = z.object({
  courseId: z.uuid(),
  name: z.string().trim().max(120).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().trim().max(200).optional().or(z.literal('')),
  utmSource: z.string().trim().max(120).optional().or(z.literal('')),
  utmMedium: z.string().trim().max(120).optional().or(z.literal('')),
  utmCampaign: z.string().trim().max(120).optional().or(z.literal('')),
})

export async function captureLead(formData: FormData): Promise<{ ok: boolean }> {
  const parsed = leadSchema.safeParse({
    courseId: formData.get('courseId'),
    name: formData.get('name') ?? '',
    phone: formData.get('phone') ?? '',
    email: formData.get('email') ?? '',
    utmSource: formData.get('utmSource') ?? '',
    utmMedium: formData.get('utmMedium') ?? '',
    utmCampaign: formData.get('utmCampaign') ?? '',
  })

  if (!parsed.success) return { ok: false }

  const { courseId, name, phone, email } = parsed.data
  // Nothing to identify them by yet — wait for the next blur.
  if (!email && !phone) return { ok: false }

  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc('capture_checkout_lead', {
      p_course_id: courseId,
      p_name: name || undefined,
      p_phone: phone || undefined,
      p_email: email || undefined,
      p_status: 'abandoned',
      p_utm_source: parsed.data.utmSource || undefined,
      p_utm_medium: parsed.data.utmMedium || undefined,
      p_utm_campaign: parsed.data.utmCampaign || undefined,
    })
    if (error) throw error
  } catch (error) {
    // Logged, never surfaced: losing a lead row is bad, losing the sale
    // because the form showed an error is worse.
    console.error('[captureLead]', error)
    return { ok: false }
  }

  return { ok: true }
}
