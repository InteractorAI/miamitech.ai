create table if not exists public.email_inbox_messages (
    id uuid primary key default gen_random_uuid(),
    provider text not null,
    provider_event_id text not null,
    provider_email_id text,
    message_id text,
    from_text text,
    to_addresses text[] not null default '{}'::text[],
    cc_addresses text[] not null default '{}'::text[],
    bcc_addresses text[] not null default '{}'::text[],
    subject text,
    attachment_count integer not null default 0,
    raw_payload jsonb not null,
    received_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    constraint email_inbox_messages_provider_not_blank check (length(trim(provider)) > 0),
    constraint email_inbox_messages_provider_event_id_not_blank check (length(trim(provider_event_id)) > 0)
);

create unique index if not exists email_inbox_messages_provider_event_key
    on public.email_inbox_messages (provider, provider_event_id);

create index if not exists email_inbox_messages_received_at_idx
    on public.email_inbox_messages (received_at desc);

alter table public.email_inbox_messages enable row level security;

comment on table public.email_inbox_messages is 'Inbound email messages received through provider webhooks. The admin inbox reads from this provider-neutral table.';
comment on column public.email_inbox_messages.provider is 'Email provider that delivered the webhook, for example resend.';
comment on column public.email_inbox_messages.provider_event_id is 'Provider delivery id used for idempotency.';
