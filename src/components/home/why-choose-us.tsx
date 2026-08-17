import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'

/**
 * What the academy stands for.
 *
 * Written as principles of the academy rather than praise of one person:
 * the founder's position is that the academy is larger than her. The
 * substance still comes from what trainees repeatedly wrote — that nothing
 * is held back, that follow-up outlives the course — but it is stated as
 * method, not as biography.
 */
const LEAD = {
  titleAr: 'المعلومة كاملة، بلا استثناء',
  bodyAr:
    'المنهج قائم على مبدأ واحد: لا خطوة تُختصر، ولا تفصيلة تُؤجَّل لدورة قادمة. أكثر ما يتكرر في رسائل المتدربين أن المعلومة وصلت كاملة — وهذا ليس أسلوب مدرّب بعينه، بل شرط على كل دورة تحمل اسم الأكاديمية، في أي مجال من مجالات الجمال.',
}

const REST = [
  {
    titleAr: 'المتابعة لا تنتهي بانتهاء الدورة',
    bodyAr: 'الأسئلة بعد التخرّج تجد إجابة، حتى بعد شهور من آخر درس.',
  },
  {
    titleAr: 'تطبيق عملي، لا شرح نظري',
    bodyAr: 'كل خطوة تُنفَّذ أمامك من البداية حتى النتيجة النهائية، لا وصف لها.',
  },
  {
    titleAr: 'الفرق في التفاصيل',
    bodyAr: 'النتيجة التي لا تدوم لا تُحتسب. اللمسات الأخيرة تأخذ حقّها من الشرح.',
  },
  {
    titleAr: 'من الصفر عند الحاجة',
    bodyAr: 'لا نفترض معرفة سابقة. كل دورة تبدأ من المستوى الذي تعلنه.',
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
          kicker="لماذا الأكاديمية"
          tone="dark"
          title={
            <>
              معايير نلتزم بها
              <br />
              في كل دورة
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
              <Link href="/about">عن الأكاديمية</Link>
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
