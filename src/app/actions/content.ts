'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { offer } from '@/config/offer'
import { createClient } from '@/lib/supabase/server'

/** The ad destination for `offer.courseSlug`. */
const LANDING_PATH = '/lp/hairstyling'

/**
 * Course and lesson editing from the admin panel.
 *
 * Until now every content change was a SQL statement, which meant the
 * academy could not fix a typo in a course title, change a price, or open
 * a lesson as a free preview without a developer. That is the wrong
 * dependency for a business that sells one product.
 *
 * Writes go straight to the tables: the courses and lessons policies
 * already require is_admin(), so the database refuses a non-admin
 * whatever this file does.
 */

export type ContentState = { ok: boolean; messageAr: string } | null

// ---------------------------------------------------------------------
// Course
// ---------------------------------------------------------------------

const courseSchema = z.object({
  id: z.uuid(),
  titleAr: z.string().trim().min(3, 'اكتب اسم الدورة').max(200),
  subtitleAr: z.string().trim().max(300).optional().or(z.literal('')),
  descriptionAr: z.string().trim().max(4000).optional().or(z.literal('')),
  // Entered in pounds because that is what a person thinks in; stored in
  // piastres like every other amount in the schema.
  priceEgp: z.coerce.number().min(0, 'السعر مينفعش يكون بالسالب'),
  // Outside Egypt. Blank means the course is not sold abroad, which is a
  // different thing from costing nothing — hence the empty-string branch.
  priceEgpIntl: z.coerce.number().min(0).optional().or(z.literal('')),
  compareAtEgp: z.coerce.number().min(0).optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']),
  certificateEnabled: z.enum(['on', 'off']),
})

export async function updateCourse(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const parsed = courseSchema.safeParse({
    id: formData.get('id'),
    titleAr: formData.get('titleAr'),
    subtitleAr: formData.get('subtitleAr') ?? '',
    descriptionAr: formData.get('descriptionAr') ?? '',
    priceEgp: formData.get('priceEgp'),
    priceEgpIntl: formData.get('priceEgpIntl') ?? '',
    compareAtEgp: formData.get('compareAtEgp') ?? '',
    status: formData.get('status'),
    certificateEnabled: formData.get('certificateEnabled') ?? 'off',
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجع البيانات' }
  }

  const d = parsed.data
  const price = Math.round(d.priceEgp * 100)
  const priceIntl = d.priceEgpIntl ? Math.round(Number(d.priceEgpIntl) * 100) : 0
  const compareAt = d.compareAtEgp ? Math.round(Number(d.compareAtEgp) * 100) : null

  // Publishing a course with no price would put a buy button in front of
  // someone with nothing to charge them. Checkout refuses it anyway; this
  // says so before the page goes live rather than after.
  if (d.status === 'published' && price <= 0) {
    return { ok: false, messageAr: 'مينفعش تنشر دورة من غير سعر.' }
  }

  if (compareAt !== null && compareAt > 0 && compareAt <= price) {
    return { ok: false, messageAr: 'السعر قبل الخصم لازم يكون أعلى من السعر الحالي.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('courses')
      .update({
        title_ar: d.titleAr,
        subtitle_ar: d.subtitleAr || null,
        description_ar: d.descriptionAr || null,
        price_egp: price,
        price_egp_intl: priceIntl,
        compare_at_price_egp: compareAt && compareAt > 0 ? compareAt : null,
        status: d.status,
        certificate_enabled: d.certificateEnabled === 'on',
        published_at: d.status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', d.id)

    if (error) {
      if (error.code === '42501') return { ok: false, messageAr: 'الصلاحية دي للإدارة فقط.' }
      throw error
    }
  } catch (error) {
    console.error('[updateCourse]', error)
    return { ok: false, messageAr: 'تعذّر الحفظ، حاول تاني.' }
  }

  await revalidateCoursePages(d.id)
  return { ok: true, messageAr: 'اتحفظ' }
}

/**
 * Clears the cached copies of every page that prints a course's details.
 *
 * The marketing pages are pre-rendered and cached for an hour. That is
 * right for traffic and wrong for a price: after a change, the landing
 * page and the course page can keep quoting the old figure while checkout
 * — which reads the database per request — charges the new one. A buyer
 * who sees two prices on the same site is a buyer who writes in, and the
 * one she saw first is the one she will argue for.
 *
 * `/` and `/courses` were already cleared; the two pages that actually
 * carry the price were not, which is the whole problem.
 */
async function revalidateCoursePages(courseId: string) {
  revalidatePath('/')
  revalidatePath('/courses')
  revalidatePath('/admin/content')

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('courses')
      .select('slug')
      .eq('id', courseId)
      .maybeSingle()

    if (data?.slug) revalidatePath(`/courses/${data.slug}`)
    if (data?.slug === offer.courseSlug) revalidatePath(LANDING_PATH)
  } catch (error) {
    // A failed revalidation is an hour of stale copy, not a failed save.
    console.error('[revalidateCoursePages]', error)
  }
}

// ---------------------------------------------------------------------
// Lesson
// ---------------------------------------------------------------------

const lessonSchema = z.object({
  id: z.uuid(),
  titleAr: z.string().trim().min(2, 'اكتب اسم الدرس').max(200),
  sortOrder: z.coerce.number().int().min(1),
  isFreePreview: z.enum(['on', 'off']),
})

export async function updateLesson(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const parsed = lessonSchema.safeParse({
    id: formData.get('id'),
    titleAr: formData.get('titleAr'),
    sortOrder: formData.get('sortOrder'),
    isFreePreview: formData.get('isFreePreview') ?? 'off',
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجع البيانات' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('lessons')
      .update({
        title_ar: parsed.data.titleAr,
        sort_order: parsed.data.sortOrder,
        is_free_preview: parsed.data.isFreePreview === 'on',
      })
      .eq('id', parsed.data.id)

    if (error) {
      if (error.code === '42501') return { ok: false, messageAr: 'الصلاحية دي للإدارة فقط.' }
      throw error
    }
  } catch (error) {
    console.error('[updateLesson]', error)
    return { ok: false, messageAr: 'تعذّر الحفظ، حاول تاني.' }
  }

  revalidatePath('/admin/content')
  revalidatePath('/courses')
  revalidatePath(LANDING_PATH)
  return { ok: true, messageAr: 'اتحفظ' }
}

// ---------------------------------------------------------------------
// Thumbnail
// ---------------------------------------------------------------------

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export async function uploadCourseThumbnail(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const courseId = String(formData.get('courseId') ?? '')
  if (!z.uuid().safeParse(courseId).success) return { ok: false, messageAr: 'طلب غير صالح' }

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
    // Timestamped rather than upserted: Supabase serves the old bytes for
    // hours behind its cache headers, so replacing a thumbnail in place
    // looks like nothing happened.
    const path = `courses/${courseId}-${Date.now()}.${extension}`

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
      .eq('id', courseId)

    if (updateError) throw updateError
  } catch (error) {
    console.error('[uploadCourseThumbnail]', error)
    return { ok: false, messageAr: 'تعذّر رفع الصورة، حاول تاني.' }
  }

  await revalidateCoursePages(courseId)
  return { ok: true, messageAr: 'اترفعت الصورة' }
}
