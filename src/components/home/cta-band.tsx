import Link from 'next/link'

import { HeroSwirl } from '@/components/ui/brand-mark'
import { Button } from '@/components/ui/button'
import { whatsappLink } from '@/config/site'

/** Closing conversion band, right before the footer. */
export function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="relative overflow-hidden bg-navy-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_50%_0%,rgba(201,162,75,0.2),transparent_60%)]"
        aria-hidden="true"
      />
      <HeroSwirl className="pointer-events-none absolute -end-20 -bottom-32 h-96 w-96 text-gold-500 opacity-30" />

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <h2 id="cta-heading" className="display text-4xl text-white sm:text-5xl">
          الخطوة الأولى تبدأ من هنا
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-base leading-loose text-cream-50/85">
          كل يوم يمر في متابعة فيديوهات متفرقة، هو يوم كان يمكن أن يكون تعلّمًا منظّمًا ينتهي
          بشهادة. ابدأ الآن.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/courses">تصفّح الدورات</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <a
              href={whatsappLink('السلام عليكم، لديّ استفسار عن الدورة')}
              target="_blank"
              rel="noopener noreferrer"
            >
              لديّ استفسار
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
