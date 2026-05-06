alter table public.email_inbox_messages
    add column if not exists text_body text,
    add column if not exists html_body text,
    add column if not exists headers jsonb not null default '{}'::jsonb,
    add column if not exists body_status text not null default 'pending';

comment on column public.email_inbox_messages.text_body is 'Plain text body retrieved from the email provider receiving API after the webhook arrives.';
comment on column public.email_inbox_messages.html_body is 'HTML body retrieved from the email provider receiving API. Admin UI should render this cautiously.';
comment on column public.email_inbox_messages.headers is 'Email headers retrieved from the provider receiving API.';
comment on column public.email_inbox_messages.body_status is 'Body retrieval status: pending, retrieved, unavailable, or failed.';
