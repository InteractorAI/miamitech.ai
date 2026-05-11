# MiamiTech.ai

MiamiTech.ai is an ecosystem guide for Miami tech: communities, spaces, capital, accelerators, conferences, ambassadors, news, FAQs, and upcoming events.

The product is intentionally simple on the surface. Google Sheets stays the human-editable source for the ecosystem index. Supabase handles operational event data that is too dynamic and relational for a sheet. The Next.js app brings both together into a fast, scannable public experience with Interactor available as the concierge layer.

## What It Does

- Helps visitors discover Miami tech resources.
- Shows upcoming ecosystem events from approved calendars and feeds.
- Connects events back to the communities, spaces, conferences, and resources they came from.
- Gives users quick paths to ask Interactor about a resource, visit an external site, or browse a focused section.
- Supports staging-first review before changes are promoted to production.

## Stack

- **Next.js / React / TypeScript** for the app.
- **Tailwind CSS** for styling.
- **Google Sheets** for the curated ecosystem index.
- **Supabase Postgres** for event storage, source state, event associations, and event curation fields.
- **Vercel** for hosting, preview/staging deploys, production, analytics, and cron.
- **Interactor** for in-app assistant actions.

## Core Architecture

### Directory Data

Most directory sections read directly from the Google Sheet at request time:

- Capital
- Spaces
- Coffee Shops
- Communities
- Conferences
- Ambassadors
- News
- FAQs
- Accelerators

The sheet config lives in [src/lib/googleSheets.ts](src/lib/googleSheets.ts). Keep sheet fields human-readable. Avoid putting machine fields like fetch timestamps, parser names, confidence scores, dedupe keys, or ingestion errors into the sheet.

### Event Data

Events use Supabase because events are richer and more operational than static directory rows.

Supabase stores:

- `entities`: synced ecosystem entities from the sheet.
- `event_sources`: approved calendars and feeds attached to entities.
- `events`: normalized event records.
- `event_entities`: links between events and entities.
- `entity_aliases`: optional aliases for conservative venue/resource matching.

The schema lives in [supabase/migrations](supabase/migrations).

### Event Ingestion Flow

1. Read event-owning entities from Google Sheets.
2. Upsert entities and event sources into Supabase.
3. Fetch active event sources.
4. Normalize events into a common shape.
5. Dedupe events.
6. Attach each event to its source entity.
7. Attach venue/entity matches when confidence is high.
8. Render upcoming events from Supabase in the app.

The ingestion endpoint is:

```text
/api/jobs/ingest-events
```

It accepts `GET` or `POST` and uses `CRON_SECRET` or `EVENT_INGEST_SECRET` when configured.

Run ingestion with:

```bash
npm run ingest:events
```

Targets local dev at `http://localhost:3000`.

```bash
npm run ingest:events:staging
```

Targets `https://staging.miamitech.ai`.

```bash
npm run ingest:events:prod
```

Targets `https://miamitech.ai`.

One-off events can be added from `/admin/events` without adding a recurring source. Admin can also run ingestion on demand from the same page. Manual intake uses `/api/admin/events/manual`, protected by the same event/admin secrets as the event ingestion and curation routes. It currently supports single Luma event pages and saves them into the normal `events` table.

Vercel Cron runs the production ingestion job automatically every 6 hours:

```text
0 */6 * * *
```

Cron only runs on production deployments, so staging ingestion is manual.

## Getting Started

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment

