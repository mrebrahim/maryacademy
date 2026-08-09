import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'

/**
 * Differentiators.
 *
 * Five identical icon cards in an even row said "template" louder than
 * anything else on the page, so the grid is gone. What replaces it is an
 * editorial list: the first item is given real weight because it is the
 * actual differentiator — she does not hold information back — and the rest
 * sit under it as a plain numbered list.
 *
 * Every line traces to something a trainee wrote in the screenshots, not to
 * a generic feature vocabulary.
 */
const LEAD = {
  titleAr: 'مش بتبخل بمعلومة',
  bodyAr:
    'أكتر حاجة بتتكرر في كلام المتدربات إن المعلومة بتتقال كاملة. مفيش خطوة بتتخبّى عشان ترجعي تاني، ومفيش «ده سر المهنة».',
}

const REST = [
  {
    titleAr: 'المتابعة مش بتقف',
    bodyAr: 'بعد الكورس بشهور، لسه بترد على أسئلة متدربات بدأوا شغل وواجهوا مشكلة.',
  },
  {
    titleAr: 'شغل حقيقي، مش نظري',
    bodyAr: 'كل درس بيتنفّذ على شعر حقيقي من أول التقسيم لآخر لمسة فينش.',
  },
  {
    titleAr: 'الفينش هو الفرق',
    bodyAr: 'التسريحة اللي بتقع بعد ساعتين مش تسريحة. التثبيت بياخد وقته في الشرح.',
  },
  {
    titleAr: 'من الصفر لو محتاجة',
    bodyAr: 'مفيش افتراض إنك عارفة حاجة. الكورس بيبدأ من إمساك الفرشاة.',
  },
] as const

export function WhyChooseUs() {
  return (
    <section aria-labelledby="why-heading" className="grain relative overflow-hidden bg-navy-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_0%,rgba(201,162,75,0.14),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading
          id="why-heading"
          kicker="ليه إحنا"
          tone="dark"
          title={
            <>
              مش أكتر أكاديمية،
              <br />
              بس اللي بتقول كل حاجة
            </>
          }
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* The one that carries the weight. */}
          <div className="relative">
            <span
              className="absolute -top-6 -start-2 font-display text-8xl leading-none text-gold-500/12 select-none"
              aria-hidden="true"
            >
              »
            </span>
            <h3 className="relative text-2xl text-gold-300 sm:text-3xl">{LEAD.titleAr}</h3>
            <p className="relative mt-5 text-base leading-loose text-cream-50/80 sm:text-lg">
              {LEAD.bodyAr}
            </p>

            <Button asChild variant="secondary" size="md" className="mt-9">
              <Link href="/about">اعرفي أكتر</Link>
            </Button>
          </div>

          <ul className="divide-y divide-white/8 border-y border-white/8">
            {REST.map((item) => (
              <li key={item.titleAr} className="py-6">
                <h3 className="text-lg text-white">{item.titleAr}</h3>
                <p className="mt-2 text-sm leading-loose text-cream-50/65">{item.bodyAr}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
