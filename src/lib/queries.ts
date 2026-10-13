import 'server-only'

import { fallbackTestimonials } from '@/config/testimonials-fallback'
import { createAnonClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/supabase/database.types'

export type Course = Pick<
  Tables<'courses'>,
  | 'id'
  | 'title_ar'
  | 'slug'
  | 'subtitle_ar'
  | 'thumbnail_url'
  | 'lesson_count'
  | 'total_duration_minutes'
  | 'price_egp'
  | 'price_egp_intl'
  | 'compare_at_price_egp'
>

export type Category = Pick<Tables<'categories'>, 'id' | 'name_ar' | 'slug' | 'icon' | 'sort_order'>

export type Testimonial = Pick<
  Tables<'testimonials'>,
  'id' | 'name' | 'role_ar' | 'body_ar' | 'rating' | 'avatar_url' | 'source' | 'video_id'
>

/**
 * Marketing pages must never hard-fail on a database hiccup — a missing
 * section is recoverable, a 500 on the homepage is not. Each fetcher logs
 * and degrades to empty.
 */
function degrade<T>(where: string, error: unknown, fallback: T): T {
  console.error(`[queries] ${where}:`, error)
  return fallback
}

export async function getPublishedCourses(): Promise<Course[]> {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('courses')
      .select(
        'id, title_ar, slug, subtitle_ar, thumbnail_url, lesson_count, total_duration_minutes, price_egp, price_egp_intl, compare_at_price_egp',
      )
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) throw error
    return data ?? []
  } catch (error) {
    return degrade('getPublishedCourses', error, [])
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name_ar, slug, icon, sort_order')
      .order('sort_order')

    if (error) throw error
    return data ?? []
  } catch (error) {
    return degrade('getCategories', error, [])
  }
}

/**
 * Published testimonials only. RLS already hides unpublished rows, and the
 * DB refuses to publish anything without `permission_status = 'granted'`.
 * `source` comes back with every row so the UI can label it honestly
 * (PRD §9.2) — do not drop it from the select.
 */
/**
 * Published testimonials, newest-ordered by `sort_order`.
 *
 * This is the one fetcher that does not degrade to empty. The testimonials
 * section renders nothing when it has no rows, so an unreachable database
 * silently stripped the social proof out of the sales pages — the single
 * most persuasive thing on them — and left the pages looking intentionally
 * bare. The copy is fixed and already in the repository, so it falls back
 * to that rather than to nothing. See src/config/testimonials-fallback.ts.
 */
export async function getTestimonials(limit = 12): Promise<Testimonial[]> {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, name, role_ar, body_ar, rating, avatar_url, source, video_id')
      .eq('is_published', true)
      .order('sort_order')
      .limit(limit)

    if (error) throw error
    // An empty result is treated the same as a failed one: either way there
    // is nothing to show, and the fallback is better than a missing section.
    if (!data || data.length === 0) return fallbackTestimonials.slice(0, limit)
    return data
  } catch (error) {
    return degrade('getTestimonials', error, fallbackTestimonials.slice(0, limit))
  }
}

export type Lesson = Pick<
  Tables<'lessons_public'>,
  'id' | 'title_ar' | 'slug' | 'description_ar' | 'duration_seconds' | 'sort_order' | 'module_id'
>

export type CourseModule = Pick<Tables<'modules'>, 'id' | 'title_ar' | 'sort_order'> & {
  lessons: Lesson[]
}

export type CourseDetail = Tables<'courses'> & { modules: CourseModule[] }

/**
 * Full sales-page payload for one course. Lessons come from `lessons_public`,
 * never `lessons` — the view has no bunny_video_id and no attachments, so the
 * video IDs cannot leak into the marketing HTML (PRD §5.2, §6.2).
 */
export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  try {
    const supabase = createAnonClient()

    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) throw error
    if (!course) return null

    const [{ data: modules }, { data: lessons }] = await Promise.all([
      supabase
        .from('modules')
        .select('id, title_ar, sort_order')
        .eq('course_id', course.id)
        .order('sort_order'),
      supabase
        .from('lessons_public')
        .select('id, title_ar, slug, description_ar, duration_seconds, sort_order, module_id')
        .eq('course_id', course.id)
        .order('sort_order'),
    ])

    return {
      ...course,
      modules: (modules ?? []).map((m) => ({
        ...m,
        lessons: (lessons ?? []).filter((l) => l.module_id === m.id),
      })),
    }
  } catch (error) {
    return degrade(`getCourseBySlug(${slug})`, error, null)
  }
}

/** Slugs for generateStaticParams. */
export async function getPublishedCourseSlugs(): Promise<string[]> {
  const courses = await getPublishedCourses()
  return courses.map((c) => c.slug)
}

export type Post = Pick<Tables<'posts'>, 'id' | 'title_ar' | 'slug' | 'excerpt_ar' | 'published_at'>

export async function getPublishedPosts(): Promise<Post[]> {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase
      .from('posts')
      .select('id, title_ar, slug, excerpt_ar, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) throw error
    return data ?? []
  } catch (error) {
    return degrade('getPublishedPosts', error, [])
  }
}
