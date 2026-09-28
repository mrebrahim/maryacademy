import type { Tables } from '@/lib/supabase/database.types'

/**
 * Checkout copy.
 *
 * What is included is derived from the course row wherever a number is
 * involved — lesson count and duration come from the database, because a
 * sales page that claims "13 videos" while the catalogue holds 9 is a
 * refund waiting to happen, and nobody remembers to update copy.
 *
 * Two things this list deliberately does not contain:
 *
 *   - a money-back guarantee. The academy does not offer refunds and has
 *     asked for them not to be mentioned anywhere on the site.
 *   - any statement of how long access lasts. Also asked for explicitly.
 *
 * Both are commercially normal things to put on a checkout page, and both
 * are excluded on instruction. Anything added here has to be true of the
 * product as sold.
 */
export function includedItems(course: {
  lesson_count: number
  total_duration_minutes: number
  certificate_enabled: boolean
}): string[] {
  const items: string[] = []

  if (course.lesson_count > 0) {
    const hours = Math.round(course.total_duration_minutes / 60)
    items.push(
      hours > 0
        ? `${course.lesson_count} درس فيديو — حوالي ${hours} ساعة تطبيق عملي`
        : `${course.lesson_count} درس فيديو تطبيقي`,
    )
  }

  items.push('من التجهيز للفينيش النهائي، خطوة بخطوة')
  items.push('تتفرّج في أي وقت من أي محافظة')

  if (course.certificate_enabled) {
    items.push('شهادة إتمام باسمك')
  }

  return items
}

/** Order of the three steps shown at the top of the page. */
export const CHECKOUT_STEPS = ['بياناتك', 'الدفع', 'التأكيد'] as const

export type CheckoutStep = 0 | 1 | 2

export const LEAD_STATUS_LABELS_AR: Record<
  Tables<'checkout_leads'>['status'],
  string
> = {
  abandoned: 'ساب الصفحة',
  started: 'بدأ الدفع',
  paid: 'دفع',
}
