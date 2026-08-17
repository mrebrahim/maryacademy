import type { Metadata } from 'next'

import { PageHeader } from '@/components/layout/page-header'

export const metadata: Metadata = {
  title: 'الشروط والأحكام',
  robots: { index: false },
}

/**
 * PRD §9.4: legal copy is supplied by the client and blocks go-live. The page
 * ships with the placeholder plainly marked rather than with invented terms —
 * made-up terms are worse than none, because they read as binding.
 */
export default function TermsPage() {
  return (
    <>
      <PageHeader title="الشروط والأحكام" />

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="rounded-card border border-gold-500/40 bg-cream-50 p-6">
            <p className="font-semibold text-navy-900">⚠️ النص القانوني لسه مش جاهز</p>
            <p className="mt-3 text-sm leading-loose text-ink/80">
              هذه الصفحة بانتظار النص القانوني من إدارة الأكاديمية قبل إطلاق الموقع. حتى ذلك الحين، لأي
              استفسار عن شروط الاشتراك يرجى التواصل معنا مباشرة.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
