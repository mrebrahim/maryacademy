import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { env } from '@/lib/env'

/**
 * Refreshes the Supabase session and gates protected routes.
 *
 * Two rules that are easy to get wrong and expensive when you do:
 *   1. `supabase.auth.getUser()` must be called — it revalidates the token
 *      with the auth server. `getSession()` only decodes the cookie, which
 *      the browser can forge.
 *   2. The response object created here must be the one returned, cookies
 *      and all, or the refreshed session is silently dropped and the user
 *      is logged out at random.
 *
 * And one that took the whole site down: middleware runs on every request,
 * so any network call in here is on the critical path for every page. When
 * Supabase was slow to answer, `getUser()` hung, Vercel killed the
 * invocation at its limit, and even the homepage — which needs no session
 * at all — served 504 MIDDLEWARE_INVOCATION_TIMEOUT. Hence the two guards
 * below: never call out unless this request actually needs a session, and
 * never wait on that call indefinitely.
 */

/** Well under Vercel's middleware limit, so a slow auth server degrades
 *  rather than taking the request down with it. */
const AUTH_TIMEOUT_MS = 3000

// /checkout is deliberately absent. Requiring an account before paying is
// the wrong order for paid traffic: someone arrives from an ad, decides,
// and is asked to register first. The order is taken as a guest and the
// account is created when they sign in to watch.
const PROTECTED = ['/learn', '/account', '/admin']
const AUTH_PAGES = ['/login', '/verify']

const AUTH_CODE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Resolves to null instead of hanging. A timeout is treated exactly like
 * "not signed in", which fails closed: protected routes redirect to the
 * login page rather than rendering for someone unverified.
 */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms)
      }),
    ])
  } catch (error) {
    console.error('[middleware] auth call failed', error)
    return null
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Pure URL work first: no network, so it cannot time out. ---
  //
  // An emailed sign-in link redirects to the project's Site URL, so the auth
  // code can land on any page — usually "/". Forward it to the handler that
  // knows what to do with it rather than dropping it. Matched on the UUID
  // shape so an unrelated `?code=` (a shared coupon link, say) falls through.
  const authCode = request.nextUrl.searchParams.get('code')
  if (authCode && pathname !== '/auth/callback' && AUTH_CODE.test(authCode)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    url.searchParams.set('next', pathname === '/' ? '/learn' : pathname)
    return NextResponse.redirect(url)
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.includes(pathname)

  // Supabase stores the session in `sb-<ref>-auth-token`, chunked across
  // `.0`, `.1`… when it is large. No such cookie means there is nothing to
  // refresh and nobody to identify.
  const hasSessionCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'))

  // The common case by far: an anonymous visitor reading a marketing page.
  // Nothing here needs Supabase, so it is never contacted — which is what
  // keeps the homepage up when the auth server is not.
  if (!hasSessionCookie && !isProtected && !isAuthPage) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const result = await withTimeout(supabase.auth.getUser(), AUTH_TIMEOUT_MS)
  const user = result?.data.user ?? null

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Come back here after signing in rather than dumping them on the home page.
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Role gate for /admin. Checked here as well as in RLS — middleware keeps
  // the pages from rendering at all, RLS keeps the data safe if it doesn't.
  // A timed-out lookup denies, same as a missing session.
  if (pathname.startsWith('/admin') && user) {
    const profileResult = await withTimeout(
      // PostgREST's builder is a thenable rather than a real Promise, so it
      // needs awaiting into one before it can be raced against the timer.
      (async () =>
        supabase.from('profiles').select('role').eq('id', user.id).maybeSingle())(),
      AUTH_TIMEOUT_MS,
    )

    if (profileResult?.data?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/learn'
      return NextResponse.redirect(url)
    }
  }

  // Already signed in? No reason to see the login screen.
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/learn'
    return NextResponse.redirect(url)
  }

  return response
}
