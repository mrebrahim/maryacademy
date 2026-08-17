import { Award, Clock, Infinity as InfinityIcon, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { HeroSwirl } from '@/components/ui/brand-mark'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { brandAssets, HAS_HERO_IMAGE } from '@/config/assets'
import { siteConfig, whatsappLink } from '@/config/site'

const TRUST = [
  { icon: PlayCircle, labelAr: 'دروس عملية بالفيديو' },
  { icon: Clock, labelAr: 'تعلّم في وقتك' },
  { icon: Award, labelAr: 'شهادة إتمام' },
  { icon: InfinityIcon, labelAr: 'وصول دائم للمحتوى' },
] as const

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      {/* Layered decoration: radial glow, gold swirls, soft vignette. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,rgba(201,162,75,0.22),transparent_55%)]"
        aria-hidden="true"
      />
      <HeroSwirl className="pointer-events-none absolute -start-24 -bottom-16 h-[34rem] w-[34rem] text-gold-500 opacity-70" />
      <HeroSwirl className="pointer-events-none absolute -end-32 -top-24 h-[28rem] w-[28rem] scale-x-[-1] text-gold-300 opacity-30" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-24">
        {/* ---- Copy ---- */}
        <div className="text-center lg:text-start">
          {/* The brand name leads in Latin, set in the same serif as the
              logo wordmark. The Arabic positioning line carries the meaning
              — and the Arabic keywords — directly underneath. */}
          <p className="latin text-sm tracking-[0.35em] text-gold-500 uppercase">Welcome to</p>

          <h1 className="latin mt-4 text-[2rem] leading-tight text-white sm:text-5xl lg:text-[3.5rem]">
            Marie Ragaie
            <span className="mt-1 block text-gold-500">Beauty Academy</span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-base leading-loose text-gold-300 sm:text-lg lg:mx-0">
            {siteConfig.positioningAr}
          </p>

          <p className="mx-auto mt-5 max-w-xl text-base leading-loose text-cream-50/80 lg:mx-0">
            خبرة تم نقلها لأكثر من <span className="tabular font-medium text-white">400</span> متدرب
            ومتدربة من مختلف محافظات مصر، والآن أصبحت متاحة لك أونلاين، من أي مكان وفي الوقت الذي
            يناسبك.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/courses">تصفّح الدورات</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                تواصل معنا
              </a>
            </Button>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-7 sm:grid-cols-4">
            {TRUST.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.labelAr} className="flex flex-col items-center gap-2 lg:items-start">
                  <Icon className="size-5 text-gold-500" aria-hidden="true" />
                  <span className="text-xs leading-snug text-cream-50/75">{item.labelAr}</span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* ---- Visual ----
            The photograph takes over once it exists; until then the brand
            lockup holds the composition on its own. */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          {HAS_HERO_IMAGE ? (
            <div className="relative aspect-4/5 overflow-hidden rounded-card ring-1 ring-gold-500/25">
              <Image
                src={brandAssets.hero}
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                priority
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent"
                aria-hidden="true"
              />
              <Logo variant="full" className="absolute inset-x-6 bottom-6 w-2/5" />
            </div>
          ) : (
            <div className="relative aspect-square">
              <div
                className="absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(201,162,75,0.22),transparent_65%)] blur-xl"
                aria-hidden="true"
              />
              <Logo
                variant="full"
                priority
                className="relative size-full drop-shadow-[0_0_40px_rgba(201,162,75,0.25)]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
