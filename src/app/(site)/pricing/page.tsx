import { Check, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { plans } from '@/config/plans'
import { whatsappLink } from '@/config/site'
import { getPublishedCourses } from '@/lib/queries'
import { cn, formatPrice } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'الأسعار والاشتراك',
  description:
    'باقات الاشتراك في أكاديمية ماري رجائي للتجميل — دورة واحدة أو باقة الأكاديمية الكاملة، مع شهادة إتمام ووصول من أي جهاز.',
}

export default async function PricingPage() {
  const courses = await getPublishedCourses()
  // The single-course plan is priced from the course itself, never from a
  // number written into the front end.
  const course = courses[0]

  return (
    <>
      <PageHeader
        title="الأسعار والاشتراك"
        subtitle="اختر الباقة اللي تناسبك، وفريقنا يكمّل معك خطوات الحجز على واتساب."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
          <ul className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {plans.map((plan) => {
              const priceEgp = plan.fromCourse ? (course?.price_egp ?? null) : null
              const compareEgp = plan.fromCourse ? (course?.compare_at_price_egp ?? null) : null

              return (
                <li key={plan.id}>
                  <article
                    className={cn(
                      'flex h-full flex-col rounded-card p-8 transition',
                      plan.featured
                        ? 'bg-navy-950 text-white shadow-lg ring-1 ring-gold-500/40'
                        : 'bg-cream-50 text-navy-900 ring-1 ring-navy-900/8',
                    )}
                  >
                    {plan.featured && (
                      <span className="mb-5 inline-flex w-fit rounded-full bg-gold-500 px-3 py-1 text-[11px] font-bold text-navy-900">
                        الأكثر طلبًا
                      </span>
                    )}

                    <h2
                      className={cn(
                        'font-display text-lg',
                        plan.featured ? 'text-gold-300' : 'text-navy-900',
                      )}
                    >
                      {plan.nameEn}
                    </h2>
                    <p
                      className={cn(
                        'display mt-1 text-2xl',
                        plan.featured ? 'text-white' : 'text-navy-900',
                      )}
                    >
                      {plan.nameAr}
                    </p>

                    <p
                      className={cn(
                        'mt-4 text-sm leading-loose',
                        plan.featured ? 'text-cream-50/70' : 'text-muted',
                      )}
                    >
                      {plan.taglineAr}
                    </p>

                    <div
                      className={cn(
                        'mt-7 border-t pt-7',
                        plan.featured ? 'border-white/10' : 'border-navy-900/10',
                      )}
                    >
                      {priceEgp ? (
                        <>
                          <p className="flex items-baseline gap-3">
                            <span
                              className={cn(
                                'tabular display text-4xl',
                                plan.featured ? 'text-gold-300' : 'text-navy-900',
                              )}
                            >
                              {formatPrice(priceEgp)}
                            </span>
                            {compareEgp && compareEgp > priceEgp && (
                              <span
                                className={cn(
                                  'tabular text-sm line-through',
                                  plan.featured ? 'text-cream-50/40' : 'text-muted',
                                )}
                              >
                                {formatPrice(compareEgp)}
                              </span>
                            )}
                          </p>
                          <p
                            className={cn(
                              'mt-2 text-xs',
                              plan.featured ? 'text-cream-50/55' : 'text-muted',
                            )}
                          >
                            دفعة واحدة للدورة
                          </p>
                        </>
                      ) : (
                        <>
                          <p
                            className={cn(
                              'display text-2xl',
                              plan.featured ? 'text-gold-300' : 'text-navy-900',
                            )}
                          >
                            تواصل معنا
                          </p>
                          <p
                            className={cn(
                              'mt-2 text-xs',
                              plan.featured ? 'text-cream-50/55' : 'text-muted',
                            )}
                          >
                            السعر بيتحدد على حسب الدورات اللي تختارها
                          </p>
                        </>
                      )}
                    </div>

                    <ul
                      className={cn(
                        'mt-7 space-y-3 text-sm',
                        plan.featured ? 'text-cream-50/85' : 'text-navy-900/85',
                      )}
                    >
                      {plan.featuresAr.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 leading-relaxed">
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-gold-500"
                            aria-hidden="true"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto w-full pt-8">
                      <Button
                        asChild
                        size="lg"
                        variant={plan.featured ? 'primary' : 'tertiary'}
                        className="w-full"
                      >
                        <a
                          href={whatsappLink(plan.whatsappMessageAr)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle aria-hidden="true" />
                          {plan.ctaAr}
                        </a>
                      </Button>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>

          <p className="mx-auto mt-12 max-w-xl text-center text-sm leading-loose text-muted">
            مش متأكد أنهي باقة تناسبك؟ ابدأ بدروس المعاينة المفتوحة في{' '}
            <Link href="/courses" className="text-gold-600 underline underline-offset-4">
              صفحة الدورات
            </Link>{' '}
            — متاحة للجميع من غير اشتراك.
          </p>
        </div>
      </section>
    </>
  )
}
