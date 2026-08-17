'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

/**
 * Email OTP sign-in — one flow for students, trainers and admins.
 *
 * A six-digit code rather than a magic link: links break when the mail app
 * opens them in its own in-app browser, which loses the session and is a
 * common support complaint on Android. A code can be typed into the tab the
 * person already has open.
 *
 * The same call signs up and signs in. Supabase creates the auth user on
 * first use and the `handle_new_user` trigger provisions the profile row,
 * so there is no separate registration form to keep in sync.
 */

const emailSchema = z.email({ error: 'يرجى إدخال بريد إلكتروني صحيح' })

export type OtpState = { ok: boolean; messageAr: string; email?: string } | null

export async function requestOtp(_prev: OtpState, formData: FormData): Promise<OtpState> {
  const parsed = emailSchema.safeParse(formData.get('email'))
  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'بريد إلكتروني غير صحيح' }
  }

  const email = parsed.data.toLowerCase().trim()
  const fullName = String(formData.get('fullName') ?? '').trim()

  // Taken from the request rather than an env var so preview deployments,
  // the production domain and localhost each point the link at themselves.
  const requestHeaders = await headers()
  const host = requestHeaders.get('host')
  const proto = host?.startsWith('localhost') ? 'http' : 'https'

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        // Read by handle_new_user() to fill the profile on first sign-in.
        data: fullName ? { full_name: fullName } : undefined,
        // Only used if the Supabase email template sends a link rather than
        // the six-digit code; harmless otherwise. Without it the link falls
        // back to the project's Site URL, which lands on a page that has no
        // handler for the code it carries.
        emailRedirectTo: host ? `${proto}://${host}/auth/callback` : undefined,
      },
    })

    if (error) throw error
  } catch (error) {
    console.error('[requestOtp]', error)
    return { ok: false, messageAr: 'تعذّر إرسال الكود، يرجى المحاولة بعد قليل.' }
  }

  // The email is carried to the verify screen in the URL, not in the state,
  // so a refresh does not lose it.
  redirect(`/verify?email=${encodeURIComponent(email)}`)
}

const verifySchema = z.object({
  email: z.email(),
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'الكود مكوّن من 6 أرقام'),
  next: z.string().optional(),
})

export async function verifyOtp(_prev: OtpState, formData: FormData): Promise<OtpState> {
  const parsed = verifySchema.safeParse({
    email: formData.get('email'),
    token: formData.get('token'),
    next: formData.get('next') ?? '',
  })

  if (!parsed.success) {
    return { ok: false, messageAr: parsed.error.issues[0]?.message ?? 'كود غير صحيح' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      email: parsed.data.email,
      token: parsed.data.token,
      type: 'email',
    })

    if (error) {
      return { ok: false, messageAr: 'الكود غير صحيح أو انتهت صلاحيته. اطلب كودًا جديدًا.' }
    }
  } catch (error) {
    console.error('[verifyOtp]', error)
    return { ok: false, messageAr: 'تعذّر التحقق، يرجى المحاولة بعد قليل.' }
  }

  // Only allow internal redirects — an open redirect here would let a
  // crafted link bounce a freshly signed-in user to an attacker's page.
  const next = parsed.data.next
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/learn'
  redirect(safeNext)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
