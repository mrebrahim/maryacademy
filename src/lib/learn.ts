import { createClient } from '@/lib/supabase/server'

/**
 * Data for the lesson player.
 *
 * Unlike src/lib/queries.ts — which uses the cookie-free anon client so the
 * marketing pages can stay static — everything here is per-request and
 * per-user: whether you are enrolled, which lessons you have finished, and
 * whether this particular lesson is one you may watch.
 *
 * Lessons are read from `lessons_public`. That view carries no
 * bunny_video_id, so nothing in this file can leak one; the id is fetched
 * separately through get_lesson_video(), which re-checks access in the
 * database.
 */

/**
 * Every column of `lessons_public` is nullable in the generated types —
 * views carry no NOT NULL information — but the underlying table declares
 * them NOT NULL. Narrowing once at the query boundary keeps that `?? ''`
 * noise out of every component that renders a lesson.
 */
export type WatchLesson = {
  id: string
  title_ar: string
  slug: string
  description_ar: string | null
  duration_seconds: number
  sort_order: number
  module_id: string
  is_free_preview: boolean
}

export type WatchModule = {
  id: string
  title_ar: string
  sort_order: number
  lessons: WatchLesson[]
}

export type WatchCourse = {
  id: string
  slug: string
  title_ar: string
  modules: WatchModule[]
  /** Flat, in play order — the source of truth for previous/next. */
  ordered: WatchLesson[]
}

export async function getWatchCourse(slug: string): Promise<WatchCourse | null> {
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title_ar')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!course) return null

  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase
      .from('modules')
      .select('id, title_ar, sort_order')
      .eq('course_id', course.id)
      .order('sort_order'),
    supabase
      .from('lessons_public')
      .select(
        'id, title_ar, slug, description_ar, duration_seconds, sort_order, module_id, is_free_preview',
      )
      .eq('course_id', course.id)
      .order('sort_order'),
  ])

  const all: WatchLesson[] = (lessons ?? [])
    .filter((l) => l.id && l.slug && l.module_id)
    .map((l) => ({
      id: l.id!,
      title_ar: l.title_ar ?? '',
      slug: l.slug!,
      description_ar: l.description_ar,
      duration_seconds: l.duration_seconds ?? 0,
      sort_order: l.sort_order ?? 0,
      module_id: l.module_id!,
      is_free_preview: l.is_free_preview ?? false,
    }))

  const orderedModules = (modules ?? []).map((m) => ({
    ...m,
    lessons: all.filter((l) => l.module_id === m.id),
  }))

  return {
    ...course,
    modules: orderedModules,
    // Play order follows the modules, not the raw lesson sort_order, which
    // only orders lessons within their own module.
    ordered: orderedModules.flatMap((m) => m.lessons),
  }
}

export type Viewer = {
  userId: string | null
  isEnrolled: boolean
  enrollmentId: string | null
  completedLessonIds: Set<string>
}

export async function getViewer(courseId: string): Promise<Viewer> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { userId: null, isEnrolled: false, enrollmentId: null, completedLessonIds: new Set() }
  }

  // Filtered by user_id explicitly, not left to RLS: the enrolments policy
  // also admits admins, so without this an admin would be treated as
  // enrolled on every course in the catalogue.
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!enrollment) {
    return { userId: user.id, isEnrolled: false, enrollmentId: null, completedLessonIds: new Set() }
  }

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('enrollment_id', enrollment.id)
    .eq('is_completed', true)

  return {
    userId: user.id,
    isEnrolled: true,
    enrollmentId: enrollment.id,
    completedLessonIds: new Set((progress ?? []).map((row) => row.lesson_id)),
  }
}

/**
 * The video id for a lesson, or null if the caller may not watch it.
 *
 * The database function raises rather than returning null when access is
 * refused, which is the right shape there — it makes the refusal impossible
 * to ignore — but the caller here just wants to know whether to render a
 * player or a paywall.
 */
export async function getLessonVideoId(lessonId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_lesson_video', { p_lesson_id: lessonId })

  if (error) {
    if (!error.message.includes('no_access')) {
      console.error('[getLessonVideoId]', error)
    }
    return null
  }

  return data ?? null
}
