import { Check } from 'lucide-react'
import type { Metadata } from 'next'

import { TrainerForm } from '@/components/forms/trainer-form'
import { PageHeader } from '@/components/layout/page-header'
import { SectionHeading } from '@/components/ui/section-heading'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'كن مدرّبًا معنا',
  description:
    'الأكاديمية تجمع نخبة من المتخصصين في مجالات الجمال المختلفة. قدّم طلبك للتدريس معنا.',
  alternates: { canonical: '/teach' },
}

/**
 * "Be a trainer with us".
 *
 * This page is the positioning made concrete: the academy is a house that
 * gathers specialists under Marie's supervision, not one person's brand.
 * Saying that on the about page and having no way in would be a claim
 * without a door.
 *
 * What it promises is deliberately modest — a review and a conversation.
 * Nothing about revenue share or contract terms, because those are the
 * academy's to decide and a sales page is the wrong place to invent them.
 */
export default function TeachPage() {
  const whatWeLookFor = [
    'خبرة عملية حقيقية في مجالك — مش شهادات بس',
    'قدرة على الشرح خطوة بخطوة، بالتفاصيل اللي الفيديوهات بتعدّي عليها',
    'استعداد تصوّر محتوى بجودة كويسة (وإحنا بنساعد في التنظيم والتصوير)',
    'التزام بالرد على أسئلة المتدربين بعد الكورس',
  ]

  return (
    <>
      <PageHeader
        title="كن مدرّبًا معنا"
        subtitle={`${siteConfig.nameAr} — أكاديمية تجمع نخبة من المتخصصين في مجالات الجمال المختلفة.`}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading kicker="للمدرّبين" title="بندوّر على مين" />

          <ul className="mt-10 space-y-4">
            {whatWeLookFor.map((item) => (
              <li key={item} className="flex gap-3 leading-loose text-ink/85">
                <Check className="mt-1.5 size-5 shrink-0 text-gold-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-8 leading-loose text-muted">
            لو ده ينطبق عليك، سيب بياناتك وهنراجع طلبك ونتواصل معاك نتكلم في التفاصيل.
          </p>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5 sm:p-9">
            <h2 className="display text-2xl text-navy-900">قدّم طلبك</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              كل البيانات دي بتوصل للإدارة مباشرة، ومش بتظهر في أي مكان على الموقع.
            </p>
            <div className="mt-7">
              <TrainerForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
