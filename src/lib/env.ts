/**
 * Required public environment variables, checked at module load.
 *
 * Without these the Supabase clients construct but every query fails, and
 * because the marketing fetchers degrade to empty on error, the result is a
 * site that builds green and renders with whole sections silently missing —
 * courses gone, testimonials gone, no error anywhere. That failure mode cost
 * real debugging time, so it is now loud: the build stops with a message
 * naming exactly what is unset and where to set it.
 */
const REQUIRED = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const

const missing = REQUIRED.filter((key) => !process.env[key])

if (missing.length > 0) {
  throw new Error(
    [
      '',
      `Missing required environment variable(s): ${missing.join(', ')}`,
      '',
      'Without them nothing loads from the database — courses, testimonials and',
      'the curriculum all render empty.',
      '',
      'Locally:  copy .env.example to .env.local and fill the values in.',
      'Vercel:   Project → Settings → Environment Variables, then redeploy.',
      '          (Adding a variable does not rebuild on its own.)',
      '',
      'Both values are in Supabase → Project Settings → API.',
      '',
    ].join('\n'),
  )
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
} as const
