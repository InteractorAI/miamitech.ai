import Parser from 'rss-parser';
import type { EventSource, NormalizedEvent, SourcePlatform } from './types';

const rssParser = new Parser();

export class EventFetchError extends Error {
    constructor(message: string, readonly status?: number) {
        super(message);
        this.name = 'EventFetchError';
    }
}

export async function fetchEventsForSource(source: EventSource): Promise<NormalizedEvent[]> {
    if (source.source_platform === 'luma') {
        return fetchLumaEvents(source.source_url);
    }

    if (source.source_platform === 'ical') {
        return fetchIcalEvents(source.source_url, source.source_platform);
    }

    if (source.source_platform === 'rss') {
        return fetchRssEvents(source.source_url);
    }

    return [];
}

export async function fetchSingleEvent(url: string): Promise<NormalizedEvent> {
    if (isLumaUrl(url)) {
        return fetchSingleLumaEvent(url);
    }

    throw new Error('Unsupported manual event URL. Single-event intake currently supports Luma event URLs.');
}

async function fetchLumaEvents(url: string): Promise<NormalizedEvent[]> {
    const res = await fetch(url, { headers: { 'user-agent': 'MiamiTech.ai Event Aggregator' } });
    if (!res.ok) throw new Error(`Luma fetch failed with ${res.status}`);

    const html = await res.text();
    if (html.includes('BEGIN:VCALENDAR')) {
        return parseIcalText(html, 'luma');
    }

    const nextData = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
    if (!nextData) return [];

    const data = JSON.parse(nextData);
    const calendarData = data?.props?.pageProps?.initialData?.data;
    const featuredItems = Array.isArray(calendarData?.featured_items) ? calendarData.featured_items : [];

    return featuredItems
        .map((item: any) => item?.event ? { ...item.event, calendar: item.calendar } : null)
        .filter(Boolean)
        .map((event: any) => normalizeLumaEvent(event))
        .filter(Boolean);
}

function normalizeLumaEvent(event: any): NormalizedEvent | null {
    if (!event?.name || !event?.start_at) return null;

    const locationText = [
        event.geo_address_info?.description,
        event.geo_address_info?.short_address,
        event.geo_address_info?.city_state,
    ].filter(Boolean).join(' · ');

    const eventPath = event.url ? `https://lu.ma/${event.url}` : '';

    return {
        title: event.name,
        description: getLumaDescription(event),
        startsAt: event.start_at,
        endsAt: event.end_at || undefined,
        canonicalUrl: eventPath || `https://lu.ma/${event.api_id}`,
        sourcePlatform: 'luma',
        sourceName: getLumaSourceName(event),
        externalId: event.api_id,
        locationText,
        imageUrl: event.cover_url || undefined,
    };
}

async function fetchSingleLumaEvent(url: string): Promise<NormalizedEvent> {
    const res = await fetch(url, { headers: { 'user-agent': 'MiamiTech.ai Event Aggregator' } });
    if (!res.ok) throw new EventFetchError(`Luma event fetch failed with ${res.status}`, res.status);

    const html = await res.text();
    const nextData = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
    if (!nextData) throw new Error('Could not find Luma event data on the page.');

    const data = JSON.parse(nextData);
    const initialData = data?.props?.pageProps?.initialData;
    const eventData = initialData?.data;
    const event = initialData?.kind === 'event'
        ? {
            ...eventData?.event,
            description: eventData?.description,
            description_mirror: eventData?.description_mirror,
            hosts: eventData?.hosts,
            calendar: eventData?.calendar,
        }
        : initialData?.data?.event;

    const normalized = normalizeLumaEvent(event);
    if (!normalized) throw new Error('Could not normalize Luma event data from the page.');

    return normalized;
}

function isLumaUrl(url: string): boolean {
    try {
        const host = new URL(url).hostname.toLowerCase();
        return host === 'luma.com' || host.endsWith('.luma.com') || host === 'lu.ma' || host.endsWith('.lu.ma');
    } catch {
        return false;
    }
}

function getLumaDescription(event: any): string {
    const mirrored = typeof event?.description_mirror === 'string'
        ? event.description_mirror
        : extractLumaRichText(event?.description_mirror);

    return mirrored || event?.description || '';
}

