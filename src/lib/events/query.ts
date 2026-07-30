import { getSupabaseReadClient } from '../supabaseServer';
import type { EventFeedItem } from './types';

export async function getUpcomingEvents(limit = 10, windowDays = 60): Promise<EventFeedItem[]> {
    const supabase = getSupabaseReadClient();
    if (!supabase) return [];

    const now = new Date();
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() + windowDays);

    const { data, error } = await supabase
        .from('events')
        .select(`
            id,
            title,
            description,
            starts_at,
            ends_at,
            canonical_url,
            source_name,
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
        .or(`starts_at.gte.${now.toISOString()},ends_at.gte.${now.toISOString()}`)
        .lt('starts_at', windowEnd.toISOString())
        .order('pinned', { ascending: false })
        .order('starts_at', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Failed to fetch upcoming events', error);
        return [];
    }

    return (data || []) as unknown as EventFeedItem[];
}
