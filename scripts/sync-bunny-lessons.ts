/**
 * Builds the course's lessons from what is actually in the Bunny library.
 *
 *   npm run bunny:lessons            # list what is there, write the SQL
 *   npm run bunny:lessons -- --dry   # list only
 *
 * Why a script rather than typing the ids in by hand: a Bunny GUID is 36
 * characters of hex and there is one per lesson. Transcribing them is a
 * guaranteed source of a lesson that silently plays the wrong video, and
 * the only way to notice is to watch every one.
 *
 * It does not write to the database. It prints SQL for review, because
 * these rows decide what students see and what they paid for — that is
 * worth a human reading before it runs.
 *
 * Ordering follows what the academy asked for: التجهيزات first, then
 * Look 1, Look 2, and so on. The number is taken from the video's own
 * title where there is one, so re-uploading a single video does not
 * reshuffle the course; upload date is only the tie-breaker.
 */
import { writeFileSync } from 'node:fs'

import { config } from 'dotenv'

// `.env.local` explicitly, like the other scripts here: `dotenv/config`
// reads `.env` only, and the Bunny keys live in `.env.local` because it
// is the gitignored one.
config({ path: '.env.local' })

const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID
const API_KEY = process.env.BUNNY_STREAM_READONLY_API_KEY ?? process.env.BUNNY_STREAM_API_KEY
const COURSE_SLUG = process.env.BUNNY_COURSE_SLUG ?? 'hairstyling-master-class'

const OUT = 'supabase/generated/lessons.sql'

type BunnyVideo = {
  guid: string
  title: string
  length: number
  dateUploaded: string
  status: number
}

function fail(message: string): never {
  console.error(`\n${message}\n`)
  process.exit(1)
}

/** Any Arabic-Indic or Western digit sequence in the title. */
function numberIn(title: string): number | null {
  const normalised = title.replace(/[٠-٩]/g, (d) =>
    String(d.charCodeAt(0) - 0x0660),
  )
  const match = normalised.match(/\d+/)
  return match ? Number(match[0]) : null
}

function isPrep(title: string): boolean {
  return /تجهيز|التحضير|prep/i.test(title)
}

