import Parser from 'rss-parser';
import type { EventSource, NormalizedEvent, SourcePlatform } from './types';

const rssParser = new Parser();

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
        .map((item: any) => item?.event)
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
        description: event.description_mirror || event.description || '',
        startsAt: event.start_at,
        endsAt: event.end_at || undefined,
        canonicalUrl: eventPath || `https://lu.ma/${event.api_id}`,
        sourcePlatform: 'luma',
        externalId: event.api_id,
        locationText,
        imageUrl: event.cover_url || undefined,
    };
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
