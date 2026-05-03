import type { SourcePlatform } from './types';

export function isUrl(value: string | undefined): boolean {
    return /^(https?|webcal):\/\//i.test((value || '').trim());
}

export function ensureAbsoluteUrl(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (/^(https?|webcal):\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

export function slugify(value: string): string {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

export function normalizeText(value: string): string {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function detectSourcePlatform(url: string): SourcePlatform {
    const normalized = url.toLowerCase();
    if (
        normalized.startsWith('webcal://') ||
        /\.(ics|ical)(\?|$)/i.test(normalized) ||
        /[?&](ical|icalendar)=1(\D|$)/i.test(normalized)
    ) return 'ical';
    if (normalized.includes('luma.com') || normalized.includes('lu.ma')) return 'luma';
    if (/\.(rss|xml|atom)(\?|$)/i.test(normalized) || normalized.includes('feed')) return 'rss';
    return 'unknown';
}

export function makeEventDedupeKey(input: {
    canonicalUrl: string;
    externalId?: string;
    sourcePlatform: SourcePlatform;
    title: string;
    startsAt: string;
    locationText?: string;
}): string {
    const url = input.canonicalUrl.trim().toLowerCase().replace(/\/$/, '');
    if (url) return `url:${url}`;

    if (input.externalId) {
        return `${input.sourcePlatform}:${input.externalId}`;
    }

    const title = normalizeText(input.title);
    const location = normalizeText(input.locationText || '');
    const startsAt = new Date(input.startsAt).toISOString();
    return `fallback:${title}:${startsAt}:${location}`;
}

export function splitAliases(value: string): string[] {
    return value
        .split(',')
        .map((alias) => alias.trim())
        .filter(Boolean);
}
