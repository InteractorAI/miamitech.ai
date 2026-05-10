# Event Distribution Plan

## Objective

MiamiTech.ai should turn approved ingested events into useful outbound content that can be reviewed before any external publishing tool is connected.

The current next phase gives admin a simple Sunday X digest composer. It generates the digest from approved upcoming events, then opens X compose for manual posting.

## Principles

- Keep ingestion focused on event truth: source sync, event normalization, dedupe, and associations.
- Keep distribution separate: what should be sent, when it is due, which channel it targets, and whether it has already been handled.
- Keep preview generation available for review and debugging.
- Treat X publishing as manual for now; Buffer can handle direct X integration later if needed.
- Make email and social use the same event selection logic, with channel-specific rendering.
- Keep human review in the loop until the cadence and copy quality are proven.

## Current Scope

The event distribution queue supports reviewable previews plus the admin weekly X digest composer.

Included:

- A Supabase table for event distribution jobs.
- Idempotent job creation for event reminder posts.
- A weekly digest job shape that can support both X and email later.
- Copy renderers for individual event reminders and weekly digests.
- A protected preview endpoint that returns generated posts and digest content as JSON.
- A protected admin digest endpoint that renders ready-to-post X copy.
- Admin curation through `/admin/events`, where `promote_outbound = false` removes an event from outbound posts and digests.

Not included:

- Direct posting to X.
- Buffer draft creation.
- Email provider integration.

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

Supported `status` values:

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

The admin digest endpoint creates the relevant digest job idempotently before rendering copy.

## Curation

Distribution should default to all visible active events, but the system needs a simple way to demote events that should not be promoted outbound.

Recommended default:

- Include visible active events unless they are explicitly demoted or hidden.
- Keep `hidden` for events that should not appear publicly.
- Add a lightweight curation flag for events that can remain listed on MiamiTech.ai but should not be included in outbound event reminders or digest highlights.
- Exclude known aggregator feeds from outbound digest generation. Refresh Miami is currently treated as an aggregator source because its feed republishes many outside events and the normalized data does not reliably identify which events are Refresh-owned.
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
- Include the upcoming digest events without an artificial short-post cap.
- Prefer events with clear source, date, and URL.
- Keep the generated digest link-free.
- Include the source community/group on each event line when available.

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

## Weekly X Digest

The admin endpoint is:

```text
/api/admin/event-digest
```

It:

- Requires the same admin/job secret pattern as the other protected admin endpoints.
- Ensures the current weekly digest job exists.
- Selects visible, active/postponed events where `promote_outbound` is true.
- Renders a link-free X post grouped by day.
- Includes the source community/group on each event line when available.
- Stores the generated main post in `preview_text` and composer metadata in `payload`.
- Returns an X intent URL so admin can open the prefilled composer manually.

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
