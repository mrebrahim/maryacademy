import type { Metadata } from 'next'

import { TestimonialsSection } from '@/components/home/testimonials-section'
import { PageHeader } from '@/components/layout/page-header'
import { getTestimonials } from '@/lib/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'آراء المتدربات',
  description: 'كلام متدربات حضروا ورش ماري رجائي الحضورية بنفسهم.',
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials(50)

  return (
    <>
      <PageHeader
        title="آراء المتدربات"
        subtitle="كل رأي هنا من متدربة حضرت ورشة حضورية بنفسها. مفيش تقييمات مدفوعة ولا مكتوبة."
      />

      {testimonials.length > 0 ? (
        <TestimonialsSection testimonials={testimonials} layout="all" />
      ) : (
        <section className="bg-cream-50">
          <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
            <p className="text-muted">مفيش آراء منشورة دلوقتي.</p>
          </div>
        </section>
      )}
    </>
  )
}
