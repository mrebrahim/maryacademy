import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Service-role client. Bypasses RLS entirely.
 *
 * Use it ONLY where the PRD requires server-authoritative writes:
 *   - payment webhooks creating orders/enrollments (§6.1)
 *   - the Bunny playback token endpoint reading bunny_video_id (§6.2)
 *   - admin mutations that also write audit_log (§8)
 *
 * The `server-only` import above makes importing this from a Client
 * Component a build error, so the key can never reach the browser bundle.
 * Every caller is responsible for its own authorization check — this
 * client has none.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Server-side fulfilment cannot run without it.',
    )
  }

  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