Local development expects a `.env.local` file for Supabase and ingestion auth:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
EVENT_DISTRIBUTION_SECRET=
OPENAI_API_KEY=
EVENT_COPY_MODEL=gpt-5.4-mini
```

The ingestion script reads `CRON_SECRET` or `EVENT_INGEST_SECRET` from the current environment or `.env.local`. Optional target-specific secrets are also supported:

```bash
CRON_SECRET_STAGING=
CRON_SECRET_PRODUCTION=
EVENT_INGEST_SECRET_STAGING=
EVENT_INGEST_SECRET_PRODUCTION=
```

The ingestion script also supports a custom target URL:

```bash
EVENT_INGEST_URL=https://example.com npm run ingest:events
```

### Event Distribution Preview

Event ingestion now seeds internal distribution jobs for outbound event reminders. The first distribution version only renders reviewable previews; it does not connect to Buffer, X, or an email provider.

When `OPENAI_API_KEY` is configured, event reminder previews use `EVENT_COPY_MODEL` to generate more human X copy from verified event facts. The deterministic renderer remains the fallback and still controls URL inclusion, length limits, eligibility, and dedupe behavior.

Preview generated event reminder and weekly digest copy with:

```bash
npm run preview:event-distribution
```

Targets are also available for staging and production:

```bash
npm run preview:event-distribution:staging
npm run preview:event-distribution:prod
```

The preview script reads `EVENT_DISTRIBUTION_SECRET`, `EVENT_INGEST_SECRET`, or `CRON_SECRET` from the environment or `.env.local`. It supports:

```bash
npm run preview:event-distribution -- --window-days=21 --limit=100
npm run preview:event-distribution -- --no-enqueue
npm run preview:event-distribution -- --no-digest
```

Review and curate upcoming event distribution at:

```text
/admin/events
```

The curation API is protected by `EVENT_DISTRIBUTION_SECRET`, `EVENT_INGEST_SECRET`, or `CRON_SECRET`. The admin page stores the entered secret in local browser storage and uses it only for requests to `/api/admin/events`.

## Common Commands

```bash
npm run dev
```

Start the Next.js dev server on `0.0.0.0`.

```bash
npm run build
```

Run a production build. This uses [scripts/build.mjs](scripts/build.mjs), which restores the canonical `next-env.d.ts` route-types import after the build.

## Event Source Notes

The first source adapters support Luma-style calendar feeds, iCal, and RSS/Atom-style sources where event dates can be parsed.

Humans still choose which calendars belong in the sheet. The system is not trying to crawl the whole internet for events. That keeps the data set intentional, reviewable, and tied to known ecosystem resources.

## Design Rules

- Blue is for external links.
- Pink is for Interactor and in-app actions.
- Keep the dashboard dense, scannable, and useful.
- Avoid marketing-page patterns inside the app.
- Use compact text tabs inside panel headers when a directory needs a curated sub-view; active state should use text color plus a barely visible neutral background, not bold type, pink pills, or underlines.
- Directory rows should stay dense and scan-first: primary name, muted context, then pink Interactor actions and blue external links.
- Use explicit action controls on touch/mobile instead of relying on hidden row click behavior.
- Keep keyboard focus visible, especially for rows and controls.
- Contrast-oriented themes can be louder; default themes should stay quieter.

## Staging and Production

Staging:

```text
https://staging.miamitech.ai
```

Production:

```text
https://miamitech.ai
```

The event aggregation branch is staged before production promotion. Do not use production deploys for staging review.

## Shipping

For production shipping, follow [AGENTS.md](AGENTS.md):

1. Push `main`.
2. Run:

```bash
npx vercel --prod --yes
```

3. Confirm the production deployment aliases to:

```text
https://miamitech.ai
```

## Project Structure

```text
src/app/                  Next.js routes and API routes
src/components/           UI sections and shared components
src/lib/googleSheets.ts   Sheet config, parsers, and mappers
src/lib/events/           Event sync, ingestion, adapters, query helpers
scripts/                  Local operational scripts
supabase/migrations/      Supabase schema and policies
vercel.json               Vercel project and cron config
```

## Current Product Surfaces

- `/` main dashboard
- `/events` expanded events view
- `/capital` expanded capital view
- `/accelerators` expanded accelerators view
- `/api/events` public event API
- `/api/jobs/ingest-events` protected ingestion job

## Changelog

Product-facing release notes live in [CHANGELOG.md](CHANGELOG.md).
