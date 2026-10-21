'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * Creating courses, modules and lessons from the dashboard.
 *
 * Until now the dashboard could only edit a course that already existed,
 * so adding one meant writing SQL — which meant it did not happen, or it
 * happened wrong at midnight. Everything here goes through PostgREST with
 * the caller's own session: the `*_admin_write` policies are the gate, so
 * a student submitting these forms is refused by the database, not by a
 * check in this file.
 *
 * Lessons are created without a video id. That column is filled by the
 * Bunny sync (`npm run bunny:lessons`), which reads the real library —
 * typing a 36-character GUID by hand is how a lesson silently plays
 * somebody else's video, and the only way to notice is to watch all of
 * them.
 */

export type CurriculumState = { ok: boolean; messageAr: string } | null

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Postgres unique violation. */
const DUPLICATE = '23505'

// ---------------------------------------------------------------------
// Course
// ---------------------------------------------------------------------

const courseSchema = z.object({
  titleAr: z.string().trim().min(3, 'اكتب اسم الدورة').max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'اكتب رابط للدورة')
    .max(80)
    .refine((v) => SLUG.test(v), 'الرابط لازم يكون إنجليزي صغير وأرقام وشرطات بس'),
  subtitleAr: z.string().trim().max(300).optional().or(z.literal('')),
  categoryId: z.uuid().optional().or(z.literal('')),
  priceEgp: z.coerce.number().min(0, 'السعر مينفعش يكون بالسالب'),
  priceEgpIntl: z.coerce.number().min(0).optional().or(z.literal('')),
})

export async function createCourse(
  _prev: CurriculumState,
  formData: FormData,
): Promise<CurriculumState> {
  const parsed = courseSchema.safeParse({
    titleAr: formData.get('titleAr'),
    slug: formData.get('slug'),
    subtitleAr: formData.get('subtitleAr') ?? '',
    categoryId: formData.get('categoryId') ?? '',
    priceEgp: formData.get('priceEgp'),
    priceEgpIntl: formData.get('priceEgpIntl') ?? '',
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجع البيانات' }
  }

  const d = parsed.data
  let courseId: string

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title_ar: d.titleAr,
        slug: d.slug,
        subtitle_ar: d.subtitleAr || null,
        category_id: d.categoryId || null,
        price_egp: Math.round(d.priceEgp * 100),
        price_egp_intl: d.priceEgpIntl ? Math.round(Number(d.priceEgpIntl) * 100) : 0,
        // Always a draft. A course is created empty, and an empty course
        // on the public catalogue is worse than no course at all.
        status: 'draft',
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === DUPLICATE) {
        return { ok: false, messageAr: 'الرابط ده مستخدم في دورة تانية — غيّره.' }
      }
      if (error.code === '42501') return { ok: false, messageAr: 'الصلاحية دي للإدارة فقط.' }
      throw error
    }

    courseId = data.id
  } catch (error) {
    console.error('[createCourse]', error)
    return { ok: false, messageAr: 'تعذّر إنشاء الدورة، حاول تاني.' }
  }

  revalidatePath('/admin/content')
  // Straight to the curriculum: a course with no lessons is the next
  // problem to solve, not a finished task to be congratulated on.
  redirect(`/admin/content/${courseId}/curriculum`)
}

// ---------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------

const moduleSchema = z.object({
  courseId: z.uuid(),
  titleAr: z.string().trim().min(2, 'اكتب اسم الجزء').max(200),
})

