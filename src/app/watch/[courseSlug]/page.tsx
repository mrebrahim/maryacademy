import { notFound, redirect } from 'next/navigation'

import { getViewer, getWatchCourse } from '@/lib/learn'

/**
 * Entry point for a course: drops you where you left off.
 *
 * For an enrolled student that is the first lesson they have not finished;
 * for everyone else it is the first free preview, so the link is never a
 * dead end for a visitor. A course with neither goes to its sales page.
 */
export default async function WatchCourseIndex({
  params,
}: {
  params: Promise<{ courseSlug: string }>
}) {
  const { courseSlug } = await params

  const course = await getWatchCourse(courseSlug)
  if (!course) notFound()

  const viewer = await getViewer(course.id)

  const target = viewer.isEnrolled
    ? (course.ordered.find((l) => !viewer.completedLessonIds.has(l.id)) ?? course.ordered[0])
    : course.ordered.find((l) => l.is_free_preview)

  if (!target) redirect(`/courses/${course.slug}`)

  redirect(`/watch/${course.slug}/${target.slug}`)
}
