import 'server-only'

import { cookies } from 'next/headers'

/**
 * Carries an email address across one redirect, in a cookie instead of a
 * query string.
 *
 * It used to travel as `?email=...`, which was convenient and wrong. Every
 * tracking pixel sends the full page URL with every event it fires — so
 * `/checkout/success?email=someone@gmail.com` shipped a real customer's
 * address, unhashed, to Meta, Google and TikTok on PageView, on
 * CompleteRegistration, on everything. Meta flagged it as a Business Tools
 * Terms violation and stripped the data; the same URL sat in browser
 * history, in referrer headers to every third-party script, and in any
 * screenshot the buyer sent us.
 *
 * A cookie goes to our own server and nowhere else. `httpOnly` keeps it
 * away from the pixels' own JavaScript too, which is the other half of the
 * problem: a script that can read `document.cookie` can read anything the
 * URL would have carried.
 *
 * Deliberately short-lived. It exists to survive one redirect, so ten
 * minutes is generous; a shared or borrowed phone should not show the
 * previous buyer's address an hour later.
 */
const COOKIE = 'mr_handoff_email'
const MAX_AGE_SECONDS = 10 * 60

export async function setHandoffEmail(email: string) {
  const jar = await cookies()
  jar.set(COOKIE, email, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

/**
 * Returns the address if the handoff is still fresh, otherwise undefined.
 *
 * Every caller must treat undefined as normal rather than as an error:
 * the cookie can be absent because it expired, because the page was
 * reopened from history, or because the browser refuses cookies. The
 * pages that use it degrade to a slightly less specific sentence, which
 * is a fair price.
 */
export async function readHandoffEmail(): Promise<string | undefined> {
  const jar = await cookies()
  return jar.get(COOKIE)?.value || undefined
}
