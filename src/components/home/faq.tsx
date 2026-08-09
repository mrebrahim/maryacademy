import { ChevronDown } from 'lucide-react'

import { SectionHeading } from '@/components/ui/section-heading'

/**
 * Native <details> accordion — keyboard accessible and works without JS,
 * which matters on the slow mobile connections most of this audience uses.
 *
 * Refund terms and access duration are deliberately absent: the client asked
 * for neither topic to appear on the site.
 */
const FAQS = [
  {
    q: 'أنا مبتدئة خالص، الكورس هينفع معايا؟',
    a: 'أيوة. الكورس بيبدأ من إمساك الفرشاة وأساسيات السشوار، وبيمشي معاكِ خطوة بخطوة لحد تسريحات العرايس الكاملة. مش مطلوب منك أي خبرة سابقة.',
  },
  {
    q: 'هستلم شهادة؟',
    a: 'أيوة. أول ما تخلّصي كل الدروس بتتولد شهادة إتمام باسمك، ولها رقم أي حد يقدر يتحقق منه من على الموقع.',
  },
  {
    q: 'محتاجة أدوات إيه عشان أتدرب؟',
    a: 'الأساسيات بس: فرشاة، سشوار، بيبي ليس، دبابيس، وإسبراي تثبيت. وفي أول درس بنقولك بالتفصيل إيه اللي محتاجاه من البداية وإيه اللي تقدري تأجليه.',
  },
  {
    q: 'أتدرب على مين؟',
    a: 'تقدري تتدربي على موديل — صاحبة أو قريبة — أو على رأس تدريب. الاتنين شغالين، وبنوضح الفرق في الدروس.',
  },
  {
    q: 'أقدر أسأل لو وقفت في حاجة؟',
    a: 'أيوة. المتابعة بتكمل بعد الكورس، وتقدري تبعتي سؤالك في أي وقت.',
  },
  {
    q: 'أقدر أتفرج من الموبايل؟',
    a: 'أيوة، الموقع شغال على الموبايل والتابلت واللابتوب، وتقدري تكملي من أي جهاز من نفس النقطة اللي وقفتي عندها.',
  },
] as const

export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="bg-ivory">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
        <SectionHeading
          id="faq-heading"
          kicker="أسئلة"
          title={
            <>
              اللي بيتسأل
              <br />
              كتير
            </>
          }
          subtitle="لو سؤالك مش هنا، ابعتيه على واتساب وهنرد."
          className="lg:sticky lg:top-28 lg:self-start"
        />

        <div className="divide-y divide-navy-900/10 border-y border-navy-900/10">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-start">
                <span className="font-semibold text-navy-900">{faq.q}</span>
                <ChevronDown
                  className="size-5 shrink-0 text-gold-500 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-3 pe-9 text-sm leading-loose text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
