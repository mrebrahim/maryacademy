'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * Lesson attachments.
 *
 * The whole list is written at once rather than one file appended at a
 * time, so two tabs open on the same lesson cannot interleave into a
 * half-list. The database validates the shape again and refuses a
 * non-admin, so neither is this file's job alone.
 */

export type AttachmentState = { ok: boolean; messageAr: string } | null

const schema = z.object({
  lessonId: z.uuid(),
  courseSlug: z.string().min(1),
  titles: z.array(z.string()),
  urls: z.array(z.string()),
})

export async function saveAttachments(
  _prev: AttachmentState,
  formData: FormData,
): Promise<AttachmentState> {
  const parsed = schema.safeParse({
    lessonId: formData.get('lessonId'),
    courseSlug: formData.get('courseSlug'),
    titles: formData.getAll('title').map(String),
    urls: formData.getAll('url').map(String),
  })

  if (!parsed.success) return { ok: false, messageAr: 'راجع البيانات' }

  // Pair them up and drop the blank rows the form always carries.
  const attachments = parsed.data.titles
    .map((title, i) => ({ title: title.trim(), url: (parsed.data.urls[i] ?? '').trim() }))
    .filter((a) => a.title || a.url)

  for (const a of attachments) {
    if (!a.title) return { ok: false, messageAr: 'كل ملف لازم يكون له اسم' }
    if (!/^https?:\/\//.test(a.url)) {
      return { ok: false, messageAr: `اللينك بتاع «${a.title}» لازم يبدأ بـ https://` }
    }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc('set_lesson_attachments', {
      p_lesson_id: parsed.data.lessonId,
      p_attachments: attachments,
    })

    if (error) {
      if (error.message.includes('not_authorised')) {
        return { ok: false, messageAr: 'الصلاحية دي للإدارة فقط.' }
      }
      throw error
    }
  } catch (error) {
    console.error('[saveAttachments]', error)
    return { ok: false, messageAr: 'تعذّر الحفظ، حاول تاني.' }
  }

  revalidatePath('/admin/attachments')
  revalidatePath(`/watch/${parsed.data.courseSlug}`, 'layout')
  return { ok: true, messageAr: 'اتحفظ' }
}
