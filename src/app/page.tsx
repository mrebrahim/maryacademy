import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { academyStats, whatsappLink } from '@/config/site'

/**
 * Phase 1 delivers the hero and the stats bar — sections 1 and 2 of the
 * homepage in PRD §7.1. The remaining sections (courses grid, why-us,
 * testimonials, newsletter) land in Phase 2.
 */
export default function HomePage() {
  return (
    <>
      {/* ---- Hero (PRD §7.1.1) ---- */}
      <section className="relative overflow-hidden bg-navy-900">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,162,75,0.18),transparent_60%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="font-display text-sm tracking-[0.3em] text-gold-500">
            أكاديمية ماري رجائي للتجميل
          </p>

          <h1 className="mx-auto mt-6 max-w-3xl text-3xl text-white sm:text-4xl md:text-5xl">
            تعلمي باحتراف وابدئي مستقبلك في عالم الجمال
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream-50/85 sm:text-lg">
            كورسات عملية أونلاين في تصفيف الشعر والمكياج والعناية بالبشرة، من خبرة أكتر من 5 سنين
            تدريب حضوري لأكتر من 400 متدربة.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/courses">استكشفي الدورات</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                تواصلي معنا
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ---- Stats bar (PRD §7.1.2) ----
          Values come from config, and every figure carries the
          in-person-training label required by PRD §9.2. */}
      <section aria-label="أرقام الأكاديمية" className="bg-cream-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {academyStats.map((stat) => (
            <div key={stat.labelAr} className="text-center">
              <p className="tabular font-display text-3xl text-gold-500 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 font-semibold text-navy-900">{stat.labelAr}</p>
              <p className="mt-1 text-sm text-muted">{stat.contextAr}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
