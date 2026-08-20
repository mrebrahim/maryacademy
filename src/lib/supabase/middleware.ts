import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { env } from '@/lib/env'

/**
 * Refreshes the Supabase session on every request and gates protected
 * routes.
 *
 * Two rules that are easy to get wrong and expensive when you do:
 *   1. `supabase.auth.getUser()` must be called — it revalidates the token
 *      with the auth server. `getSession()` only decodes the cookie, which
 *      the browser can forge.
 *   2. The response object created here must be the one returned, cookies
 *      and all, or the refreshed session is silently dropped and the user
 *      is logged out at random.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // An emailed sign-in link redirects to the project's Site URL, so the auth
  // code can land on any page — usually "/". Forward it to the handler that
  // knows what to do with it rather than dropping it. Matched on the UUID
  // shape so an unrelated `?code=` (a shared coupon link, say) falls through.
  const authCode = request.nextUrl.searchParams.get('code')
  if (
    authCode &&
    pathname !== '/auth/callback' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authCode)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    url.searchParams.set('next', pathname === '/' ? '/learn' : pathname)
    return NextResponse.redirect(url)
  }
  const isProtected = ['/learn', '/account', '/admin', '/checkout', '/community'].some((p) =>
    pathname.startsWith(p),
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Come back here after signing in rather than dumping them on the home page.
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Role gate for /admin. Checked here as well as in RLS — middleware keeps
  // the pages from rendering at all, RLS keeps the data safe if it doesn't.
  if (pathname.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/learn'
      return NextResponse.redirect(url)
    }
  }

  // Already signed in? No reason to see the login screen.
  if ((pathname === '/login' || pathname === '/verify') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/learn'
    return NextResponse.redirect(url)
  }

  return response
}
