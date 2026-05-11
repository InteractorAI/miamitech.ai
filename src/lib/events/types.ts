export type EntityType = 'community' | 'space' | 'resource' | 'conference';
export type EventRelationship = 'source' | 'venue' | 'manual';
export type SourcePlatform = 'luma' | 'ical' | 'rss' | 'manual' | 'website' | 'unknown';

export interface SheetEntity {
    type: EntityType;
    handle: string;
    name: string;
    websiteUrl: string;
    eventCalendarUrl: string;
    aliases: string[];
    notes: string;
    sheetTab: string;
    sheetRow: number;
}

export interface NormalizedEvent {
    title: string;
    description?: string;
    startsAt: string;
    endsAt?: string;
    canonicalUrl: string;
    sourcePlatform: SourcePlatform;
    sourceName?: string;
    externalId?: string;
    locationText?: string;
    imageUrl?: string;
}

export interface EventSource {
    id: string;
    entity_id: string;
    source_url: string;
    source_platform: SourcePlatform;
    entities?: {
        id: string;
        type: EntityType;
        handle: string;
        name: string;
    };
}

export interface EventFeedItem {
    id: string;
    title: string;
    description: string | null;
    starts_at: string;
    ends_at: string | null;
    canonical_url: string;
    source_name: string | null;
    location_text: string | null;
    image_url: string | null;
    pinned: boolean;
    event_entities?: Array<{
        relationship: EventRelationship;
        entities: {
            type: EntityType;
            handle: string;
            name: string;
        } | null;
    }>;
}
