import type { Metadata } from 'next'

import { PageHeader } from '@/components/layout/page-header'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  robots: { index: false },
}

/** PRD §9.4 — placeholder, clearly marked. See the note in terms/page.tsx. */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="سياسة الخصوصية" />

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="rounded-card border border-gold-500/40 bg-cream-50 p-6">
            <p className="font-semibold text-navy-900">⚠️ النص القانوني لسه مش جاهز</p>
            <p className="mt-3 text-sm leading-loose text-ink/80">
              الصفحة دي محتاجة نص من صاحب الأكاديمية قبل إطلاق الموقع.
            </p>
          </div>

          <div className="mt-8 text-sm leading-loose text-ink/80">
            <h2 className="text-lg text-navy-900">اللي بنجمعه فعليًا دلوقتي</h2>
            <p className="mt-3">
              لما تسجلي في النشرة البريدية أو تبعتي رسالة من صفحة التواصل، بنحفظ الاسم والإيميل
              ورقم الموبايل لو كتبتيه، عشان نقدر نرد عليكي ونبعتلك أخبار الدورات. مش بنبيع البيانات
              دي ولا بنشاركها مع حد.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
