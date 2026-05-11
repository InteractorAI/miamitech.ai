import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchEventsForSource } from './adapters';
import { enqueueEventDistributionJobs } from './distribution';
import type { EventSource, NormalizedEvent } from './types';
import { makeEventDedupeKey, normalizeText } from './utils';

export async function ingestEventSources(supabase: SupabaseClient) {
    const { data: sources, error } = await supabase
        .from('event_sources')
        .select('id, entity_id, source_url, source_platform, entities(id, type, handle, name)')
        .eq('active', true);

    if (error) throw error;

    const results = {
        sourceCount: sources?.length || 0,
        eventCount: 0,
        associationCount: 0,
        errors: [] as Array<{ sourceUrl: string; message: string }>,
    };

    for (const source of (sources || []) as unknown as EventSource[]) {
        try {
            const events = await fetchEventsForSource(source);

            for (const event of events) {
                const eventId = await upsertEvent(supabase, event);
                await attachEventToEntity(supabase, eventId, source.entity_id, 'source', 'high', 'source');
                results.associationCount++;
                results.associationCount += await attachVenueMatches(supabase, eventId, event.locationText || '');
                results.eventCount++;
            }

            await supabase
                .from('event_sources')
                .update({
                    last_fetch_at: new Date().toISOString(),
                    last_fetch_status: 'ok',
                    last_fetch_error: null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', source.id);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown source fetch error';
            results.errors.push({ sourceUrl: source.source_url, message });

            await supabase
                .from('event_sources')
                .update({
                    last_fetch_at: new Date().toISOString(),
                    last_fetch_status: 'error',
                    last_fetch_error: message,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', source.id);
        }
    }

    return {
        ...results,
        distribution: await enqueueEventDistributionJobs(supabase),
    };
}

export async function upsertEvent(supabase: SupabaseClient, event: NormalizedEvent): Promise<string> {
    const dedupeKey = makeEventDedupeKey({
        canonicalUrl: event.canonicalUrl,
        externalId: event.externalId,
        sourcePlatform: event.sourcePlatform,
        title: event.title,
        startsAt: event.startsAt,
        locationText: event.locationText,
    });

    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('events')
        .upsert({
            title: event.title,
            description: event.description || null,
            starts_at: event.startsAt,
            ends_at: event.endsAt || null,
            canonical_url: event.canonicalUrl,
            source_platform: event.sourcePlatform,
            external_id: event.externalId || null,
            dedupe_key: dedupeKey,
            location_text: event.locationText || null,
            image_url: event.imageUrl || null,
            last_seen_at: now,
            updated_at: now,
        }, { onConflict: 'dedupe_key' })
        .select('id')
        .single();

    if (error) throw error;
    return data.id;
}

export async function attachEventToEntity(
    supabase: SupabaseClient,
    eventId: string,
    entityId: string,
    relationship: 'source' | 'venue' | 'manual',
    confidence: 'high' | 'medium' | 'low' | 'manual',
    detectionMethod: string,
) {
    const { error } = await supabase
        .from('event_entities')
        .upsert({
            event_id: eventId,
            entity_id: entityId,
            relationship,
            confidence,
            detection_method: detectionMethod,
        }, { onConflict: 'event_id,entity_id,relationship' });

    if (error) throw error;
}

export async function attachVenueMatches(supabase: SupabaseClient, eventId: string, locationText: string): Promise<number> {
    const normalizedLocation = normalizeText(locationText);
    if (!normalizedLocation) return 0;

    const { data: aliases, error } = await supabase
        .from('entity_aliases')
        .select('entity_id, normalized_alias')
        .gte('normalized_alias', '');

    if (error) throw error;

    let count = 0;
    for (const alias of aliases || []) {
        const normalizedAlias = alias.normalized_alias as string;
        if (normalizedAlias.length < 6) continue;
        if (!normalizedLocation.includes(normalizedAlias)) continue;

        await attachEventToEntity(supabase, eventId, alias.entity_id, 'venue', 'high', 'alias_location_match');
        count++;
    }

    return count;
}
