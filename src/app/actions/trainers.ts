'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * Trainer applications.
 *
 * The form is public, so the write goes through a SECURITY DEFINER
 * function rather than an anon INSERT grant — a grant on a table of
 * names, phone numbers and CVs is an open write endpoint, and it would
 * also let anyone set their own application to "accepted".
 */

export type TrainerState = { ok: boolean; messageAr: string } | null

const schema = z.object({
  fullName: z.string().trim().min(3, 'اكتب اسمك بالكامل').max(120),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s/g, ''))
    .refine((v) => /^01[0125]\d{8}$/.test(v), 'اكتب رقم موبايل مصري صحيح'),
  email: z.email({ error: 'البريد الإلكتروني مكتوب غلط' }),
  specialityAr: z.string().trim().min(2, 'اكتب تخصصك').max(120),
  yearsExperience: z.coerce.number().int().min(0).max(60).optional().or(z.literal('')),
  portfolioUrl: z.string().trim().url('اللينك مش صحيح').max(500).optional().or(z.literal('')),
  aboutAr: z.string().trim().max(2000).optional().or(z.literal('')),
})

export async function submitTrainerApplication(
  _prev: TrainerState,
  formData: FormData,
): Promise<TrainerState> {
  const parsed = schema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    specialityAr: formData.get('specialityAr'),
    yearsExperience: formData.get('yearsExperience') ?? '',
    portfolioUrl: formData.get('portfolioUrl') ?? '',
    aboutAr: formData.get('aboutAr') ?? '',
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجع البيانات' }
  }

  const d = parsed.data

  try {
    const supabase = await createClient()
    const { error } = await supabase.rpc('submit_trainer_application', {
      p_full_name: d.fullName,
      p_phone: d.phone,
      p_email: d.email,
      p_speciality_ar: d.specialityAr,
      p_years_experience: d.yearsExperience === '' ? undefined : Number(d.yearsExperience),
      p_portfolio_url: d.portfolioUrl || undefined,
      p_about_ar: d.aboutAr || undefined,
    })

    if (error) throw error
  } catch (error) {
    console.error('[submitTrainerApplication]', error)
    return { ok: false, messageAr: 'تعذّر إرسال الطلب، حاول تاني بعد شوية.' }
  }

  revalidatePath('/admin/trainers')
  return {
    ok: true,
    messageAr: 'وصلنا طلبك. هنراجعه ونتواصل معاك على الرقم اللي كتبته.',
  }
}

// ---------------------------------------------------------------------
// Admin review
// ---------------------------------------------------------------------

const reviewSchema = z.object({
  id: z.uuid(),
  status: z.enum(['new', 'reviewing', 'accepted', 'rejected']),
})

export async function reviewTrainerApplication(
  _prev: TrainerState,
  formData: FormData,
): Promise<TrainerState> {
  const parsed = reviewSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
  })

  if (!parsed.success) return { ok: false, messageAr: 'طلب غير صالح' }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('trainer_applications')
      .update({
        status: parsed.data.status,
        reviewed_by: user?.id ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.id)

    if (error) {
      if (error.code === '42501') return { ok: false, messageAr: 'الصلاحية دي للإدارة فقط.' }
      throw error
    }
  } catch (error) {
    console.error('[reviewTrainerApplication]', error)
    return { ok: false, messageAr: 'تعذّر تنفيذ الإجراء.' }
  }

  revalidatePath('/admin/trainers')
  return { ok: true, messageAr: 'اتحدّث' }
}
