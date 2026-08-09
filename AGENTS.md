# Marie Ragaie Beauty Academy — working notes

Arabic-language (Egyptian), RTL-first beauty academy: marketing site plus a
self-paced video LMS. Built phase by phase against the PRD; do not jump ahead.

## Stack

Next.js 15 (App Router, Server Components by default) · TypeScript ·
Tailwind CSS v4 · Supabase (Postgres + Auth + Storage + RLS) ·
Bunny Stream for video · Paymob/Stripe · Resend · Vercel.

Supabase project: `mary` (`gdmrzgxylxwdcqfdxyzp`, eu-north-1).

## Non-negotiables

- **RTL.** `<html dir="rtl" lang="ar">`. Use logical properties only —
  `ms-/me-/ps-/pe-/start-/end-`, never `ml-/mr-/pl-/pr-/left-/right-`.
- **Arabic in the product, English in the code.** Identifiers, comments and
  commit messages are English; every user-facing string is Arabic.
- **Money is stored in minor units.** `price_egp` is piastres, `price_usd`
  is cents. Never trust a price sent from the client — read it from the DB.
- **`lessons.bunny_video_id` never reaches a client.** Column SELECT is
  revoked from `anon` and `authenticated`; only the service-role client can
  read it, and only inside the video-token route handler. Marketing pages
  query the `lessons_public` view.
- **Secrets are server-only.** Anything not prefixed `NEXT_PUBLIC_` must be
  reachable only from modules that import `server-only`.
- **Testimonials carry `source`.** The academy has zero online students; at
  launch every row is `in_person_training` and the UI must say so. A row
  cannot be published unless `permission_status = 'granted'` (DB constraint).

## Layout

```
src/app/          routes (App Router)
src/components/   ui/ primitives, layout/ shell
src/config/       site config — homepage stats live here, not in JSX
src/lib/          fonts, utils, supabase/{client,server,admin}.ts
supabase/migrations/  ordered SQL, applied to the live project
supabase/seed.sql     idempotent seed
supabase/tests/rls.sql  RLS proof
scripts/verify-rls.ts   same proof over PostgREST
```

Three Supabase clients, pick deliberately:
`client.ts` (browser, anon) · `server.ts` (RSC/handlers, caller's session,
RLS applies) · `admin.ts` (service role, bypasses RLS — webhooks, video
tokens, audited admin writes; enforce your own authorization).

## Commands

```
npm run dev        npm run build       npm run lint
npm run test:rls   # refuses to run if it cannot reach PostgREST
```
