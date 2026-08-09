'use client'

import { createBrowserClient } from '@supabase/ssr'

import { env } from '@/lib/env'
import type { Database } from './database.types'

/** Browser client. Anon key only — RLS is what protects the data. */
export function createClient() {
  return createBrowserClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
  )
}
