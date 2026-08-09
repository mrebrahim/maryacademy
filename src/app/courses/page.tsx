import type { Metadata } from 'next'

import { CoursesGrid } from '@/components/home/courses-grid'
import { PageHeader } from '@/components/layout/page-header'
import { getCategories, getPublishedCourses } from '@/lib/queries'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'الدورات',
  description:
    'دورات أونلاين في تصفيف الشعر والصبغة والقص والمكياج والعناية بالبشرة، بمنهج عملي خطوة بخطوة.',
}

export default async function CoursesPage() {
  const [courses, categories] = await Promise.all([getPublishedCourses(), getCategories()])

  return (
    <>
      <PageHeader
        title="الدورات"
        subtitle="بنبدأ بكورس تصفيف الشعر الاحترافي، وباقي الدورات في الطريق. سجلي اهتمامك في أي دورة وهنبلغك أول ما تنزل."
      />
      <CoursesGrid courses={courses} categories={categories} />
    </>
  )
}
