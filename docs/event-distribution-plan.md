# Event Distribution Plan

## Objective

MiamiTech.ai should turn approved ingested events into useful outbound content that can be reviewed before any external publishing tool is connected.

The first version should generate reviewable post and digest previews from Supabase event data. Buffer, email, and other destinations should be adapters that can be wired in after the generated content and timing feel right.

## Principles

- Keep ingestion focused on event truth: source sync, event normalization, dedupe, and associations.
- Keep distribution separate: what should be sent, when it is due, which channel it targets, and whether it has already been handled.
- Start with previews, not publishing.
- Treat Buffer as an optional output adapter, not the foundation.
- Make email and social use the same event selection logic, with channel-specific rendering.
- Keep human review in the loop until the cadence and copy quality are proven.

## V1 Scope

V1 should create an internal distribution queue and a simple way to inspect generated posts before Buffer is connected.

Included:

- A Supabase table for event distribution jobs.
- Idempotent job creation for event reminder posts.
- A weekly digest job shape that can support both X and email later.
- Copy renderers for individual event reminders and weekly digests.
- A protected preview endpoint that returns generated posts and digest content as JSON.
- No Buffer credentials, no X API integration, and no live email sending.

Not included:

- Direct posting to X.
- Buffer draft creation.
- Email provider integration.
- Public admin UI.
- Fully autonomous publishing.

## Data Model

Add `event_distribution_jobs`.

Suggested fields:

- `id uuid primary key`
- `event_id uuid null references events(id) on delete cascade`
- `channel text not null`
- `kind text not null`
- `due_at timestamptz not null`
- `status text not null default 'pending'`
- `payload jsonb`
- `preview_text text`
- `external_id text`
- `last_error text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Suggested `channel` values:

- `buffer_x`
- `email`

Suggested `kind` values:

- `event_reminder`
- `weekly_digest`

Suggested `status` values:

- `pending`
- `previewed`
- `sent_to_buffer`
- `sent_email`
- `skipped`
- `error`

Recommended unique constraints:

- One event reminder per event/channel/kind.
- One weekly digest per channel/kind/week start.

The weekly digest needs a stable week key. This can live in `payload.week_start` or as a dedicated `digest_window_start` column if querying becomes awkward.

## Job Creation

After event ingestion completes, run an enqueue step that writes internal distribution jobs only.

For every visible active event:

- Create `buffer_x/event_reminder`.
- Set `due_at` to 24 hours before `starts_at`.
- Skip if the event has already started.
- Skip if an equivalent job already exists.

For weekly digest:

- Create `buffer_x/weekly_digest`.
- Create `email/weekly_digest`.
- Set `due_at` to Sunday at 7:00 p.m. America/New_York.
- Define the digest window as the upcoming Monday through Sunday in America/New_York.

The first implementation can create weekly digest jobs from a dedicated endpoint rather than coupling this to every ingestion run.

## Curation

Distribution should default to all visible active events, but the system needs a simple way to demote events that should not be promoted outbound.

Recommended default:

- Include visible active events unless they are explicitly demoted or hidden.
- Keep `hidden` for events that should not appear publicly.
- Add a lightweight curation flag for events that can remain listed on MiamiTech.ai but should not be included in outbound event reminders or digest highlights.
- Eventually expose this through a simple internal UI so the event list can be reviewed without touching the database directly.

The first implementation can support the data flag before the UI exists.

## Preview Endpoint

Add a protected endpoint:

```text
/api/jobs/event-distribution-preview
```

It should:

- Require the existing cron/job secret pattern.
- Find due or upcoming pending distribution jobs.
- Render copy from current event data.
- Store the rendered preview in `preview_text` and structured metadata in `payload`.
- Return JSON grouped by channel and kind.

Example response shape:

```json
{
  "ok": true,
  "jobs": [
    {
      "id": "uuid",
      "channel": "buffer_x",
      "kind": "event_reminder",
      "dueAt": "2026-05-04T22:00:00.000Z",
      "event": {
        "title": "Event title",
        "startsAt": "2026-05-05T22:00:00.000Z",
        "url": "https://..."
      },
      "previewText": "Tomorrow in Miami tech: Event title..."
    }
  ]
}
```

This gives us a simple review surface before Buffer exists.

## Copy Rules

Event reminder post:

- Mention when the event happens.
- Mention title and primary organizer/source when available.
- Include location if useful and compact.
- Link directly to the event source URL so the post is maximally useful to readers.
- Stay under X length limits with room for link expansion.
- Avoid hype when the source data is thin.

Weekly X digest:

- Lead with a concise Miami tech weekly framing.
- Include 3-6 strongest upcoming events.
- Prefer events with clear source, date, and URL.
- Link to the MiamiTech.ai events page for the full list.

Weekly email digest:

- Use the same event window as the X digest.
- Include more events than X can carry.
- Group by day.
- Include title, source, time, location, and URL.

## Suggested V1 Implementation Steps

1. Add the `event_distribution_jobs` migration.
2. Add event distribution types and query helpers under `src/lib/events`.
3. Add copy renderers for event reminders and weekly digests.
4. Add an enqueue function for event reminder jobs.
5. Call the enqueue function after ingestion succeeds.
6. Add the protected preview endpoint.
7. Add a local script to call the preview endpoint, mirroring `scripts/ingest-events.mjs`.
8. Manually inspect generated JSON after a production or staging ingestion run.

## Later Phases

Phase 2: Buffer drafts

- Add Buffer credentials.
- Add a `buffer_x` adapter that creates Buffer drafts only.
- Store Buffer post IDs in `external_id`.
- Mark successful jobs as `sent_to_buffer`.
- Keep approval inside Buffer.

Phase 3: Email drafts or sends

- Choose the email provider.
- Add an `email` adapter.
- Start with draft/test-recipient mode.
- Move to live digest sending only after content quality is stable.

Phase 4: Admin review UI

- Add a small internal review surface if JSON inspection becomes too clunky.
- Show pending jobs, preview text, source event, due time, and action status.

## Open Decisions

- Which email provider should handle the digest?
- What should the simple curation UI look like?

## Recommended Default

Use Monday through Sunday for the weekly digest, generate preview jobs first, and defer Buffer until the preview output feels consistently useful.

For event reminders, start with all visible active events but expect to add a curation filter quickly. The distribution queue should make that easy without changing ingestion.