function getLumaSourceName(event: any): string {
    const hostName = Array.isArray(event?.hosts)
        ? event.hosts.find((host: any) => typeof host?.name === 'string' && host.name.trim())?.name
        : '';
    if (hostName) return hostName.trim();

    const personalUserName = event?.calendar?.personal_user?.name;
    if (typeof personalUserName === 'string' && personalUserName.trim()) return personalUserName.trim();

    const calendarName = event?.calendar?.name;
    if (typeof calendarName === 'string' && calendarName.trim() && calendarName !== 'Personal') {
        return calendarName.trim();
    }

    return '';
}

function extractLumaRichText(node: any): string {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractLumaRichText).filter(Boolean).join(' ');
    if (typeof node.text === 'string') return node.text;
    if (Array.isArray(node.content)) return node.content.map(extractLumaRichText).filter(Boolean).join(' ');
    return '';
}

async function fetchIcalEvents(url: string, sourcePlatform: SourcePlatform = 'ical'): Promise<NormalizedEvent[]> {
    const fetchUrl = url.replace(/^webcal:\/\//i, 'https://');
    const res = await fetch(fetchUrl, { headers: { 'user-agent': 'MiamiTech.ai Event Aggregator' } });
    if (!res.ok) throw new Error(`iCal fetch failed with ${res.status}`);
    return parseIcalText(await res.text(), sourcePlatform);
}

function parseIcalText(text: string, sourcePlatform: SourcePlatform): NormalizedEvent[] {
    return text
        .replace(/\r?\n[ \t]/g, '')
        .split('BEGIN:VEVENT')
        .slice(1)
        .map((chunk) => chunk.split('END:VEVENT')[0])
        .map((chunk) => parseIcalEvent(chunk, sourcePlatform))
        .filter((event): event is NormalizedEvent => Boolean(event));
}

function parseIcalEvent(chunk: string, sourcePlatform: SourcePlatform): NormalizedEvent | null {
    const summary = getIcalValue(chunk, 'SUMMARY');
    const start = getIcalValue(chunk, 'DTSTART');
    if (!summary || !start) return null;

    const end = getIcalValue(chunk, 'DTEND');
    const uid = getIcalValue(chunk, 'UID');
    const url = getIcalValue(chunk, 'URL') || uid || '';

    return {
        title: decodeIcalText(summary),
        description: decodeIcalText(getIcalValue(chunk, 'DESCRIPTION') || ''),
        startsAt: parseIcalDate(start).toISOString(),
        endsAt: end ? parseIcalDate(end).toISOString() : undefined,
        canonicalUrl: url,
        sourcePlatform,
        externalId: uid || undefined,
        locationText: decodeIcalText(getIcalValue(chunk, 'LOCATION') || ''),
    };
}

function getIcalValue(chunk: string, key: string): string {
    const line = chunk.split(/\r?\n/).find((item) => item.startsWith(`${key}:`) || item.startsWith(`${key};`));
    return line?.slice(line.indexOf(':') + 1).trim() || '';
}

function parseIcalDate(value: string): Date {
    if (/^\d{8}$/.test(value)) {
        return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00-05:00`);
    }

    if (/^\d{8}T\d{6}Z$/.test(value)) {
        return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`);
    }

    if (/^\d{8}T\d{6}$/.test(value)) {
        return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}-05:00`);
    }

    return new Date(value);
}

function decodeIcalText(value: string): string {
    return value
        .replace(/\\n/g, ' ')
        .replace(/\\,/g, ',')
        .replace(/\\;/g, ';')
        .replace(/\\\\/g, '\\')
        .trim();
}

async function fetchRssEvents(url: string): Promise<NormalizedEvent[]> {
    const feed = await rssParser.parseURL(url);

    const events: NormalizedEvent[] = [];

    for (const item of feed.items) {
        const startsAt = item.isoDate || item.pubDate;
        const canonicalUrl = item.link || item.guid || '';
        if (!item.title || !startsAt || !canonicalUrl) continue;

        events.push({
            title: item.title,
            description: item.contentSnippet || item.content || '',
            startsAt: new Date(startsAt).toISOString(),
            canonicalUrl,
            sourcePlatform: 'rss' as const,
            externalId: item.guid || item.link || undefined,
            locationText: '',
        });
    }

    return events;
}
