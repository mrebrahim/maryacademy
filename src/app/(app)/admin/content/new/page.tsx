import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { NewCourseForm } from '@/components/admin/new-course-form'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'دورة جديدة', robots: { index: false } }

export default async function NewCoursePage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ar')
    .order('sort_order')

  return (
    <div>
      <Link
        href="/admin/content"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-navy-900"
      >
        <ArrowRight className="size-4" aria-hidden="true" />
        المحتوى
      </Link>

      <h1 className="display mt-6 text-2xl text-navy-900 sm:text-3xl">دورة جديدة</h1>
      <p className="mt-3 max-w-xl text-sm leading-loose text-muted">
        الدورة بتتعمل كمسودة — مش هتظهر لحد لحد ما تضيف الدروس وتنشرها. الوصف وصورة
        الغلاف وباقي التفاصيل بتتكتب بعد كده من صفحة المحتوى.
      </p>

      <div className="mt-8 max-w-xl">
        <NewCourseForm categories={categories ?? []} />
      </div>
    </div>
  )
}
