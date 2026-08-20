'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * Community actions.
 *
 * The submission path never sets a status: the row defaults to 'pending'
 * and the insert policy refuses anything else, so "must be approved by an
 * admin" is a database rule rather than a promise made in TypeScript.
 */

export type CommunityState = { ok: boolean; messageAr: string } | null

const postSchema = z
  .object({
    groupId: z.uuid(),
    groupSlug: z.string().min(1),
    kind: z.enum(['question', 'discussion', 'resource']),
    titleAr: z.string().trim().min(3, 'العنوان قصير أوي').max(200, 'العنوان طويل أوي'),
    bodyAr: z.string().trim().max(4000).optional().or(z.literal('')),
    linkUrl: z.string().trim().url('اللينك مش صحيح').max(500).optional().or(z.literal('')),
  })
  .refine((v) => v.kind !== 'resource' || Boolean(v.linkUrl), {
    message: 'المصدر لازم يكون معاه لينك',
    path: ['linkUrl'],
  })

export async function submitPost(
  _prev: CommunityState,
  formData: FormData,
): Promise<CommunityState> {
  const parsed = postSchema.safeParse({
    groupId: formData.get('groupId'),
    groupSlug: formData.get('groupSlug'),
    kind: formData.get('kind'),
    titleAr: formData.get('titleAr'),
    bodyAr: formData.get('bodyAr') ?? '',
    linkUrl: formData.get('linkUrl') ?? '',
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجع البيانات' }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { ok: false, messageAr: 'لازم تسجّل الدخول الأول.' }

    const { error } = await supabase.from('community_posts').insert({
      group_id: parsed.data.groupId,
      author_id: user.id,
      kind: parsed.data.kind,
      title_ar: parsed.data.titleAr,
      body_ar: parsed.data.bodyAr || null,
      link_url: parsed.data.linkUrl || null,
    })

    if (error) throw error
  } catch (error) {
    console.error('[submitPost]', error)
    return { ok: false, messageAr: 'تعذّر إرسال المشاركة، حاول تاني.' }
  }

  revalidatePath(`/community/${parsed.data.groupSlug}`)
  return { ok: true, messageAr: 'وصلتنا مشاركتك، وهتظهر بعد مراجعة الإدارة.' }
}

// ---------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------

const groupSchema = z
  .object({
    nameAr: z.string().trim().min(2, 'اكتب اسم الجروب').max(120),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(60)
      .regex(/^[a-z0-9-]+$/, 'المعرّف بحروف إنجليزية صغيرة وأرقام وشرطات فقط'),
    descriptionAr: z.string().trim().max(1000).optional().or(z.literal('')),
    audience: z.enum(['enrolled', 'not_enrolled', 'everyone']),
    scope: z.enum(['general', 'courses']),
    courseIds: z.array(z.uuid()).default([]),
  })
  .refine((v) => v.scope === 'general' || v.courseIds.length > 0, {
    message: 'اختار دورة واحدة على الأقل، أو خلّي الجروب عام',
    path: ['courseIds'],
  })

export async function createGroup(
  _prev: CommunityState,
  formData: FormData,
): Promise<CommunityState> {
  const parsed = groupSchema.safeParse({
    nameAr: formData.get('nameAr'),
    slug: formData.get('slug'),
    descriptionAr: formData.get('descriptionAr') ?? '',
    audience: formData.get('audience'),
    scope: formData.get('scope'),
    courseIds: formData.getAll('courseIds').map(String).filter(Boolean),
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجع البيانات' }
  }

  const isGeneral = parsed.data.scope === 'general'

  try {
    const supabase = await createClient()

    const { data: group, error } = await supabase
      .from('community_groups')
      .insert({
        name_ar: parsed.data.nameAr,
        slug: parsed.data.slug,
        description_ar: parsed.data.descriptionAr || null,
        audience: parsed.data.audience,
        is_general: isGeneral,
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') {
        return { ok: false, messageAr: 'المعرّف ده مستخدم قبل كده، اختار غيره.' }
      }
      throw error
    }

    if (!isGeneral) {
      const { error: linkError } = await supabase.from('community_group_courses').insert(
        parsed.data.courseIds.map((courseId) => ({
          group_id: group.id,
          course_id: courseId,
        })),
      )
      if (linkError) throw linkError
    }
  } catch (error) {
    console.error('[createGroup]', error)
    return { ok: false, messageAr: 'تعذّر إنشاء الجروب، حاول تاني.' }
  }

  revalidatePath('/admin/community')
  revalidatePath('/community')
  return { ok: true, messageAr: 'اتعمل الجروب' }
}

const moderateSchema = z.object({
  postId: z.uuid(),
  note: z.string().trim().max(500).optional().or(z.literal('')),
})

async function moderate(formData: FormData, approve: boolean): Promise<CommunityState> {
  const parsed = moderateSchema.safeParse({
    postId: formData.get('postId'),
    note: formData.get('note') ?? '',
  })

  if (!parsed.success) return { ok: false, messageAr: 'طلب غير صالح' }

  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc('moderate_post', {
      p_post_id: parsed.data.postId,
      p_approve: approve,
      p_note: parsed.data.note || undefined,
    })

    if (error) {
      if (error.message.includes('not_admin')) {
        return { ok: false, messageAr: 'الصلاحية دي للإدارة فقط.' }
      }
      throw error
    }
  } catch (error) {
    console.error('[moderatePost]', error)
    return { ok: false, messageAr: 'تعذّر تنفيذ الإجراء، حاول تاني.' }
  }

  revalidatePath('/admin/community')
  revalidatePath('/community')
  return { ok: true, messageAr: approve ? 'اتنشرت المشاركة' : 'اترفضت المشاركة' }
}

export async function approvePost(_prev: CommunityState, formData: FormData) {
  return moderate(formData, true)
}

export async function rejectPost(_prev: CommunityState, formData: FormData) {
  return moderate(formData, false)
}
