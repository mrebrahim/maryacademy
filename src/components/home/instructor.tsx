import { CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { brandAssets, HAS_INSTRUCTOR_IMAGE } from '@/config/assets'

/**
 * Founder block.
 *
 * Deliberately not "meet your trainer". The founder's position is that the
 * academy is an entity she is responsible for, not a personal brand: she
 * built the method and the track record, and the academy now carries it
 * forward with other specialists. So the copy attributes the history to her
 * by name, in the third person, and hands the present tense to the academy.
 *
 * Every figure traces to the client brief — 5+ years, 40+ in-person rounds,
 * 400+ trainees. Nothing embellished.
 */
const CREDENTIALS = [
  'أكثر من 5 سنوات في تدريب تصفيف الشعر والتجميل',
  'أكثر من 40 دورة تدريبية حضورية',
  'أكثر من 400 متدرب ومتدربة من مختلف محافظات مصر',
  'تخصص في تسريحات العرائس والمناسبات',
] as const

export function Instructor() {
  return (
    <section aria-labelledby="founder-heading" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
          {/* Portrait slot — replaced by the real photo when supplied. */}
          <div className="relative mx-auto w-full max-w-sm">
            <div
              className="absolute -inset-3 rounded-card border border-gold-500/30"
              aria-hidden="true"
            />
            <div className="relative grid aspect-4/5 place-items-center overflow-hidden rounded-card bg-gradient-to-b from-navy-800 to-navy-900">
              {HAS_INSTRUCTOR_IMAGE ? (
                <Image
                  src={brandAssets.instructor}
                  alt="Marie Ragaie"
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
            <p className="kicker flex items-center justify-center gap-3 lg:justify-start">
              <span className="h-px w-8 bg-gold-500/70" aria-hidden="true" />
              المؤسِّسة
            </p>

            <h2 id="founder-heading" className="latin mt-4 text-3xl text-navy-900 sm:text-4xl">
              Marie Ragaie
            </h2>

            <p className="mt-6 text-base leading-loose text-ink/80">
              على مدار أكثر من <span className="tabular">5</span> سنوات، قدّمت ماري تدريبات حضورية
              لأكثر من <span className="tabular">400</span> متدرب ومتدربة من مختلف محافظات مصر،
              وأسّست منهجًا تدريبيًا يجمع بين الخبرة العملية والتطبيق الحقيقي.
            </p>

            <p className="mt-4 text-base leading-loose text-ink/80">
              واليوم، تمتد هذه الرؤية من خلال{' '}
              <span className="latin text-navy-900">Marie Ragaie Beauty Academy</span>، بمشاركة
              مجموعة من المتخصصين في مختلف مجالات الـ<span className="latin">Beauty</span>.
            </p>

            <ul className="mt-7 grid gap-3 text-start sm:grid-cols-2">
              {CREDENTIALS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 size-5 shrink-0 text-gold-500"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed text-ink/85">{item}</span>
                </li>
              ))}
            </ul>

            <Button asChild variant="tertiary" size="md" className="mt-8">
              <Link href="/about">المزيد عن الأكاديمية</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
