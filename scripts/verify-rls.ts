/**
 * RLS proof over the wire — PRD §5.2.
 *
 * Talks to PostgREST with the real anon key, i.e. exactly what a browser
 * or a curl one-liner can do. The SQL-level twin lives in
 * supabase/tests/rls.sql.
 *
 *   npm run test:rls
 *
 * Exits non-zero on the first failed assertion.
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local')
  process.exit(1)
}

const anon = createClient(url, anonKey)

let failures = 0

function check(name: string, passed: boolean, detail?: unknown) {
  if (passed) {
    console.log(`  PASS  ${name}`)
  } else {
    failures++
    console.error(`  FAIL  ${name}`, detail ?? '')
  }
}

/**
 * Preflight. Every assertion below is a negative one ("this must be
 * rejected"), so an unreachable host would make the whole suite pass for
 * the wrong reason. Prove we can talk to PostgREST first.
 */
async function preflight() {
  const { error } = await anon.from('courses').select('id').limit(1)
  if (error) {
    console.error(
      `Cannot reach PostgREST at ${url} — refusing to run.\n` +
        `Every check here asserts a denial, so an unreachable host would\n` +
        `report a clean pass while proving nothing.\n\n` +
        `  ${error.message}\n`,
    )
    process.exit(1)
  }
}

async function main() {
  console.log('RLS checks against', url, '\n')
  await preflight()

  // 1. The protected column must be unreachable by name.
  {
    const { data, error } = await anon.from('lessons').select('bunny_video_id')
    check(
      'anon cannot select lessons.bunny_video_id',
      Boolean(error) && !data,
      error ? `(rejected: ${error.message})` : `(leaked ${JSON.stringify(data)})`,
    )
  }

  // 2. `select *` must not sneak it out either.
  {
    const { data, error } = await anon.from('lessons').select('*').limit(1)
    const leaked = data?.some((row) => 'bunny_video_id' in row) ?? false
    check(
      'anon cannot select * from lessons',
      Boolean(error) || !leaked,
      leaked ? '(row contained bunny_video_id)' : '',
    )
  }

  // 3. Same for attachments.
  {
    const { data, error } = await anon.from('lessons').select('attachments')
    check(
      'anon cannot select lessons.attachments',
      Boolean(error) && !data,
      error ? `(rejected: ${error.message})` : `(leaked ${JSON.stringify(data)})`,
    )
  }

  // 4. Marketing metadata must still work, or the sales page is dead.
  {
    const { data, error } = await anon
      .from('lessons_public')
      .select('id, title_ar, duration_seconds, is_free_preview')
    check('anon can read lessons_public', !error && (data?.length ?? 0) > 0, error?.message)
    check(
      'lessons_public rows carry no protected columns',
      !data?.some((row) => 'bunny_video_id' in row || 'attachments' in row),
    )
  }

  // 5. Published course visible, curriculum visible.
  {
    const { data, error } = await anon
      .from('courses')
      .select('slug, status, lesson_count')
      .eq('slug', 'hairstyling-master-class')
      .maybeSingle()
    check('anon can read the published course', !error && data?.status === 'published', error?.message)
  }

  // 6. Unpublished content stays hidden (all testimonials await permission).
  {
    const { data, error } = await anon.from('testimonials').select('id')
    check('anon sees zero unpublished testimonials', !error && data?.length === 0, error?.message)
  }

  // 7. Coupons are never readable; discounts come from validate_coupon only.
  {
    const { data, error } = await anon.from('coupons').select('code')
    check('anon cannot read coupons', Boolean(error) || data?.length === 0, error?.message)
  }

  // 8. Fulfilment tables are server-write-only.
  {
    const { error } = await anon
      .from('enrollments')
      .insert({ user_id: '00000000-0000-0000-0000-000000000000', course_id: '00000000-0000-0000-0000-000000000000' })
    check('anon cannot insert an enrollment', Boolean(error), error ? `(rejected: ${error.message})` : '')
  }
  {
    const { error } = await anon
      .from('orders')
      .insert({ user_id: '00000000-0000-0000-0000-000000000000', course_id: '00000000-0000-0000-0000-000000000000', amount: 0, provider: 'manual' })
    check('anon cannot insert an order', Boolean(error), error ? `(rejected: ${error.message})` : '')
  }

  console.log(failures === 0 ? '\nAll RLS checks passed.' : `\n${failures} RLS check(s) FAILED.`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
