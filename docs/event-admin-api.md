# Event administration API for agents

MiamiTech.ai already exposes authenticated JSON endpoints. Browser sign-in is not
required for event intake. Use this narrow workflow rather than automating the
admin UI or triggering the ingestion/distribution jobs.

## CLI

Requires Node.js 22+ (no additional dependencies). From the repository root:

```sh
node scripts/event-admin.mjs list production --window-days=7
# Preview only: no network request and no mutation.
node scripts/event-admin.mjs import production https://luma.com/public-event
# Only after verifying the event and authorization to add it:
node scripts/event-admin.mjs import production https://luma.com/public-event --apply
```

Equivalent npm commands: `npm run events:admin -- ...`.
Targets are `local`, `staging`, and `production` (`prod` is an alias). The client
only sends admin credentials to those fixed targets and refuses redirects.
For multiple events, pass multiple canonical URLs. Processing is sequential.
If an attempt fails, confirmed successes are retained in the JSON output, the
attempted URL is marked uncertain, and later URLs are left untouched. Inspect
`list` before retrying an uncertain URL. There are no automatic retries.

### Existing credentials only

Use an already-provisioned target credential via environment variables or a
secure local environment file. Do not put credentials in arguments, source code,
chat, logs, URLs, or the public weekly draft. This tool never generates credentials.

The server chooses the **first configured** value of:
`EVENT_DISTRIBUTION_SECRET`, `CRON_SECRET`, `EVENT_INGEST_SECRET`.
These are not interchangeable if more than one is configured.
The client checks matching target-suffixed process variables first (for example,
`EVENT_DISTRIBUTION_SECRET_PRODUCTION`), then unsuffixed process variables, then
`.env.production.local`, `.env.staging.local`, or `.env.local` for the chosen
target. Set `EVENT_ADMIN_ENV_FILE` to use an existing secure file elsewhere.
It never silently reads the local target's file for production.
Use the matching first configured server secret. Missing credentials fail locally.
Do not reuse unrelated provider/API keys.

## Existing HTTP contract

Authorization: `Authorization: Bearer <existing admin secret>` (the UI also uses
`x-admin-secret`). Events must be enabled on the deployment.

- `GET /api/admin/events?windowDays=7&showHidden=true`: returns
  `{ "ok": true, "events": [...] }`. Includes upcoming active/postponed events;
  hidden events are included for duplicate/curation checks. Window starts now.
- `POST /api/admin/events/manual`, JSON `{ "url": "https://luma.com/public-event" }`:
  fetches and normalizes one Luma event, upserts it through normal event dedupe,
  and returns `ok`, `eventId`, `event`, and association counts. This is a live
  write. It does not run bulk ingest, send newsletters, RSVP, or change curation
  flags. Reimports can refresh event data. Currently non-Luma URLs are unsupported.
- `POST /api/admin/events` edits curation flags. The CLI deliberately does not
  expose this or newsletter, inbox, follower, or job endpoints.

An event page's existence alone does not prove eligibility. Before applying:
verify the canonical public page, actual date/time, South Florida relevance,
public eligibility, cancellation status, and whether it is already listed.
Exclude past, cancelled, private invitation-only events and personalized links.
The CLI rejects query strings/fragments and URL credentials; do not merely strip
an invitation token and assume the resulting event is public.

After importing, re-list and verify the returned event ID and public listing.
Do not claim a site update based only on dry-run output or an uncertain response.
The existing API imports event data; it does not perform these editorial checks.

## Security and deployment boundary

This CLI uses existing server endpoints and needs no server deployment or new
credential. Existing admin secrets may cover more server functionality than the
CLI exposes; keep them in approved secure storage. A dedicated event-intake-only
credential would require a separately approved server/auth change.

The current server implementation permits access when none of its three secrets
is configured. Keep a server secret configured; this client fails closed if its
credential is missing. This change does not modify production authentication or
server settings. Before enabling a new deployment, verify unauthenticated admin
requests return 401 and the intended credential permits only intended access.

Tests (mock requests, no production writes):

```sh
node --test scripts/event-admin.test.mjs
```
