import 'server-only'

import { createClient } from '@/lib/supabase/server'
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
  | 'compare_at_price_egp'
>

export type Category = Pick<Tables<'categories'>, 'id' | 'name_ar' | 'slug' | 'icon' | 'sort_order'>

export type Testimonial = Pick<
  Tables<'testimonials'>,
  'id' | 'name' | 'role_ar' | 'body_ar' | 'rating' | 'avatar_url' | 'source'
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
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('courses')
      .select(
        'id, title_ar, slug, subtitle_ar, thumbnail_url, lesson_count, total_duration_minutes, price_egp, compare_at_price_egp',
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
    const supabase = await createClient()
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
export async function getTestimonials(limit = 12): Promise<Testimonial[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, name, role_ar, body_ar, rating, avatar_url, source')
      .eq('is_published', true)
      .order('sort_order')
      .limit(limit)

    if (error) throw error
    return data ?? []
  } catch (error) {
    return degrade('getTestimonials', error, [])
  }
}
