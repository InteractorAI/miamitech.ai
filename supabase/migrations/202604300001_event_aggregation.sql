create extension if not exists pgcrypto;

create table if not exists public.entities (
    id uuid primary key default gen_random_uuid(),
    type text not null check (type in ('community', 'space', 'resource', 'conference')),
    handle text not null,
    name text not null,
    website_url text,
    event_calendar_url text,
    sheet_tab text not null,
    sheet_row integer,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (type, handle)
);

create table if not exists public.entity_aliases (
    id uuid primary key default gen_random_uuid(),
    entity_id uuid not null references public.entities(id) on delete cascade,
    alias text not null,
    normalized_alias text not null,
    created_at timestamptz not null default now(),
    unique (entity_id, normalized_alias)
);

create table if not exists public.event_sources (
    id uuid primary key default gen_random_uuid(),
    entity_id uuid not null references public.entities(id) on delete cascade,
    source_url text not null,
    source_platform text not null default 'unknown',
    active boolean not null default true,
    last_fetch_at timestamptz,
    last_fetch_status text,
    last_fetch_error text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (entity_id, source_url)
);

create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    starts_at timestamptz not null,
    ends_at timestamptz,
    canonical_url text not null,
    source_platform text not null,
    external_id text,
    dedupe_key text not null,
    location_text text,
    image_url text,
    status text not null default 'active' check (status in ('active', 'canceled', 'postponed', 'hidden', 'expired')),
    hidden boolean not null default false,
    pinned boolean not null default false,
    first_seen_at timestamptz not null default now(),
    last_seen_at timestamptz not null default now(),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (dedupe_key)
);

create table if not exists public.event_entities (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.events(id) on delete cascade,
    entity_id uuid not null references public.entities(id) on delete cascade,
    relationship text not null check (relationship in ('source', 'venue', 'manual')),
    confidence text not null default 'high' check (confidence in ('high', 'medium', 'low', 'manual')),
    detection_method text not null default 'source',
    created_at timestamptz not null default now(),
    unique (event_id, entity_id, relationship)
);

create index if not exists entities_handle_idx on public.entities (handle);
create index if not exists event_sources_active_idx on public.event_sources (active, source_platform);
create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists events_visible_idx on public.events (hidden, status, starts_at);
create index if not exists event_entities_event_idx on public.event_entities (event_id);
create index if not exists event_entities_entity_idx on public.event_entities (entity_id);

alter table public.entities enable row level security;
alter table public.entity_aliases enable row level security;
alter table public.event_sources enable row level security;
alter table public.events enable row level security;
alter table public.event_entities enable row level security;
