import type { Metadata } from 'next'

import { Instructor } from '@/components/home/instructor'
import { LearningJourney } from '@/components/home/learning-journey'
import { WhyChooseUs } from '@/components/home/why-choose-us'
import { StatsBar } from '@/components/home/stats-bar'
import { PageHeader } from '@/components/layout/page-header'

export const metadata: Metadata = {
  title: 'عن الأكاديمية',
  description:
    'أكاديمية ماري رجائي للتجميل — أكثر من 5 سنوات تدريب حضوري و400 متدرب ومتدربة، والمنهج متاح الآن أونلاين.',
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="عن الأكاديمية"
        subtitle="بدأت الأكاديمية بورش حضورية في القاهرة، ووصلت إلى أكثر من 400 متدرب ومتدربة من مختلف محافظات مصر. واليوم أصبح المنهج نفسه متاحًا أونلاين."
      />

      <StatsBar tone="light" />

      <Instructor />
      <WhyChooseUs />
      <LearningJourney />
    </>
  )
}
