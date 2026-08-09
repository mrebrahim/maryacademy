import type { Metadata } from 'next'

import { Instructor } from '@/components/home/instructor'
import { LearningJourney } from '@/components/home/learning-journey'
import { WhyChooseUs } from '@/components/home/why-choose-us'
import { StatsBar } from '@/components/home/stats-bar'
import { PageHeader } from '@/components/layout/page-header'

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

      <StatsBar tone="light" />

      <Instructor />
      <WhyChooseUs />
      <LearningJourney />
    </>
  )
}
