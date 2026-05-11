import type { SupabaseClient } from '@supabase/supabase-js';
import { EventFetchError, fetchSingleEvent } from './adapters';

interface EventSourceNameRow {
    id: string;
    title: string;
    canonical_url: string | null;
    source_platform: string | null;
}

export interface HydrateEventSourceNamesOptions {
    limit?: number;
    includePast?: boolean;
}

export interface HydrateEventSourceNamesResult {
    scannedCount: number;
    updatedCount: number;
    skippedCount: number;
    errorCount: number;
    errors: Array<{ eventId: string; title: string; message: string }>;
}

export interface CleanupMissingEventUrlsResult {
    scannedCount: number;
    canceledCount: number;
    errorCount: number;
    errors: Array<{ eventId: string; title: string; message: string }>;
}

export async function hydrateMissingEventSourceNames(
    supabase: SupabaseClient,
    options: HydrateEventSourceNamesOptions = {},
): Promise<HydrateEventSourceNamesResult> {
    const limit = Math.min(Math.max(options.limit || 50, 1), 200);

    let query = supabase
        .from('events')
        .select('id, title, canonical_url, source_platform')
        .eq('source_platform', 'luma')
        .is('source_name', null)
        .order('starts_at', { ascending: true })
        .limit(limit);

    if (!options.includePast) {
        query = query.gte('starts_at', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []) as EventSourceNameRow[];
    const result: HydrateEventSourceNamesResult = {
        scannedCount: rows.length,
        updatedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        errors: [],
    };

    for (const row of rows) {
        if (!row.canonical_url || row.source_platform !== 'luma') {
            result.skippedCount++;
            continue;
        }

        try {
            const event = await fetchSingleEvent(row.canonical_url);
            const sourceName = event.sourceName?.trim();

            if (!sourceName) {
                result.skippedCount++;
                continue;
            }

            const { error: updateError } = await supabase
                .from('events')
                .update({
                    source_name: sourceName,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', row.id);

            if (updateError) throw updateError;
            result.updatedCount++;
        } catch (err) {
            result.errorCount++;
            result.errors.push({
                eventId: row.id,
                title: row.title,
                message: err instanceof Error ? err.message : 'Unknown metadata hydration error.',
            });
        }
    }

    return result;
}

export async function cleanupMissingLumaEventUrls(
    supabase: SupabaseClient,
    options: HydrateEventSourceNamesOptions = {},
): Promise<CleanupMissingEventUrlsResult> {
    const limit = Math.min(Math.max(options.limit || 100, 1), 200);

    let query = supabase
        .from('events')
        .select('id, title, canonical_url, source_platform')
        .eq('source_platform', 'luma')
        .in('status', ['active', 'postponed'])
        .order('starts_at', { ascending: true })
        .limit(limit);

    if (!options.includePast) {
        query = query.gte('starts_at', new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []) as EventSourceNameRow[];
    const result: CleanupMissingEventUrlsResult = {
        scannedCount: rows.length,
        canceledCount: 0,
        errorCount: 0,
        errors: [],
    };

    for (const row of rows) {
        if (!row.canonical_url || row.source_platform !== 'luma') continue;

        try {
            await fetchSingleEvent(row.canonical_url);
        } catch (err) {
            if (err instanceof EventFetchError && (err.status === 404 || err.status === 410)) {
                const { error: updateError } = await supabase
                    .from('events')
                    .update({
                        status: 'canceled',
                        hidden: true,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', row.id);

                if (updateError) throw updateError;
                result.canceledCount++;
                continue;
            }

            result.errorCount++;
            result.errors.push({
                eventId: row.id,
                title: row.title,
                message: err instanceof Error ? err.message : 'Unknown event URL cleanup error.',
            });
        }
    }

    return result;
}
