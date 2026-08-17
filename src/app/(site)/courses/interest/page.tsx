import type { Metadata } from 'next'

import { submitCourseInterest } from '@/app/actions/interest'
import { LeadForm } from '@/components/forms/lead-form'
import { PageHeader } from '@/components/layout/page-header'

export const metadata: Metadata = {
  title: 'تسجيل الاهتمام',
  description: 'سجّل اهتمامك بالدورات القادمة لتصلك أخبارها فور إتاحتها.',
  robots: { index: false },
}

export default function CourseInterestPage() {
  return (
    <>
      <PageHeader
        title="تسجيل الاهتمام"
        subtitle="هذه الدورة قيد الإعداد. سجّل بياناتك لتصلك أخبارها فور إتاحتها، مع أولوية في العرض الأول."
      />

      <section className="bg-cream-50">
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-20">
          <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-navy-900/5 sm:p-8">
            <LeadForm
              action={submitCourseInterest}
              submitLabel="تسجيل الاهتمام"
              withMessage={false}
            />
          </div>
        </div>
      </section>
    </>
  )
}
