'use server'

import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  name: z.string().trim().min(2, 'يرجى إدخال الاسم').max(120),
  email: z.email('يرجى إدخال بريد إلكتروني صحيح'),
  phone: z
    .string()
    .trim()
    .regex(/^01[0-25]\d{8}$/, 'يرجى إدخال رقم هاتف مصري صحيح (11 رقمًا)')
    .optional()
    .or(z.literal('')),
  message: z.string().trim().max(1000).optional(),
  // Landing pages pass the course so the lead is attributable to an offer
  // rather than landing in an undifferentiated pile.
  courseId: z.uuid().optional().or(z.literal('')),
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
    courseId: formData.get('courseId') ?? '',
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'يرجى مراجعة البيانات' }
  }

  const { name, email, phone, message, courseId } = parsed.data

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('leads').insert({
      name,
      email,
      // Stored E.164 so it matches the profiles.phone format.
      phone: phone ? `+20${phone.replace(/^0/, '')}` : null,
      message: message || null,
      course_id: courseId || null,
      source,
    })

    if (error) throw error
    return { ok: true, messageAr: 'تم استلام رسالتك. سنتواصل معك في أقرب وقت.' }
  } catch (error) {
    console.error(`[insertLead:${source}]`, error)
    return { ok: false, messageAr: 'تعذّر إتمام العملية، يرجى المحاولة بعد قليل.' }
  }
}

export async function submitContactForm(_prev: ContactFormState, formData: FormData) {
  return insertLead('contact_form', formData)
}

export async function submitCourseInterest(_prev: ContactFormState, formData: FormData) {
  return insertLead('course_interest', formData)
}
