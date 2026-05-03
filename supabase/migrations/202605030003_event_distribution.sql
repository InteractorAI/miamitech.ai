alter table public.events
add column if not exists promote_outbound boolean not null default true;

create table if not exists public.event_distribution_jobs (
    id uuid primary key default gen_random_uuid(),
    event_id uuid references public.events(id) on delete cascade,
    channel text not null check (channel in ('buffer_x', 'email')),
    kind text not null check (kind in ('event_reminder', 'weekly_digest')),
    due_at timestamptz not null,
    status text not null default 'pending' check (status in ('pending', 'previewed', 'sent_to_buffer', 'sent_email', 'skipped', 'error')),
    digest_window_start date,
    digest_window_end date,
    payload jsonb,
    preview_text text,
    external_id text,
    last_error text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (event_id, channel, kind),
    unique (channel, kind, digest_window_start)
);

create index if not exists event_distribution_jobs_due_idx
on public.event_distribution_jobs (status, due_at);

create index if not exists event_distribution_jobs_event_idx
on public.event_distribution_jobs (event_id);

create index if not exists events_outbound_idx
on public.events (promote_outbound, hidden, status, starts_at);

alter table public.event_distribution_jobs enable row level security;
