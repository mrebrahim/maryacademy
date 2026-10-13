import { AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { CheckoutForm } from '@/components/checkout/checkout-form'
import { CheckoutShell } from '@/components/checkout/checkout-shell'
import { Button } from '@/components/ui/button'
import { includedItems } from '@/config/checkout'
import { CHECKOUT_ENABLED } from '@/config/features'
import { whatsappLink } from '@/config/site'
import { VideoTestimonials } from '@/components/home/video-testimonials'
import { availableMethods } from '@/lib/payments/provider'
import { getCourseBySlug, getTestimonials } from '@/lib/queries'

export const metadata: Metadata = { title: 'إتمام الحجز', robots: { index: false } }

type SearchParams = Promise<{
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}>

/**
 * Deliberately does not call notFound() when the course cannot be read.
 *
 * getCourseBySlug degrades to null on any failure, so a database outage is
 * indistinguishable from a bad slug — and turning that into a 404 means
 * every CTA on the landing page becomes a dead link the moment Supabase
 * hiccups. The page is noindex, so there is no SEO cost to answering a
 * genuinely wrong slug with this message instead, and there is a real cost
 * to showing a buyer a 404.
 */
export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: SearchParams
}) {
  const [{ slug }, utm] = await Promise.all([params, await searchParams])
  const [course, testimonials] = await Promise.all([getCourseBySlug(slug), getTestimonials(6)])

  // A course with no price must never reach a payment screen — but that is
  // a different situation from not having been able to look one up.
  const unavailable = !CHECKOUT_ENABLED || !course || course.price_egp <= 0

  if (unavailable) {
    return (
      <CheckoutShell step={0} backHref="/courses" backLabelAr="الدورات">
        <div className="mx-auto max-w-lg py-10 text-center sm:py-16">
          <AlertCircle className="mx-auto size-12 text-gold-500" aria-hidden="true" />

          <h1 className="display mt-6 text-2xl text-navy-900">الحجز مش متاح دلوقتي</h1>

          <p className="mt-5 text-base leading-loose text-muted">
            فيه مشكلة مؤقتة في تحميل بيانات الدورة. جرّب تاني بعد شوية، أو كلّمنا وهنحجزلك على
            طول.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <a
                href={whatsappLink('السلام عليكم، عايز أحجز في الكورس')}
                target="_blank"
                rel="noopener noreferrer"
              >
                احجز على واتساب
              </a>
            </Button>
            <Button asChild variant="tertiary" size="lg">
              <Link href="/courses">تصفّح الدورات</Link>
            </Button>
          </div>
        </div>
      </CheckoutShell>
    )
  }

  return (
    <CheckoutShell step={0} backHref={`/courses/${course.slug}`} backLabelAr="رجوع للدورة">
      <CheckoutForm
        courseId={course.id}
        courseTitle={course.title_ar}
        priceEgp={course.price_egp}
        priceEgpIntl={course.price_egp_intl ?? 0}
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

      {/* Last-moment reassurance, in the strongest form available: the
          trainees themselves. Renders nothing until videos exist. */}
      <div className="mt-10 -mx-4 sm:-mx-6">
        <VideoTestimonials
          testimonials={testimonials}
          headingAr="متدربين اشتركوا قبلك"
          introAr="مش كلام مكتوب — دول ناس حضرت التدريب وبتتكلم بنفسها."
        />
      </div>
    </CheckoutShell>
  )
}
