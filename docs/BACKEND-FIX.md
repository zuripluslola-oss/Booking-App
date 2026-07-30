# Backend fix — how a pro would resolve your situation

## The problem I found (by reading your code, not guessing)
Your app (`app/page.tsx`) talks to **Supabase directly from the browser** — 20 table calls, two RPCs (`create_studio_appointment`, `update_studio_appointment_status`), `supabase.auth`, and Supabase Storage. But your `db/schema.ts` + worker are **Cloudflare D1**. So you have two backends: the one the app *uses* (Supabase) and the one that's *defined but dead* (D1). The app even calls functions and tables that don't exist yet — it was written ahead of its backend.

## The decision (and why)
**Standardize on Supabase. Retire D1.** A pro doesn't rewrite a working app to chase architectural purity before launch. Your app already runs on Supabase — auth, storage, and the RPC-based booking flow are all there in the client. The real gap isn't "wrong database," it's that **the Supabase backend those calls expect was never built**, and there was **no security boundary**. This fix builds exactly what the app calls, and puts the rules where they can't be bypassed.

Two principles applied:
1. **Integrity logic lives in the database, not the browser.** Booking creation, double-booking prevention, and authorization run inside Postgres functions (`security definer`), so a tampered client can't skip them.
2. **Row-Level Security makes client-side calls safe.** Without RLS, any signed-in user could read every business's data. With it, you only ever see rows for businesses you belong to.

## What's in here (`supabase/migrations/`)
- **0001_core_schema.sql** — the tables the app actually uses: `businesses`, `business_members`, `resources`, `services`, `clients`, `appointments`, `client_photos`, plus a `notification_outbox`. Money in cents, times in `timestamptz`. The headline line is the **no-overlap exclusion constraint** on `appointments`: Postgres itself refuses two active appointments on the same resource at overlapping times.
- **0002_rpcs.sql** — the two functions the app already calls. `create_studio_appointment` atomically upserts the client, resolves the service, inserts the appointment (translating an overlap into the `"overlap"` message your UI already handles), bumps visit count, and queues a confirmation. `update_studio_appointment_status` handles check-in/complete/cancel/no-show and tracks no-shows. Both authorize the caller first.
- **0003_rls.sql** — Row-Level Security on every table; member-only access, with a narrow public-read path for published businesses and their active services (for the public booking page).
- **0004_storage.sql** — the `client-photos` storage bucket + policies matching `supabase.storage.from("client-photos")`.

## Verified — I ran it
Applied all migrations against real Postgres (via PGlite) and ran a scenario suite. **10/10 passed:**
- migrations apply cleanly
- owner can create a business + membership
- `create_studio_appointment` persists and returns an id
- client upserted, `visit_count` = 1
- confirmation queued in the outbox
- **double-booking on the same resource is rejected**
- non-overlapping booking succeeds
- **a cancelled slot can be rebooked** (freed correctly)
- `no_show` increments the client's `no_show_count`
- **a non-member cannot book on someone else's business**

## How to apply
1. Put these files in your repo's `supabase/migrations/`.
2. Enable the extensions (Supabase supports both): they're created by 0001 (`pgcrypto`, `btree_gist`).
3. Push: `supabase db push` (or paste each file into the Supabase SQL editor in order).
4. Set the app's env: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (your `app/lib/supabase-browser.ts` reads these).

## Clean up the split-brain (do this)
Now that Supabase is the source of truth, remove the dead D1 setup so no one wires to it by mistake:
- delete `db/` (the D1 Drizzle schema + `db/index.ts`) and the `drizzle/` output
- drop `drizzle-orm` / `drizzle-kit` from `package.json` and the `db:generate` script
- remove the `d1` binding from `.openai/hosting.json`
- keep `@supabase/*` (now the real backend)

> Note: this supersedes the earlier `schema.ts` consolidation, which merged everything onto D1. Since your app actually runs on Supabase, D1 is the side to drop — not the side to keep. Same goal (one source of truth), correct direction given what the code really does.

## What this unlocks next
With bookings persisting through one real backend, the competitive gaps now have somewhere to live:
- **reminders/campaigns** — a scheduled job drains `notification_outbox`
- **waitlist** — add a `waitlist` table; on cancel, the status RPC offers the freed slot
- **analytics** — SQL aggregates over `appointments` (revenue, no-show rate, rebooking)
Say which and I'll build it on top of this.
