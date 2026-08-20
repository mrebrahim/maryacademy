'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * Progress actions.
 *
 * Like checkout, these go through a SECURITY DEFINER function: the
 * enrolment is resolved from auth.uid() inside the database, so a request
 * cannot write progress onto somebody else's enrolment no matter what it
 * sends.
 */

export type ProgressState = { ok: boolean; messageAr: string } | null

const schema = z.object({
  lessonId: z.uuid(),
  courseSlug: z.string().min(1),
  watchedSeconds: z.coerce.number().int().min(0).max(60 * 60 * 12).optional(),
})

export async function markLessonComplete(
  _prev: ProgressState,
  formData: FormData,
): Promise<ProgressState> {
  const parsed = schema.safeParse({
    lessonId: formData.get('lessonId'),
    courseSlug: formData.get('courseSlug'),
    watchedSeconds: formData.get('watchedSeconds') ?? undefined,
  })

  if (!parsed.success) {
    return { ok: false, messageAr: 'تعذّر تسجيل التقدّم.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc('mark_lesson_complete', {
      p_lesson_id: parsed.data.lessonId,
      p_watched_seconds: parsed.data.watchedSeconds,
    })

    if (error) {
      if (error.message.includes('not_enrolled')) {
        return { ok: false, messageAr: 'إنت مش مشترك في الدورة دي.' }
      }
      throw error
    }
  } catch (error) {
    console.error('[markLessonComplete]', error)
    return { ok: false, messageAr: 'تعذّر تسجيل التقدّم، حاول تاني.' }
  }

  revalidatePath(`/watch/${parsed.data.courseSlug}`, 'layout')
  revalidatePath('/learn')
  return { ok: true, messageAr: 'تم تسجيل الدرس كمكتمل' }
}
