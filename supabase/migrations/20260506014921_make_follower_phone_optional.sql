alter table public.followers
    alter column phone_e164 drop not null;

alter table public.followers
    drop constraint if exists followers_phone_e164_format;

alter table public.followers
    add constraint followers_phone_e164_format
    check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{9,14}$');

comment on column public.followers.phone_e164 is 'Optional normalized phone number. Required only when the person explicitly opts into SMS.';
