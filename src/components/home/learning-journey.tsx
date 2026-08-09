import { CreditCard, GraduationCap, MonitorPlay, UserPlus } from 'lucide-react'

import { SectionHeading } from '@/components/ui/section-heading'

/**
 * "How it works". A self-paced course is an unfamiliar purchase for most of
 * this audience — spelling out the four steps removes the main hesitation
 * before checkout.
 */
const STEPS = [
  {
    icon: UserPlus,
    titleAr: 'اعملي حساب',
    bodyAr: 'دقيقة واحدة — اسمك وإيميلك ورقمك وبس.',
  },
  {
    icon: CreditCard,
    titleAr: 'احجزي مكانك',
    bodyAr: 'حوّلي قيمة الكورس، ويتفعّل حسابك على طول.',
  },
  {
    icon: MonitorPlay,
    titleAr: 'اتفرجي واتدربي',
    bodyAr: 'دروس مقسّمة بالترتيب، اتفرجي في وقتك وارجعي لأي درس وقت ما تحبي.',
  },
  {
    icon: GraduationCap,
    titleAr: 'استلمي شهادتك',
    bodyAr: 'لما تخلّصي كل الدروس، الشهادة بتتولد باسمك برقم يتحقق منه.',
  },
] as const

export function LearningJourney() {
  return (
    <section aria-labelledby="journey-heading" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          title="إزاي بتذاكري معانا؟"
          subtitle="أربع خطوات بس، من غير مواعيد ولا مواصلات ولا ضغط."
        />

        <ol className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting hairline, desktop only */}
          <span
            className="absolute inset-x-0 top-7 hidden h-px bg-gradient-to-l from-transparent via-gold-500/35 to-transparent lg:block"
            aria-hidden="true"
          />

          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <li key={step.titleAr} className="relative text-center">
                <span className="relative mx-auto grid size-14 place-items-center rounded-full border border-gold-500/40 bg-cream-50 text-gold-500">
                  <Icon className="size-6" aria-hidden="true" />
                  <span className="tabular absolute -top-1 -end-1 grid size-6 place-items-center rounded-full bg-navy-900 text-xs font-bold text-gold-500">
                    {index + 1}
                  </span>
                </span>

                <h3 className="mt-5 text-lg text-navy-900">{step.titleAr}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
                  {step.bodyAr}
                </p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
