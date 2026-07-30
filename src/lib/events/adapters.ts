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
    const headers = { 'user-agent': 'MiamiTech.ai Event Aggregator' };
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Luma fetch failed with ${res.status}`);

    const html = await res.text();
    if (html.includes('BEGIN:VCALENDAR')) {
        return parseIcalText(html, 'luma').filter(isUpcomingOrOngoing);
    }

    const nextData = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
    if (!nextData) return [];

    const data = JSON.parse(nextData);
    const calendarData = data?.props?.pageProps?.initialData?.data;
    const featuredItems = Array.isArray(calendarData?.featured_items) ? calendarData.featured_items : [];
    const featuredEvents = featuredItems
        .map((item: any) => item?.event ? { ...item.event, calendar: item.calendar } : null)
        .filter(Boolean)
        .map((event: any) => normalizeLumaEvent(event))
        .filter(Boolean);

    const calendarId = calendarData?.calendar?.api_id;
    if (typeof calendarId !== 'string' || !calendarId.trim()) {
        return featuredEvents.filter(isUpcomingOrOngoing);
    }

    const feedUrl = new URL('https://api.luma.com/ics/get');
    feedUrl.searchParams.set('entity', 'calendar');
    feedUrl.searchParams.set('id', calendarId);

    const feedRes = await fetch(feedUrl, { headers });
    if (!feedRes.ok) throw new Error(`Luma iCal fetch failed with ${feedRes.status}`);

    const calendarName = getLumaSourceName({ calendar: calendarData.calendar });
    const feedEvents = parseIcalText(await feedRes.text(), 'luma', calendarName);

    return mergeLumaEvents(feedEvents, featuredEvents)
        .filter(isUpcomingOrOngoing)
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
}

function mergeLumaEvents(feedEvents: NormalizedEvent[], featuredEvents: NormalizedEvent[]): NormalizedEvent[] {
    const events = new Map<string, NormalizedEvent>();

    for (const event of feedEvents) {
        events.set(getLumaEventKey(event), event);
    }

    for (const event of featuredEvents) {
        events.set(getLumaEventKey(event), event);
    }

    return [...events.values()];
}

function getLumaEventKey(event: NormalizedEvent): string {
    return event.externalId || event.canonicalUrl.toLowerCase();
}

function isUpcomingOrOngoing(event: NormalizedEvent): boolean {
    const finalTimestamp = event.endsAt || event.startsAt;
    return new Date(finalTimestamp).getTime() >= Date.now();
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

function parseIcalText(text: string, sourcePlatform: SourcePlatform, sourceName = ''): NormalizedEvent[] {
    return text
        .replace(/\r?\n[ \t]/g, '')
        .split('BEGIN:VEVENT')
        .slice(1)
        .map((chunk) => chunk.split('END:VEVENT')[0])
        .map((chunk) => parseIcalEvent(chunk, sourcePlatform, sourceName))
        .filter((event): event is NormalizedEvent => Boolean(event));
}

function parseIcalEvent(chunk: string, sourcePlatform: SourcePlatform, sourceName = ''): NormalizedEvent | null {
    const summary = getIcalValue(chunk, 'SUMMARY');
    const start = getIcalValue(chunk, 'DTSTART');
    if (!summary || !start) return null;

    const end = getIcalValue(chunk, 'DTEND');
    const uid = getIcalValue(chunk, 'UID');
    const description = getIcalValue(chunk, 'DESCRIPTION') || '';
    const externalId = sourcePlatform === 'luma'
        ? uid.replace(/@events\.lu\.ma$/i, '')
        : uid;
    const url = sourcePlatform === 'luma'
        ? getLumaIcalUrl(getIcalValue(chunk, 'URL'), description, externalId)
        : getIcalValue(chunk, 'URL') || uid || '';

    return {
        title: decodeIcalText(summary),
        description: decodeIcalText(description),
        startsAt: parseIcalDate(start).toISOString(),
        endsAt: end ? parseIcalDate(end).toISOString() : undefined,
        canonicalUrl: url,
        sourcePlatform,
        sourceName: sourceName || undefined,
        externalId: externalId || undefined,
        locationText: decodeIcalText(getIcalValue(chunk, 'LOCATION') || ''),
    };
}

function getLumaIcalUrl(explicitUrl: string, description: string, externalId: string): string {
    const descriptionUrl = description.match(/https?:\/\/(?:www\.)?(?:luma\.com|lu\.ma)\/[^\s\\]+/i)?.[0] || '';

    for (const candidate of [explicitUrl, descriptionUrl]) {
        const normalized = normalizeLumaUrl(candidate);
        if (normalized) return normalized;
    }

    return externalId ? `https://luma.com/event/${externalId}` : '';
}

function normalizeLumaUrl(value: string): string {
    if (!value) return '';

    try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase();
        if (host !== 'luma.com' && host !== 'www.luma.com' && host !== 'lu.ma' && !host.endsWith('.lu.ma')) {
            return '';
        }

        const path = url.pathname.replace(/^\/+|\/+$/g, '');
        if (!path) return '';
        if (path.startsWith('event/')) return `https://luma.com/${path}`;
        return `https://lu.ma/${path}`;
    } catch {
        return '';
    }
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
