create table if not exists public.followers (
    id uuid primary key default gen_random_uuid(),
    email_normalized text not null,
    display_name text not null,
    phone_e164 text not null,
    email_opt_in boolean not null default true,
    sms_opt_in boolean not null default false,
    source text not null default 'site_follow_modal',
    resend_contact_id text,
    first_seen_at timestamptz not null default now(),
    last_seen_at timestamptz not null default now(),
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint followers_email_normalized_not_blank check (length(trim(email_normalized)) > 3),
    constraint followers_display_name_not_blank check (length(trim(display_name)) > 0),
    constraint followers_phone_e164_format check (phone_e164 ~ '^\+[1-9][0-9]{9,14}$')
);

create unique index if not exists followers_email_normalized_key
    on public.followers (email_normalized);

alter table public.followers enable row level security;

comment on table public.followers is 'People who follow MiamiTech.ai through the lightweight site follow flow. Server-side service role access only.';
comment on column public.followers.email_normalized is 'Lowercase normalized email used as the dedupe key and future sign-in bridge.';
comment on column public.followers.phone_e164 is 'Normalized phone number captured for future SMS only when the person explicitly opts in.';
