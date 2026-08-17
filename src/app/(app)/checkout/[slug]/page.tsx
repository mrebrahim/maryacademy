import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CheckoutForm } from '@/components/checkout/checkout-form'
import { CHECKOUT_ENABLED } from '@/config/features'
import { getCourseBySlug } from '@/lib/queries'

export const metadata: Metadata = { title: 'إتمام الحجز', robots: { index: false } }

/** Middleware guarantees a session before this renders. */
export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  // A course with no price must never reach a payment screen.
  if (!CHECKOUT_ENABLED || !course || course.price_egp <= 0) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="display text-3xl text-navy-900">إتمام الحجز</h1>
      <p className="mt-3 text-sm text-muted">خطوتين بس، وحسابك يتفعّل بعد مراجعة التحويل.</p>

      <div className="mt-10">
        <CheckoutForm
          courseId={course.id}
          courseTitle={course.title_ar}
          priceEgp={course.price_egp}
          compareAtEgp={course.compare_at_price_egp}
        />
      </div>
    </div>
  )
}
