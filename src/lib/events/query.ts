import { getSupabaseReadClient } from '../supabaseServer';
import type { EventFeedItem } from './types';

export async function getUpcomingEvents(limit = 10): Promise<EventFeedItem[]> {
    const supabase = getSupabaseReadClient();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('events')
        .select(`
            id,
            title,
            description,
            starts_at,
            ends_at,
            canonical_url,
            location_text,
            image_url,
            pinned,
            event_entities (
                relationship,
                entities (
                    type,
                    handle,
                    name
                )
            )
        `)
        .eq('hidden', false)
        .in('status', ['active', 'postponed'])
        .gte('starts_at', new Date().toISOString())
        .order('pinned', { ascending: false })
        .order('starts_at', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Failed to fetch upcoming events', error);
        return [];
    }

    return (data || []) as unknown as EventFeedItem[];
}
