import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchSheetEntities } from './sheetEntities';
import { detectSourcePlatform, normalizeText } from './utils';

export async function syncSheetEntities(supabase: SupabaseClient) {
    const sheetEntities = await fetchSheetEntities();
    let entityCount = 0;
    let sourceCount = 0;
    let aliasCount = 0;

    for (const entity of sheetEntities) {
        const { data: savedEntity, error } = await supabase
            .from('entities')
            .upsert({
                type: entity.type,
                handle: entity.handle,
                name: entity.name,
                website_url: entity.websiteUrl || null,
                event_calendar_url: entity.eventCalendarUrl || null,
                sheet_tab: entity.sheetTab,
                sheet_row: entity.sheetRow,
                notes: entity.notes || null,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'type,handle' })
            .select('id')
            .single();

        if (error) throw error;
        if (!savedEntity) continue;
        entityCount++;

        const now = new Date().toISOString();

        if (entity.eventCalendarUrl) {
            const { error: sourceError } = await supabase
                .from('event_sources')
                .upsert({
                    entity_id: savedEntity.id,
                    source_url: entity.eventCalendarUrl,
                    source_platform: detectSourcePlatform(entity.eventCalendarUrl),
                    active: true,
                    updated_at: now,
                }, { onConflict: 'entity_id,source_url' });

            if (sourceError) throw sourceError;
            sourceCount++;

            const { error: staleSourceError } = await supabase
                .from('event_sources')
                .update({ active: false, updated_at: now })
                .eq('entity_id', savedEntity.id)
                .neq('source_url', entity.eventCalendarUrl);

            if (staleSourceError) throw staleSourceError;
        } else {
            const { error: staleSourceError } = await supabase
                .from('event_sources')
                .update({ active: false, updated_at: now })
                .eq('entity_id', savedEntity.id)
                .eq('active', true);

            if (staleSourceError) throw staleSourceError;
        }

        const aliases = [entity.name, ...entity.aliases].filter(Boolean);
        for (const alias of aliases) {
            const { error: aliasError } = await supabase
                .from('entity_aliases')
                .upsert({
                    entity_id: savedEntity.id,
                    alias,
                    normalized_alias: normalizeText(alias),
                }, { onConflict: 'entity_id,normalized_alias' });

            if (aliasError) throw aliasError;
            aliasCount++;
        }
    }

    return { entityCount, sourceCount, aliasCount };
}
