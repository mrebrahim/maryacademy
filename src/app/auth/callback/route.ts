import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * Exchanges an emailed auth code for a session.
 *
 * The sign-in flow we ask people to use is the six-digit code typed into
 * /verify. This route covers the other path: if the Supabase email template
 * sends a link instead of a code, the link lands back here carrying `?code=`,
 * and without something to trade that code for a session the person arrives
 * signed out with no explanation.
 *
 * The exchange needs the PKCE verifier cookie, which lives in the browser that
 * requested the email. Opening the link on a different device therefore cannot
 * work — that is the flow's design, not a bug — so the failure path sends them
 * back to /login with a message telling them to use the code instead.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  // Only internal destinations; an emailed link is attacker-supplied input.
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/learn'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback]', error)
    return NextResponse.redirect(`${origin}/login?error=link_failed`)
  }

  return NextResponse.redirect(`${origin}${safeNext}`)
}
