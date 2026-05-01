create policy "Public can read visible entities"
on public.entities
for select
to anon, authenticated
using (true);

create policy "Public can read visible events"
on public.events
for select
to anon, authenticated
using (hidden = false and status in ('active', 'postponed'));

create policy "Public can read event associations"
on public.event_entities
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.events
        where events.id = event_entities.event_id
          and events.hidden = false
          and events.status in ('active', 'postponed')
    )
);
