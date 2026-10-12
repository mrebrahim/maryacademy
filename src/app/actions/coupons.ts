'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * Coupon creation.
 *
 * Validation and redemption have worked since the money loop was built;
 * the only way to make one was a SQL statement, which meant the academy
 * could not run a discount without a developer.
 *
 * The write goes through the table rather than a function because the
 * coupons policy already requires is_admin() — the database refuses a
 * non-admin regardless of what this file does.
 */

export type CouponAdminState = { ok: boolean; messageAr: string } | null

const schema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'الكود قصير أوي')
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/, 'الكود بحروف إنجليزية وأرقام وشرطات فقط')
      .transform((v) => v.toUpperCase()),
    type: z.enum(['percent', 'fixed']),
    value: z.coerce.number().positive('القيمة لازم تكون أكبر من صفر'),
    courseId: z.string().optional().or(z.literal('')),
    maxRedemptions: z.coerce.number().int().positive().optional().or(z.literal('')),
    expiresAt: z.string().optional().or(z.literal('')),
  })
  .refine((v) => v.type !== 'percent' || v.value <= 100, {
    message: 'نسبة الخصم مينفعش تزيد عن 100%',
    path: ['value'],
  })

export async function createCoupon(
  _prev: CouponAdminState,
  formData: FormData,
): Promise<CouponAdminState> {
  const parsed = schema.safeParse({
    code: formData.get('code'),
    type: formData.get('type'),
    value: formData.get('value'),
    courseId: formData.get('courseId') ?? '',
    maxRedemptions: formData.get('maxRedemptions') ?? '',
    expiresAt: formData.get('expiresAt') ?? '',
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجع البيانات' }
  }

  const { code, type, value, courseId, maxRedemptions, expiresAt } = parsed.data

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('coupons').insert({
      code,
      type,
      // Fixed discounts are stored in piastres like every other amount in
      // the schema; the form asks for pounds because that is what a person
      // thinks in.
      value: type === 'fixed' ? Math.round(value * 100) : Math.round(value),
      course_id: courseId || null,
      max_redemptions: maxRedemptions ? Number(maxRedemptions) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: true,
    })

    if (error) {
      if (error.code === '23505') {
        return { ok: false, messageAr: 'الكود ده موجود بالفعل.' }
      }
      if (error.code === '42501') {
        return { ok: false, messageAr: 'الصلاحية دي للإدارة فقط.' }
      }
      throw error
    }
  } catch (error) {
    console.error('[createCoupon]', error)
    return { ok: false, messageAr: 'تعذّر إنشاء الكود، حاول تاني.' }
  }

  revalidatePath('/admin/coupons')
  return { ok: true, messageAr: `اتعمل الكود ${code}` }
}

const toggleSchema = z.object({ id: z.uuid(), active: z.enum(['true', 'false']) })

/**
 * Switching a coupon off rather than deleting it. A deleted coupon takes
 * its redemption count with it, and that count is the only record of what
 * a discount actually cost.
 */
export async function setCouponActive(
  _prev: CouponAdminState,
  formData: FormData,
): Promise<CouponAdminState> {
  const parsed = toggleSchema.safeParse({
    id: formData.get('id'),
    active: formData.get('active'),
  })

  if (!parsed.success) return { ok: false, messageAr: 'طلب غير صالح' }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: parsed.data.active === 'true' })
      .eq('id', parsed.data.id)

    if (error) throw error
  } catch (error) {
    console.error('[setCouponActive]', error)
    return { ok: false, messageAr: 'تعذّر تنفيذ الإجراء.' }
  }

  revalidatePath('/admin/coupons')
  return { ok: true, messageAr: parsed.data.active === 'true' ? 'اتفعّل' : 'اتوقف' }
}
