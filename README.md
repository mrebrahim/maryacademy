# أكاديمية ماري رجائي — Marie Ragaie Beauty Academy

Arabic (Egyptian), RTL-first beauty academy: a marketing site plus a
self-paced video LMS. Launch scope is one course — *Hairstyling Master
Class* — on a data model that is multi-course from day one.

Built phase by phase against the PRD. **Phase 1 (Foundation) is complete.**

---

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in the values
npm run dev                    # http://localhost:3000
```

`.env.local` needs at minimum `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` to render. The service-role, Bunny, Paymob,
Stripe and Resend keys are only needed from Phase 3 onward.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test:rls` | RLS proof over PostgREST (see below) |

---

## Database

Supabase project `mary` (`gdmrzgxylxwdcqfdxyzp`, eu-north-1). Migrations in
`supabase/migrations/` are applied in filename order and are already live on
that project.

| Migration | Contents |
|---|---|
| `…120000_init_enums` | Extensions, 13 enums, `set_updated_at()` |
| `…120100_init_tables` | 13 tables, indexes, constraints, `updated_at` triggers |
| `…120200_init_functions_triggers` | `is_admin`, `has_course_access`, profile provisioning, denormalized course totals, certificate serials, progress rollup, `validate_coupon` |
| `…120300_init_rls` | RLS on every table, column grants, `lessons_public` view |
| `…120400_harden_function_grants` | Pinned `search_path`, revoked RPC access to trigger-only functions |
| `…120500_split_public_read_policies` | Per-role read policies (see note below) |

Seed with `supabase/seed.sql` — idempotent, safe to re-run. It creates the
5 roadmap categories, the Hairstyling course (4 modules, 13 lessons,
12 hours) and the 11 client-supplied testimonials.

### Access model at a glance

| Table | anon | authenticated | notes |
|---|---|---|---|
| `courses`, `posts` | published only | + own drafts if admin | |
| `modules`, `lessons` | metadata of published courses | + enrolled courses | `bunny_video_id` revoked from **both** |
| `lessons_public` (view) | ✅ | ✅ | no `bunny_video_id`, no `attachments` |
| `testimonials` | `is_published` only | + all if admin | publishing requires `permission_status='granted'` |
| `enrollments`, `orders` | ✗ | read own only | writes are service-role only |
| `lesson_progress` | ✗ | read/write own | |
| `coupons` | ✗ | admin only | discounts via `validate_coupon()` RPC |
| `leads` | insert only | insert; read if admin | |

> **Why the read policies are split per role.** The first cut declared them
> `to anon, authenticated` and called `is_admin()`. `anon` has no EXECUTE on
> that function by design, so evaluating the policy raised *permission
> denied for function is_admin* and logged-out visitors could read nothing.
> Migration `…120500` gives `anon` a policy with the plain published-content
> predicate and keeps the admin escape hatch on the `authenticated` policy.

---

## Verifying the video-URL guarantee

The PRD requires proof that an anonymous client and a signed-in-but-not-
enrolled client cannot read `lessons.bunny_video_id`. There are two twins:

**`supabase/tests/rls.sql`** — runs inside Postgres via `set local role`.
Plants a sentinel value, asserts both roles are denied, asserts marketing
metadata still works, and cleans up.

```bash
psql "$SUPABASE_DB_URL" -f supabase/tests/rls.sql
```

Last run — all six assertions passed:

```
PASS: anon denied lessons.bunny_video_id
PASS: anon reads lessons_public metadata
PASS: anon reads published course
PASS: authenticated denied lessons.bunny_video_id
PASS: anon sees 0 unpublished testimonials
PASS: lessons_public carries no protected columns
```

**`npm run test:rls`** — the same assertions over PostgREST with the real
anon key, i.e. what a browser can actually do. It preflights connectivity
and **refuses to run if the host is unreachable**: every assertion is a
denial, so an unreachable host would otherwise report a clean pass while
proving nothing. Run it from a machine with egress to `*.supabase.co`.

---

## Blocked on the client

Phase 2 onward needs answers to these (PRD §13). Placeholders are marked
`⚠️` in the seed and are deliberately loud rather than plausible:

1. **Course price in EGP** and the compare-at price — seeded as `0`.
   Checkout must refuse a course priced at 0 until this is set.
2. **Refund policy** — exists or not? Drives the sales-page guarantee block
   and `/refund-policy`. Not invented here.
3. **Access model** — lifetime, or 12-month expiry? The "free updates for a
   year" bonus implies a window. Schema supports both via
   `enrollments.access_expires_at`.
4. **Live Q&A channel** — WhatsApp, Zoom, or Meet.
5. **Domain.**
6. **Bunny Stream account** — new library or existing? No videos uploaded,
   so every `bunny_video_id` is null.
7. **Paymob merchant account** — onboarding takes days; start before Phase 4.
8. **Testimonial permissions** — all 11 rows are `permission_status='pending'`
   and therefore unpublished. Written permission is required per person
   before any name, handle, photo or quote goes live.

Legal copy for `/terms`, `/privacy`, `/refund-policy` is also outstanding and
blocks go-live (PRD §9.4).
