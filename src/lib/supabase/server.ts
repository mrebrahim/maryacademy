import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

import { env } from '@/lib/env'
import type { Database } from './database.types'

/**
 * Server client bound to the caller's session cookies. Reads run as that
 * user, so RLS applies — this is the client every Server Component and
 * most Route Handlers should use.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Session refresh is handled by middleware instead.
          }
        },
      },
    },
  )
}

/**
 * Cookie-free anon client for public content.
 *
 * `createClient()` above reads cookies, which opts a page out of static
 * rendering — every homepage request becomes SSR. Marketing pages show the
 * same published content to everyone, so they have no reason to look at a
 * session. This client lets them stay static/ISR, which is what PRD §10
 * asks for.
 *
 * RLS still applies: this is the anon role, so it sees exactly what a
 * logged-out visitor sees.
 */
export function createAnonClient() {
  return createSupabaseClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
