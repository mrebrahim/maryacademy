/**
 * Bulk-upload the trainee screenshots to Supabase Storage.
 *
 *   npm run upload:testimonials -- ./path/to/folder
 *
 * Reads every row in `testimonials`, works out which filename each one
 * expects from its `asset_path`, finds a matching file in the folder you
 * point at, and uploads it to the `testimonials` bucket under that exact
 * name. Anything already uploaded is skipped unless you pass --force.
 *
 * Matching is by the number in the filename, so `img-0008.jpg`,
 * `IMG_0008.PNG` and `8.jpeg` all resolve to slot 8. Files that match
 * nothing are reported rather than silently ignored.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in .env.local — writes to the bucket are
 * admin-only, and this runs outside a browser session.
 *
 * Before running, crop the screenshots: phone status bars, story thumbnail
 * strips, message input bars, and any visible phone numbers. Faces of third
 * parties — brides, and the trainees' own clients — need cropping or
 * blurring unless permission covers them too. Back-of-head result photos are
 * already fine as they are.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const BUCKET = 'testimonials'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.\n' +
      'The service-role key is in Supabase → Project Settings → API. Keep it out of git.',
  )
  process.exit(1)
}

const folderArg = process.argv[2]
if (!folderArg) {
  console.error('Usage: npm run upload:testimonials -- ./folder-with-screenshots')
  process.exit(1)
}

const folder = resolve(folderArg)
const force = process.argv.includes('--force')

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}

/** Leading/trailing digits in a filename -> slot number. `img-0008` -> 8. */
function slotOf(filename: string): number | null {
  const match = filename.match(/(\d+)(?!.*\d)/)
  return match ? Number(match[1]) : null
}

async function main() {
  if (!statSync(folder, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`Not a folder: ${folder}`)
    process.exit(1)
  }

  const admin = createClient(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: rows, error } = await admin
    .from('testimonials')
    .select('name, asset_path, media_type')
    .order('sort_order')

  if (error) {
    console.error('Could not read testimonials:', error.message)
    process.exit(1)
  }

  // asset_path is stored as "testimonials/img-0008.jpg"; the bucket name is
  // the prefix, so strip it to get the object key.
  const wanted = new Map<number, { key: string; name: string }>()
  for (const row of rows ?? []) {
    if (!row.asset_path) continue
    const key = row.asset_path.replace(/^testimonials\//, '')
    const slot = slotOf(key)
    if (slot !== null) wanted.set(slot, { key, name: row.name })
  }

  const files = readdirSync(folder).filter((f) => MIME[extname(f).toLowerCase()])
  const bySlot = new Map<number, string>()
  const unmatched: string[] = []

  for (const file of files) {
    const slot = slotOf(file)
    if (slot !== null && wanted.has(slot) && !bySlot.has(slot)) bySlot.set(slot, file)
    else unmatched.push(file)
  }

  let uploaded = 0
  let skipped = 0
  const missing: string[] = []

  for (const [slot, target] of [...wanted.entries()].sort((a, b) => a[0] - b[0])) {
    const file = bySlot.get(slot)

    if (!file) {
      missing.push(`${target.key}  ← ${target.name}`)
      continue
    }

    const body = readFileSync(join(folder, file))
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(target.key, body, {
        contentType: MIME[extname(file).toLowerCase()],
        upsert: force,
      })

    if (uploadError) {
      if (!force && /exists/i.test(uploadError.message)) {
        console.log(`  skip    ${target.key} (already uploaded — use --force to replace)`)
        skipped++
        continue
      }
      console.error(`  FAILED  ${target.key}: ${uploadError.message}`)
      continue
    }

    console.log(`  ok      ${file}  →  ${target.key}  (${target.name})`)
    uploaded++
  }

  console.log(`\n${uploaded} uploaded, ${skipped} already there.`)

  if (missing.length) {
    console.log(`\nNo file found for ${missing.length} testimonial(s):`)
    missing.forEach((m) => console.log(`  ${m}`))
  }

  if (unmatched.length) {
    console.log(`\n${unmatched.length} file(s) matched no testimonial slot:`)
    unmatched.forEach((f) => console.log(`  ${f}`))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
