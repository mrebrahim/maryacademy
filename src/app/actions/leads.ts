'use server'

import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

const newsletterSchema = z.object({
  email: z.email({ error: 'يرجى إدخال بريد إلكتروني صحيح' }),
})

export type LeadFormState = { ok: boolean; messageAr: string } | null

/**
 * Newsletter capture -> `leads`. Anon INSERT is allowed by RLS and nothing
 * else is: the row cannot be read back, updated, or deleted from the client.
 * Rate limiting lands in Phase 6 (PRD §10).
 */
export async function subscribeToNewsletter(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'يرجى إدخال بريد إلكتروني صحيح' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('leads')
      .insert({ email: parsed.data.email, source: 'newsletter' })

    if (error) throw error
    return { ok: true, messageAr: 'تم الاشتراك. ستصلك أخبار الدورات الجديدة على هذا البريد.' }
  } catch (error) {
    console.error('[subscribeToNewsletter]', error)
    return { ok: false, messageAr: 'تعذّر إتمام العملية، يرجى المحاولة بعد قليل.' }
  }
}
