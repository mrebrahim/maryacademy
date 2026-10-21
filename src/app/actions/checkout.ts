'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { setHandoffEmail } from '@/lib/handoff-email'
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
    .refine((v) => v.length >= 6, 'اكتب رقم موبايل صحيح'),
  email: z.email({ error: 'البريد الإلكتروني مكتوب غلط' }),
})

export async function submitTransfer(_prev: OrderState, formData: FormData): Promise<OrderState> {
  let orderId: string | null = null
  let orderValue = 0

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
    return { ok: false, messageAr: 'اكتب رقم موبايل مصري صحيح' }
  }

  try {
    const supabase = await createClient()
    // Works signed in or not: the function records auth.uid() when there is
    // one, and the email when there is not. The price and the discount are
    // computed in the database either way.
    const { data: newOrderId, error } = await supabase.rpc('create_guest_order', {
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
        return { ok: false, messageAr: 'الدورة دي بتتباع جوه مصر بس حاليًا — كلّمنا على واتساب.' }
      }

      // PGRST202 means PostgREST could not find a function matching these
      // argument names — in practice, code deployed ahead of its
      // migration. Worth its own branch: the generic "try again later"
      // sends everyone away from a checkout that will never work until
      // somebody runs some SQL, and nothing in the message hints at that.
      if (error.code === 'PGRST202') {
        console.error(
          '[submitTransfer] create_guest_order signature mismatch — run the migration that adds p_international and p_provider',
          error,
        )
        return {
          ok: false,
          messageAr: 'فيه مشكلة في الحجز عندنا — كلّمنا على واتساب ونسجّلك فورًا.',
        }
      }

      throw error
    }

    orderId = newOrderId ?? null

    // The value that travels with the ad event. Read from the course row
    // rather than taken from the form — `courses` is publicly readable,
    // so this costs nothing and keeps a browser from naming its own
    // conversion value. It is the list price for the chosen band, not the
    // couponed total; the authoritative revenue figure is the server-side
    // purchase, reported when the transfer is confirmed.
    const { data: course } = await supabase
      .from('courses')
      .select('price_egp, price_egp_intl')
      .eq('id', parsed.data.courseId)
      .maybeSingle()

    if (course) {
      const minor =
        parsed.data.region === 'intl' && course.price_egp_intl > 0
          ? course.price_egp_intl
          : course.price_egp
      orderValue = minor / 100
    }
  } catch (error) {
    console.error('[submitTransfer]', error)
    return { ok: false, messageAr: 'تعذّر تسجيل الحجز، حاول تاني بعد شوية.' }
  }

  revalidatePath('/learn')

  // The email travels in an httpOnly cookie, NOT in the query string. It
  // is personally identifying data, and every tracking pixel on the
  // confirmation page reports the page URL with each event it fires — so
  // `?email=` handed a real address, unhashed, to Meta and the rest. See
  // src/lib/handoff-email.ts.
  await setHandoffEmail(parsed.data.email)

  // The order id and amount do travel in the URL: a random UUID and a
  // price are not personal data, and the confirmation page needs both to
  // report one order_submitted event — a guest has no session, so it
  // cannot read the order back from the database.
  const params = new URLSearchParams()
  if (orderId) {
    params.set('order', orderId)
    if (orderValue > 0) params.set('value', String(orderValue))
  }
  const query = params.toString()
  redirect(query ? `/checkout/success?${query}` : '/checkout/success')
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
