import { SectionHeading } from '@/components/ui/section-heading'

/**
 * "How it works".
 *
 * Step titles are verbal nouns — إنشاء، تأكيد، مشاهدة، استلام — rather than
 * imperatives, so they read the same to a man and a woman. Arabic
 * imperatives are gendered and the first pass was feminine throughout.
 *
 * Typographic rather than iconographic: four oversized numerals carry the
 * sequence, staggered so the row reads as a descending path instead of four
 * matching tiles.
 */
const STEPS = [
  {
    n: '01',
    titleAr: 'إنشاء حساب',
    bodyAr: 'دقيقة واحدة: الاسم، البريد الإلكتروني، ورقم الهاتف.',
  },
  {
    n: '02',
    titleAr: 'تأكيد الحجز',
    bodyAr: 'تحويل قيمة الدورة عبر إنستا باي، ويُفعَّل الحساب مباشرة.',
  },
  {
    n: '03',
    titleAr: 'المشاهدة والتطبيق',
    bodyAr: 'دروس مرتّبة تُشاهَد في أي وقت، مع إمكانية الرجوع لأي درس.',
  },
  {
    n: '04',
    titleAr: 'استلام الشهادة',
    bodyAr: 'بعد إتمام الدروس تصدر شهادة باسمك، برقم يمكن التحقق منه.',
  },
] as const

export function LearningJourney() {
  return (
    <section aria-labelledby="journey-heading" className="relative bg-ivory">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-16">
          <SectionHeading
            id="journey-heading"
            kicker="الطريقة"
            title={
              <>
                كيف تسير
                <br />
                رحلة التعلّم؟
              </>
            }
          />
          <p className="max-w-md text-base leading-loose text-muted lg:pb-3">
            بلا مواعيد ثابتة، وبلا التزام بمكان. أنت من يحدد الوقت والوتيرة.
          </p>
        </div>

        <ol className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.n}
              // Each step sits a little lower than the last, so the row reads
              // as a descending path rather than four matching tiles.
              className={['', 'lg:translate-y-6', 'lg:translate-y-12', 'lg:translate-y-18'][index]}
            >
              <p className="tabular font-display text-5xl leading-none text-gold-500/35 sm:text-6xl">
                {step.n}
              </p>
              <div className="mt-5 border-t border-navy-900/12 pt-5">
                <h3 className="text-xl text-navy-900">{step.titleAr}</h3>
                <p className="mt-2.5 max-w-[24ch] text-sm leading-loose text-muted">{step.bodyAr}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
