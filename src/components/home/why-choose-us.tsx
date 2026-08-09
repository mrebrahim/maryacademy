import { Award, Clock, Gem, Headphones, Star } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

/** PRD §7.1.4 — five feature cards on navy. */
const FEATURES = [
  {
    icon: Clock,
    titleAr: 'مرونة في التعلّم',
    bodyAr: 'وقت ما يناسبك، ومن أي مكان',
  },
  {
    icon: Gem,
    titleAr: 'محتوى تدريبي',
    bodyAr: 'احترافي وحديث باستمرار',
  },
  {
    icon: Headphones,
    titleAr: 'دعم ومتابعة مستمرة',
    bodyAr: 'حتى بعد انتهاء الدورة',
  },
  {
    icon: Award,
    titleAr: 'شهادة معتمدة',
    bodyAr: 'تعزز مستقبلك المهني',
  },
  {
    icon: Star,
    titleAr: 'خبرة عملية حقيقية',
    bodyAr: 'من واقع سوق العمل',
  },
] as const

export function WhyChooseUs() {
  return (
    <section aria-labelledby="why-heading" className="bg-navy-900">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,21rem)_1fr] lg:gap-12">
          <div>
            {/* The Latin name needs <bdi>: without it the bidi algorithm
                drags the Arabic question mark to the wrong end of the line. */}
            <h2 id="why-heading" className="text-2xl text-white sm:text-3xl">
              ليه تختاري
              <span className="mt-1 block font-display text-gold-500">
                <bdi>Marie Ragaie Academy</bdi>؟
              </span>
            </h2>

            <p className="mt-5 text-sm leading-loose text-cream-50/80">
              منهج عملي احترافي وخبرة حقيقية تأخد بإيدك خطوة بخطوة، عشان تملكي مهارة تبني بيها
              مستقبلك في عالم الجمال.
            </p>

            <Button asChild size="md" className="mt-7">
              <Link href="/about">تعرفي علينا أكتر</Link>
            </Button>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <li
                  key={feature.titleAr}
                  className="flex flex-col items-center rounded-card border border-gold-500/25 bg-navy-800 px-4 py-7 text-center"
                >
                  <Icon className="size-8 text-gold-500" aria-hidden="true" />
                  <p className="mt-4 font-semibold text-gold-300">{feature.titleAr}</p>
                  <p className="mt-2 text-xs leading-relaxed text-cream-50/75">{feature.bodyAr}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
