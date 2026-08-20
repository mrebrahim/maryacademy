'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * Course thumbnail upload.
 *
 * Runs entirely on the admin's own session — the `media` bucket's insert
 * policy requires is_admin(), and so does the courses UPDATE policy, so no
 * service-role key is involved and a non-admin request is refused by the
 * database rather than by a check in this file.
 */

export type MediaState = { ok: boolean; messageAr: string } | null

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

const schema = z.object({
  courseId: z.uuid(),
})

export async function uploadCourseThumbnail(
  _prev: MediaState,
  formData: FormData,
): Promise<MediaState> {
  const parsed = schema.safeParse({ courseId: formData.get('courseId') })
  if (!parsed.success) return { ok: false, messageAr: 'طلب غير صالح' }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, messageAr: 'اختار صورة الأول' }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, messageAr: 'الصورة كبيرة أوي — الحد الأقصى 5 ميجا' }
  }
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, messageAr: 'الصيغة دي مش مدعومة. استخدم JPG أو PNG أو WebP.' }
  }

  try {
    const supabase = await createClient()

    const extension = file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
    // Timestamped so replacing a thumbnail busts the CDN cache; upsert would
    // keep the old bytes served for hours behind Supabase's cache headers.
    const path = `courses/${parsed.data.courseId}-${Date.now()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, file, { contentType: file.type, cacheControl: '31536000' })

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from('media').getPublicUrl(path)

    const { error: updateError } = await supabase
      .from('courses')
      .update({ thumbnail_url: publicUrl })
      .eq('id', parsed.data.courseId)

    if (updateError) throw updateError
  } catch (error) {
    console.error('[uploadCourseThumbnail]', error)
    return { ok: false, messageAr: 'تعذّر رفع الصورة، حاول تاني.' }
  }

  // The marketing pages are cached for an hour; without these the new
  // thumbnail would not appear until that expired.
  revalidatePath('/')
  revalidatePath('/courses')
  revalidatePath('/admin/media')
  return { ok: true, messageAr: 'اترفعت الصورة' }
}