export async function createModule(
  _prev: CurriculumState,
  formData: FormData,
): Promise<CurriculumState> {
  const parsed = moduleSchema.safeParse({
    courseId: formData.get('courseId'),
    titleAr: formData.get('titleAr'),
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجع البيانات' }
  }

  try {
    const supabase = await createClient()

    const { data: last } = await supabase
      .from('modules')
      .select('sort_order')
      .eq('course_id', parsed.data.courseId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { error } = await supabase.from('modules').insert({
      course_id: parsed.data.courseId,
      title_ar: parsed.data.titleAr,
      sort_order: (last?.sort_order ?? 0) + 1,
    })

    if (error) {
      if (error.code === '42501') return { ok: false, messageAr: 'الصلاحية دي للإدارة فقط.' }
      throw error
    }
  } catch (error) {
    console.error('[createModule]', error)
    return { ok: false, messageAr: 'تعذّر إضافة الجزء، حاول تاني.' }
  }

  revalidatePath(`/admin/content/${parsed.data.courseId}/curriculum`)
  return { ok: true, messageAr: 'اتضاف' }
}

export async function deleteModule(
  _prev: CurriculumState,
  formData: FormData,
): Promise<CurriculumState> {
  const parsed = z
    .object({ courseId: z.uuid(), moduleId: z.uuid() })
    .safeParse({ courseId: formData.get('courseId'), moduleId: formData.get('moduleId') })

  if (!parsed.success) return { ok: false, messageAr: 'راجع البيانات' }

  try {
    const supabase = await createClient()

    // Deleting a module cascades to its lessons, so an accidental click
    // on a full module would take the course with it. Emptiness is the
    // condition for deletion.
    const { count } = await supabase
      .from('lessons_public')
      .select('id', { count: 'exact', head: true })
      .eq('module_id', parsed.data.moduleId)

    if ((count ?? 0) > 0) {
      return { ok: false, messageAr: 'شيل الدروس اللي جوه الجزء ده الأول.' }
    }

    const { error } = await supabase.from('modules').delete().eq('id', parsed.data.moduleId)
    if (error) throw error
  } catch (error) {
    console.error('[deleteModule]', error)
    return { ok: false, messageAr: 'تعذّر المسح، حاول تاني.' }
  }

  revalidatePath(`/admin/content/${parsed.data.courseId}/curriculum`)
  return { ok: true, messageAr: 'اتمسح' }
}

// ---------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------

const lessonSchema = z.object({
  courseId: z.uuid(),
  moduleId: z.uuid(),
  titleAr: z.string().trim().min(2, 'اكتب اسم الدرس').max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || SLUG.test(v), 'الرابط لازم يكون إنجليزي صغير وأرقام وشرطات بس'),
  durationMinutes: z.coerce.number().int().min(0).max(600),
})

export async function createLesson(
  _prev: CurriculumState,
  formData: FormData,
): Promise<CurriculumState> {
  const parsed = lessonSchema.safeParse({
    courseId: formData.get('courseId'),
    moduleId: formData.get('moduleId'),
    titleAr: formData.get('titleAr'),
    slug: formData.get('slug') ?? '',
    durationMinutes: formData.get('durationMinutes') ?? 0,
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجع البيانات' }
  }

  const d = parsed.data

  try {
    const supabase = await createClient()

    // Sort order is course-wide, not per module: the player walks the
    // course in one line, and two lessons sharing a number in different
    // modules would make that order arbitrary.
    const { data: last } = await supabase
      .from('lessons_public')
      .select('sort_order')
      .eq('course_id', d.courseId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrder = (last?.sort_order ?? 0) + 1
    const slug = d.slug || `lesson-${nextOrder}`

    const { error } = await supabase.from('lessons').insert({
      course_id: d.courseId,
      module_id: d.moduleId,
      title_ar: d.titleAr,
      slug,
      duration_seconds: d.durationMinutes * 60,
      sort_order: nextOrder,
    })

    if (error) {
      if (error.code === DUPLICATE) {
        return { ok: false, messageAr: `الرابط «${slug}» مستخدم في درس تاني — اكتب رابط تاني.` }
      }
      if (error.code === '42501') return { ok: false, messageAr: 'الصلاحية دي للإدارة فقط.' }
      throw error
    }
  } catch (error) {
    console.error('[createLesson]', error)
    return { ok: false, messageAr: 'تعذّر إضافة الدرس، حاول تاني.' }
  }

  revalidatePath(`/admin/content/${d.courseId}/curriculum`)
  revalidatePath('/admin/content')
  return { ok: true, messageAr: 'اتضاف' }
}

export async function deleteLesson(
  _prev: CurriculumState,
  formData: FormData,
): Promise<CurriculumState> {
  const parsed = z
    .object({ courseId: z.uuid(), lessonId: z.uuid() })
    .safeParse({ courseId: formData.get('courseId'), lessonId: formData.get('lessonId') })

  if (!parsed.success) return { ok: false, messageAr: 'راجع البيانات' }

  try {
    const supabase = await createClient()

    // Same rule the Bunny sync enforces: a lesson somebody has watched is
    // part of their record, and deleting it silently rewrites what they
    // were sold.
    const { count } = await supabase
      .from('lesson_progress')
      .select('id', { count: 'exact', head: true })
      .eq('lesson_id', parsed.data.lessonId)

    if ((count ?? 0) > 0) {
      return { ok: false, messageAr: 'فيه طلاب بدأوا الدرس ده — مينفعش يتمسح.' }
    }

    const { error } = await supabase.from('lessons').delete().eq('id', parsed.data.lessonId)
    if (error) throw error
  } catch (error) {
    console.error('[deleteLesson]', error)
    return { ok: false, messageAr: 'تعذّر المسح، حاول تاني.' }
  }

  revalidatePath(`/admin/content/${parsed.data.courseId}/curriculum`)
  revalidatePath('/admin/content')
  return { ok: true, messageAr: 'اتمسح' }
}

/**
 * The free preview, which is a property of the course rather than of the
 * lesson: exactly one lesson is given away, so choosing a new one takes
 * the flag off whichever had it.
 */
export async function setFreePreview(
  _prev: CurriculumState,
  formData: FormData,
): Promise<CurriculumState> {
  const parsed = z
    .object({ courseId: z.uuid(), lessonId: z.uuid() })
    .safeParse({ courseId: formData.get('courseId'), lessonId: formData.get('lessonId') })

  if (!parsed.success) return { ok: false, messageAr: 'راجع البيانات' }

  try {
    const supabase = await createClient()

    const { error: clearError } = await supabase
      .from('lessons')
      .update({ is_free_preview: false })
      .eq('course_id', parsed.data.courseId)
      .eq('is_free_preview', true)

    if (clearError) throw clearError

    const { error } = await supabase
      .from('lessons')
      .update({ is_free_preview: true })
      .eq('id', parsed.data.lessonId)

    if (error) throw error
  } catch (error) {
    console.error('[setFreePreview]', error)
    return { ok: false, messageAr: 'تعذّر التغيير، حاول تاني.' }
  }

  revalidatePath(`/admin/content/${parsed.data.courseId}/curriculum`)
  revalidatePath('/admin/content')
  revalidatePath(`/watch`, 'layout')
  return { ok: true, messageAr: 'اتغيّر' }
}
