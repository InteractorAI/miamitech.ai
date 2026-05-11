import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchSingleEvent } from './adapters';
import { attachEventToEntity, attachVenueMatches, upsertEvent } from './ingest';
import type { EntityType, NormalizedEvent } from './types';

export interface ManualEventImportInput {
    url: string;
    entityId?: string;
    entityHandle?: string;
    entityType?: EntityType;
}

export interface ManualEventImportResult {
    eventId: string;
    event: NormalizedEvent;
    manualAssociationCount: number;
    venueAssociationCount: number;
}

export async function importManualEvent(
    supabase: SupabaseClient,
    input: ManualEventImportInput,
): Promise<ManualEventImportResult> {
    const url = input.url.trim();
    if (!url) throw new Error('Missing event URL.');

    const event = await fetchSingleEvent(url);
    const eventId = await upsertEvent(supabase, event);

    const entityId = await resolveEntityId(supabase, input);
    let manualAssociationCount = 0;
    if (entityId) {
        await attachEventToEntity(supabase, eventId, entityId, 'manual', 'manual', 'manual_import');
        manualAssociationCount = 1;
    }

    const venueAssociationCount = await attachVenueMatches(supabase, eventId, event.locationText || '');

    return {
        eventId,
        event,
        manualAssociationCount,
        venueAssociationCount,
    };
}

async function resolveEntityId(supabase: SupabaseClient, input: ManualEventImportInput): Promise<string | null> {
    if (input.entityId) return input.entityId;
    if (!input.entityHandle) return null;

    let query = supabase
        .from('entities')
        .select('id')
        .eq('handle', input.entityHandle);

    if (input.entityType) {
        query = query.eq('type', input.entityType);
    }

    const { data, error } = await query.limit(2);
    if (error) throw error;
    if (!data?.length) throw new Error(`No entity found for handle "${input.entityHandle}".`);
    if (data.length > 1) throw new Error(`Multiple entities found for handle "${input.entityHandle}". Include entityType.`);

    return data[0].id;
}
