import type { Metadata } from 'next'

import { Instructor } from '@/components/home/instructor'
import { LearningJourney } from '@/components/home/learning-journey'
import { WhyChooseUs } from '@/components/home/why-choose-us'
import { PageHeader } from '@/components/layout/page-header'
import { academyStats } from '@/config/site'

export const metadata: Metadata = {
  title: 'عن الأكاديمية',
  description:
    'أكاديمية ماري رجائي للتجميل — أكتر من 5 سنين تدريب حضوري و400 متدربة، والمنهج بقى متاح أونلاين.',
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="عن الأكاديمية"
        subtitle="بدأنا بورش حضورية في القاهرة، ووصلنا لأكتر من 400 متدربة من كل محافظات مصر. دلوقتي نفس المنهج بقى متاح أونلاين."
      />

      <section aria-label="أرقام الأكاديمية" className="bg-cream-50">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {academyStats.map((stat) => (
            <div key={stat.labelAr} className="text-center">
              {stat.value && (
                <p className="tabular font-display text-3xl text-gold-500">{stat.value}</p>
              )}
              <p className="mt-1 font-semibold text-navy-900">{stat.labelAr}</p>
              <p className="mt-1 text-sm text-muted">{stat.contextAr}</p>
            </div>
          ))}
        </div>
      </section>

      <Instructor />
      <WhyChooseUs />
      <LearningJourney />
    </>
  )
}
