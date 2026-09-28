import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CheckoutForm } from '@/components/checkout/checkout-form'
import { CheckoutShell } from '@/components/checkout/checkout-shell'
import { includedItems } from '@/config/checkout'
import { CHECKOUT_ENABLED } from '@/config/features'
import { availableMethods } from '@/lib/payments/provider'
import { getCourseBySlug } from '@/lib/queries'

export const metadata: Metadata = { title: 'إتمام الحجز', robots: { index: false } }

type SearchParams = Promise<{
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}>

/** Middleware guarantees a session before this renders. */
export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: SearchParams
}) {
  const [{ slug }, utm] = await Promise.all([params, await searchParams])
  const course = await getCourseBySlug(slug)

  // A course with no price must never reach a payment screen.
  if (!CHECKOUT_ENABLED || !course || course.price_egp <= 0) notFound()

  return (
    <CheckoutShell step={0} backHref={`/courses/${course.slug}`} backLabelAr="رجوع للدورة">
      <CheckoutForm
        courseId={course.id}
        courseTitle={course.title_ar}
        priceEgp={course.price_egp}
        compareAtEgp={course.compare_at_price_egp}
        included={includedItems(course)}
        // The UI never hardcodes a provider; it renders whatever is live.
        methods={availableMethods().map(({ id, kind, labelAr, hintAr }) => ({
          id,
          kind,
          labelAr,
          hintAr,
        }))}
        utm={{
          source: utm.utm_source,
          medium: utm.utm_medium,
          campaign: utm.utm_campaign,
        }}
      />
    </CheckoutShell>
  )
}
