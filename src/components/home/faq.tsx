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
    q: 'لا أملك أي خبرة سابقة — هل تناسبني الدورة؟',
    a: 'نعم. تبدأ الدورة من إمساك الفرشاة وأساسيات السشوار، وتتدرّج خطوة بخطوة حتى تسريحات العرائس الكاملة. لا تُفترض أي معرفة سابقة.',
  },
  {
    q: 'هل أحصل على شهادة؟',
    a: 'نعم. بعد إتمام جميع الدروس تصدر شهادة إتمام باسمك، وتحمل رقمًا يمكن لأي جهة التحقق منه عبر الموقع.',
  },
  {
    q: 'ما الأدوات المطلوبة للتدريب؟',
    a: 'الأساسيات فقط: فرشاة، سشوار، بيبي ليس، دبابيس، وإسبراي تثبيت. ويوضّح الدرس الأول ما يلزم اقتناؤه من البداية وما يمكن تأجيله.',
  },
  {
    q: 'على من أتدرّب أثناء الدورة؟',
    a: 'يمكن التدريب على موديل — قريب أو صديق — أو على رأس تدريب. كلاهما مناسب، والفرق بينهما موضّح داخل الدروس.',
  },
  {
    q: 'هل يمكنني طرح الأسئلة إذا واجهت صعوبة؟',
    a: 'نعم. المتابعة مستمرة بعد انتهاء الدورة، ويمكن إرسال الأسئلة في أي وقت.',
  },
  {
    q: 'هل يعمل الموقع على الهاتف؟',
    a: 'نعم، الموقع يعمل على الهاتف والجهاز اللوحي والحاسوب، ويمكن متابعة الدروس من أي جهاز بدءًا من النقطة التي توقفت عندها.',
  },
] as const

export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="bg-ivory">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
        <SectionHeading
          id="faq-heading"
          kicker="أسئلة شائعة"
          title={
            <>
              الأسئلة
              <br />
              الأكثر تكرارًا
            </>
          }
          subtitle="إذا لم يكن سؤالك هنا، أرسله عبر واتساب وسنجيبك."
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
