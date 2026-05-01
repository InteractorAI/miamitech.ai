import { SHEET_CONFIG, mappers, parseSheetCSV, type CommunityEntry, type ConferenceEntry, type ResourceEntry, type SpaceEntry } from '../googleSheets';
import type { EntityType, SheetEntity } from './types';
import { ensureAbsoluteUrl, slugify, splitAliases } from './utils';

async function fetchSheetData<T>(gid: string, mapper: (cols: string[]) => T, skipRows: number): Promise<T[]> {
    const url = `${SHEET_CONFIG.BASE_URL}&gid=${gid}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    const text = await res.text();
    return parseSheetCSV(text, mapper, skipRows);
}

function makeEntity(input: {
    type: EntityType;
    name: string;
    handle: string;
    websiteUrl: string;
    eventCalendarUrl: string;
    aliases: string;
    notes: string;
    sheetTab: string;
    sheetRow: number;
}): SheetEntity {
    return {
        ...input,
        handle: input.handle || slugify(input.name),
        websiteUrl: input.websiteUrl ? ensureAbsoluteUrl(input.websiteUrl) : '',
        eventCalendarUrl: input.eventCalendarUrl ? ensureAbsoluteUrl(input.eventCalendarUrl) : '',
        aliases: splitAliases(input.aliases),
    };
}

export async function fetchSheetEntities(): Promise<SheetEntity[]> {
    const [communities, spaces, resources, conferences] = await Promise.all([
        fetchSheetData<CommunityEntry>(SHEET_CONFIG.TABS.Communities, mappers.communities, 1),
        fetchSheetData<SpaceEntry>(SHEET_CONFIG.TABS.Spaces, mappers.spaces, 1),
        fetchSheetData<ResourceEntry>(SHEET_CONFIG.TABS.Resources, mappers.resources, 1),
        fetchSheetData<ConferenceEntry>(SHEET_CONFIG.TABS.Conferences, mappers.conferences, 1),
    ]);

    return [
        ...communities.map((item, idx) => makeEntity({
            type: 'community',
            name: item.name,
            handle: item.handle,
            websiteUrl: item.url,
            eventCalendarUrl: item.calendar,
            aliases: item.aliases,
            notes: item.notes,
            sheetTab: 'Communities',
            sheetRow: idx + 2,
        })),
        ...spaces.map((item, idx) => makeEntity({
            type: 'space',
            name: item.name,
            handle: item.handle,
            websiteUrl: item.url,
            eventCalendarUrl: item.calendar,
            aliases: item.aliases,
            notes: item.notes || item.location,
            sheetTab: 'Spaces',
            sheetRow: idx + 2,
        })),
        ...resources.map((item, idx) => makeEntity({
            type: 'resource',
            name: item.name,
            handle: item.handle,
            websiteUrl: item.website,
            eventCalendarUrl: item.calendar,
            aliases: item.aliases,
            notes: item.notes || item.category,
            sheetTab: 'Resources',
            sheetRow: idx + 2,
        })),
        ...conferences.map((item, idx) => makeEntity({
            type: 'conference',
            name: item.name,
            handle: item.handle,
            websiteUrl: item.website,
            eventCalendarUrl: item.calendar,
            aliases: item.aliases,
            notes: item.notes,
            sheetTab: 'Conferences',
            sheetRow: idx + 2,
        })),
    ];
}
