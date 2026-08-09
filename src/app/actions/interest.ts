'use server'

import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  name: z.string().trim().min(2, 'اكتبي اسمك').max(120),
  email: z.email('اكتبي إيميل صحيح'),
  phone: z
    .string()
    .trim()
    .regex(/^01[0-25]\d{8}$/, 'اكتبي رقم موبايل مصري صحيح (11 رقم)')
    .optional()
    .or(z.literal('')),
  message: z.string().trim().max(1000).optional(),
})

export type ContactFormState = { ok: boolean; messageAr: string } | null

async function insertLead(
  source: 'contact_form' | 'course_interest',
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    message: formData.get('message') ?? '',
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'راجعي البيانات' }
  }

  const { name, email, phone, message } = parsed.data

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('leads').insert({
      name,
      email,
      // Stored E.164 so it matches the profiles.phone format.
      phone: phone ? `+20${phone.replace(/^0/, '')}` : null,
      message: message || null,
      source,
    })

    if (error) throw error
    return { ok: true, messageAr: 'وصلنا! هنتواصل معاكي في أقرب وقت.' }
  } catch (error) {
    console.error(`[insertLead:${source}]`, error)
    return { ok: false, messageAr: 'حصلت مشكلة، جربي تاني بعد شوية.' }
  }
}

export async function submitContactForm(_prev: ContactFormState, formData: FormData) {
  return insertLead('contact_form', formData)
}

export async function submitCourseInterest(_prev: ContactFormState, formData: FormData) {
  return insertLead('course_interest', formData)
}