async function main() {
  if (!LIBRARY_ID) fail('BUNNY_STREAM_LIBRARY_ID is not set. Add it to .env.local.')
  if (!API_KEY) {
    fail('BUNNY_STREAM_READONLY_API_KEY (or BUNNY_STREAM_API_KEY) is not set in .env.local.')
  }

  const response = await fetch(
    `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos?page=1&itemsPerPage=500&orderBy=date`,
    { headers: { AccessKey: API_KEY!, accept: 'application/json' } },
  )

  if (!response.ok) {
    fail(
      `Bunny refused the request (${response.status}).\n` +
        'Check the library id and that the key belongs to THIS library — a key\n' +
        'from another library returns 401 and looks like a wrong key.',
    )
  }

  const body = (await response.json()) as { items: BunnyVideo[] }
  const videos = body.items ?? []

  if (videos.length === 0) fail(`Library ${LIBRARY_ID} has no videos yet.`)

  // Status 4 is "finished encoding". Anything else cannot be played, and a
  // lesson pointing at it would look broken rather than unfinished.
  const ready = videos.filter((v) => v.status === 4)
  const notReady = videos.filter((v) => v.status !== 4)

  const prep = ready.filter((v) => isPrep(v.title))
  const looks = ready
    .filter((v) => !isPrep(v.title))
    .sort((a, b) => {
      const na = numberIn(a.title)
      const nb = numberIn(b.title)
      if (na !== null && nb !== null && na !== nb) return na - nb
      if (na !== null && nb === null) return -1
      if (na === null && nb !== null) return 1
      return a.dateUploaded.localeCompare(b.dateUploaded)
    })

  const ordered = [...prep, ...looks]

  const lessons = ordered.map((video, index) => ({
    guid: video.guid,
    bunnyTitle: video.title,
    seconds: Math.round(video.length),
    titleAr: index < prep.length ? 'التجهيزات' : `Look ${index - prep.length + 1}`,
    slug: index < prep.length ? 'prep' : `look-${index - prep.length + 1}`,
    sortOrder: index + 1,
    // The first lesson is the free preview: it is what someone who has not
    // paid is allowed to watch, and prep is the right thing to show them.
    freePreview: index === 0,
  }))

  console.log(`\nLibrary ${LIBRARY_ID} — ${ready.length} ready, ${notReady.length} still encoding\n`)
  for (const lesson of lessons) {
    const mins = Math.floor(lesson.seconds / 60)
    console.log(
      `  ${String(lesson.sortOrder).padStart(2)}. ${lesson.titleAr.padEnd(10)} ` +
        `${String(mins).padStart(3)} min  ${lesson.guid}  ← "${lesson.bunnyTitle}"` +
        (lesson.freePreview ? '  [free preview]' : ''),
    )
  }
  if (notReady.length > 0) {
    console.log('\n  Still encoding, left out:')
    for (const v of notReady) console.log(`    - ${v.title} (status ${v.status})`)
  }

  if (process.argv.includes('--dry')) {
    console.log('\nDry run — no SQL written.\n')
    return
  }

  const values = lessons
    .map(
      (l) =>
        `    ('${l.slug}', ${escape(l.titleAr)}, ${l.sortOrder}, ${l.seconds}, ` +
        `'${l.guid}', ${l.freePreview})`,
    )
    .join(',\n')

  const sql = `-- Generated by scripts/sync-bunny-lessons.ts — do not edit by hand.
-- Library ${LIBRARY_ID}, ${lessons.length} lessons, ${new Date().toISOString()}
--
-- Idempotent: re-running updates the video id, title and duration of a
-- lesson that already exists rather than inserting a second copy. The
-- unique key is (course_id, slug).

do $$
declare
  v_course uuid;
  v_module uuid;
begin
  select id into v_course from public.courses where slug = '${COURSE_SLUG}';
  if v_course is null then
    raise exception 'course % not found', '${COURSE_SLUG}';
  end if;

  select id into v_module from public.modules
   where course_id = v_course order by sort_order limit 1;

  if v_module is null then
    insert into public.modules (course_id, title_ar, sort_order)
    values (v_course, 'الدورة الكاملة', 1)
    returning id into v_module;
  end if;

  with incoming (slug, title_ar, sort_order, duration_seconds, bunny_video_id, is_free_preview) as (
    values
${values}
  )
  insert into public.lessons
    (course_id, module_id, slug, title_ar, sort_order, duration_seconds, bunny_video_id, is_free_preview)
  select v_course, v_module, i.slug, i.title_ar, i.sort_order, i.duration_seconds,
         i.bunny_video_id, i.is_free_preview
  from incoming i
  on conflict (course_id, slug) do update
    set title_ar        = excluded.title_ar,
        sort_order      = excluded.sort_order,
        duration_seconds = excluded.duration_seconds,
        bunny_video_id  = excluded.bunny_video_id,
        is_free_preview = excluded.is_free_preview;

  -- The Bunny library is the source of truth for what the course contains.
  -- Anything left over is a lesson that no longer has a video behind it —
  -- usually one of the seeded placeholders — and a student seeing a lesson
  -- that cannot play is worse than not seeing it at all.
  --
  -- Progress rows cascade with the lesson, so this is only safe while a
  -- removed lesson is genuinely not part of the course. It will refuse
  -- rather than silently discard a student's progress.
  if exists (
    select 1
    from public.lesson_progress lp
    join public.lessons l on l.id = lp.lesson_id
    where l.course_id = v_course
      and l.slug not in (${lessons.map((l) => `'${l.slug}'`).join(', ')})
  ) then
    raise exception
      'Refusing to remove lessons that students have progress on. Reconcile by hand.';
  end if;

  delete from public.lessons
   where course_id = v_course
     and slug not in (${lessons.map((l) => `'${l.slug}'`).join(', ')});
end $$;
`

  writeFileSync(OUT, sql)
  console.log(`\nWrote ${OUT}`)
  console.log('Read it, then paste it into the Supabase SQL editor.\n')
}

/** Single-quote escaping for a SQL string literal. */
function escape(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

main().catch((error) => fail(String(error)))
