import type { Metadata } from 'next'

import { TestimonialsSection } from '@/components/home/testimonials-section'
import { PageHeader } from '@/components/layout/page-header'
import { getTestimonials } from '@/lib/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'آراء المتدربين',
  description: 'آراء متدربين حضروا التدريب الحضوري في أكاديمية ماري رجائي.',
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials(50)

  return (
    <>
      <PageHeader
        title="آراء المتدربين"
        subtitle="كل رأي هنا لمتدرب أو متدربة حضر التدريب بنفسه. لا تقييمات مدفوعة ولا مكتوبة."
      />

      {testimonials.length > 0 ? (
        <TestimonialsSection testimonials={testimonials} layout="all" />
      ) : (
        <section className="bg-cream-50">
          <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
            <p className="text-muted">لا توجد آراء منشورة حاليًا.</p>
          </div>
        </section>
      )}
    </>
  )
}
