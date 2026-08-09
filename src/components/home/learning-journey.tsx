import { SectionHeading } from '@/components/ui/section-heading'

/**
 * "How it works".
 *
 * Typographic rather than iconographic: four oversized numerals carry the
 * sequence. The previous version — an icon in a circle, a badge, a caption,
 * repeated four times across an even grid — is the single most template-like
 * shape on the web, and it was doing no work an ordinal doesn't do better.
 *
 * The steps are also staggered vertically so the row reads as a path instead
 * of a set of matching tiles.
 */
const STEPS = [
  {
    n: '01',
    titleAr: 'اعملي حساب',
    bodyAr: 'دقيقة واحدة — اسمك وإيميلك ورقمك.',
  },
  {
    n: '02',
    titleAr: 'احجزي مكانك',
    bodyAr: 'حوّلي قيمة الكورس على إنستا باي، ويتفعّل حسابك.',
  },
  {
    n: '03',
    titleAr: 'اتفرجي واتدربي',
    bodyAr: 'دروس بالترتيب، بتتفرجي في وقتك وبترجعي لأي درس وقت ما تحبي.',
  },
  {
    n: '04',
    titleAr: 'استلمي شهادتك',
    bodyAr: 'بعد آخر درس، الشهادة بتتولد باسمك برقم يتحقق منه.',
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
                إزاي بتذاكري
                <br />
                معانا؟
              </>
            }
          />
          <p className="max-w-md text-base leading-loose text-muted lg:pb-3">
            من غير مواعيد، ولا مواصلات، ولا حد يستناكي. إنتي اللي بتحددي إمتى وقد إيه.
          </p>
        </div>

        <ol className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.n}
              // Each step sits a little lower than the last, so the row reads
              // as a descending path rather than four matching tiles.
              className={
                ['', 'lg:translate-y-6', 'lg:translate-y-12', 'lg:translate-y-18'][index]
              }
            >
              <p className="tabular font-display text-5xl leading-none text-gold-500/35 sm:text-6xl">
                {step.n}
              </p>
              <div className="mt-5 border-t border-navy-900/12 pt-5">
                <h3 className="text-xl text-navy-900">{step.titleAr}</h3>
                <p className="mt-2.5 max-w-[22ch] text-sm leading-loose text-muted">
                  {step.bodyAr}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
