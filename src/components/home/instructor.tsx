import { CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Ornament } from '@/components/ui/brand-mark'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { brandAssets, HAS_INSTRUCTOR_IMAGE } from '@/config/assets'

/**
 * Instructor block. On a teaching site the trainer is the product, so this
 * carries the credibility the stats bar only summarises.
 *
 * Every claim here traces to the client brief — 5+ years, 40+ in-person
 * rounds, 400+ trainees. Nothing is embellished.
 */
const CREDENTIALS = [
  'أكتر من 5 سنين في تدريب تصفيف الشعر والتجميل',
  'أكتر من 40 دورة تدريبية حضورية',
  'أكتر من 400 متدربة ومتدرب من كل محافظات مصر',
  'متخصصة في تسريحات العرايس والمناسبات',
] as const

export function Instructor() {
  return (
    <section aria-labelledby="instructor-heading" className="bg-cream-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
          {/* Portrait slot — replaced by the real photo when supplied. */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 rounded-card border border-gold-500/30" aria-hidden="true" />
            <div className="relative grid aspect-4/5 place-items-center overflow-hidden rounded-card bg-gradient-to-b from-navy-800 to-navy-900">
              {HAS_INSTRUCTOR_IMAGE ? (
                <Image
                  src={brandAssets.instructor}
                  alt="ماري رجائي"
                  fill
                  sizes="(min-width: 1024px) 30vw, 90vw"
                  className="object-cover"
                />
              ) : (
                <Logo variant="full" className="size-2/3 opacity-90" />
              )}
            </div>
          </div>

          <div className="text-center lg:text-start">
            <p className="font-display text-sm tracking-[0.25em] text-gold-500">مدرّبة الأكاديمية</p>

            <h2 id="instructor-heading" className="mt-4 text-2xl text-navy-900 sm:text-3xl">
              ماري رجائي
            </h2>

            <Ornament className="mx-auto mt-4 h-7 w-52 lg:mx-0" />

            <p className="mt-6 text-base leading-loose text-ink/80">
              بدأت من الصفر زي أي حد، واتعلمت بالتجربة والغلط قبل ما المجال يبقى فيه كورسات محترمة.
              علشان كده لما بدأت أدرّب، قررت أدّي المعلومة كاملة من غير ما أخبّي حاجة — لأن ده اللي
              كنت محتاجاه أنا وأنا ببدأ.
            </p>

            <p className="mt-4 text-base leading-loose text-ink/80">
              على مدار أكتر من خمس سنين اتدرب معايا مئات البنات حضوريًا، ودلوقتي نفس المنهج بقى
              متاح أونلاين — بنفس التفاصيل، وبنفس المتابعة بعد الكورس.
            </p>

            <ul className="mt-7 grid gap-3 text-start sm:grid-cols-2">
              {CREDENTIALS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold-500" aria-hidden="true" />
                  <span className="text-sm leading-relaxed text-ink/85">{item}</span>
                </li>
              ))}
            </ul>

            <Button asChild variant="tertiary" size="md" className="mt-8">
              <Link href="/about">اعرفي أكتر عن الأكاديمية</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
