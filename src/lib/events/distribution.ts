import type { SupabaseClient } from '@supabase/supabase-js';
import { generateEventReminderCopy } from './copyModel';
import type { EventRelationship } from './types';

const TIME_ZONE = 'America/New_York';
const MIAMI_TECH_EVENTS_URL = 'https://miamitech.ai/events';
const EXCLUDED_DIGEST_SOURCE_HANDLES = new Set(['refresh-miami']);

export type EventDistributionChannel = 'buffer_x' | 'email';
export type EventDistributionKind = 'event_reminder' | 'weekly_digest';
export type EventDistributionStatus = 'pending' | 'previewed' | 'sent_to_buffer' | 'sent_email' | 'skipped' | 'error';

interface DistributionEvent {
    id: string;
    title: string;
    description: string | null;
    starts_at: string;
    ends_at: string | null;
    canonical_url: string;
    location_text: string | null;
    pinned: boolean;
    hidden: boolean;
    status: string;
    promote_outbound?: boolean;
    event_entities?: Array<{
        relationship: EventRelationship;
        entities: {
            type: string;
            handle: string;
            name: string;
        } | null;
    }>;
}

interface DistributionJob {
    id: string;
    event_id: string | null;
    channel: EventDistributionChannel;
    kind: EventDistributionKind;
    due_at: string;
    status: EventDistributionStatus;
    digest_window_start: string | null;
    digest_window_end: string | null;
    payload: Record<string, unknown> | null;
    events?: DistributionEvent | null;
}

interface PreviewOptions {
    windowDays?: number;
    limit?: number;
    includeDigest?: boolean;
}

export interface EventDistributionPreview {
    id: string;
    channel: EventDistributionChannel;
    kind: EventDistributionKind;
    dueAt: string;
    digestWindow?: {
        start: string;
        end: string;
    };
    event?: {
        id: string;
        title: string;
        startsAt: string;
        url: string;
    };
    previewText: string;
}

export interface WeeklyXDigestComposer {
    jobId: string;
    dueAt: string;
    digestWindow: {
        start: string;
        end: string;
    };
    mainText: string;
    postUrl: string;
    eventCount: number;
}

export async function enqueueEventDistributionJobs(supabase: SupabaseClient) {
    const now = new Date();
    const { data, error } = await supabase
        .from('events')
        .select('id, starts_at')
        .eq('hidden', false)
        .eq('promote_outbound', true)
        .in('status', ['active', 'postponed'])
        .gte('starts_at', now.toISOString());

    if (error) throw error;

    const rows = (data || [])
        .map((event) => {
            const startsAt = new Date(event.starts_at as string);
            if (startsAt.getTime() <= now.getTime()) return null;

            const dueAt = new Date(startsAt.getTime() - 24 * 60 * 60 * 1000);
            return {
                event_id: event.id,
                channel: 'buffer_x' satisfies EventDistributionChannel,
                kind: 'event_reminder' satisfies EventDistributionKind,
                due_at: dueAt.toISOString(),
            };
        })
        .filter((row): row is NonNullable<typeof row> => Boolean(row));

    if (!rows.length) {
        return {
            eligibleEventCount: data?.length || 0,
            insertedJobCount: 0,
        };
    }

    const { data: inserted, error: insertError } = await supabase
        .from('event_distribution_jobs')
        .upsert(rows, {
            onConflict: 'event_id,channel,kind',
            ignoreDuplicates: true,
        })
        .select('id');

    if (insertError) throw insertError;

    return {
        eligibleEventCount: data?.length || 0,
        insertedJobCount: inserted?.length || 0,
    };
}

export async function ensureWeeklyDigestJobs(supabase: SupabaseClient, referenceDate = new Date()) {
    const window = getNextWeeklyDigestWindow(referenceDate);
    const rows = (['buffer_x', 'email'] satisfies EventDistributionChannel[]).map((channel) => ({
        event_id: null,
        channel,
        kind: 'weekly_digest' satisfies EventDistributionKind,
        due_at: window.dueAt.toISOString(),
        digest_window_start: window.startDate,
        digest_window_end: window.endDate,
        payload: {
            timeZone: TIME_ZONE,
        },
    }));

    const { data, error } = await supabase
        .from('event_distribution_jobs')
        .upsert(rows, {
            onConflict: 'channel,kind,digest_window_start',
            ignoreDuplicates: true,
        })
        .select('id');

    if (error) throw error;

    return {
        digestWindowStart: window.startDate,
        digestWindowEnd: window.endDate,
        dueAt: window.dueAt.toISOString(),
        insertedJobCount: data?.length || 0,
    };
}

export async function getWeeklyXDigestComposer(supabase: SupabaseClient, referenceDate = new Date()): Promise<WeeklyXDigestComposer> {
    const digest = await ensureWeeklyDigestJobs(supabase, referenceDate);

    const { data, error } = await supabase
        .from('event_distribution_jobs')
        .select(`
            id,
            event_id,
            channel,
            kind,
            due_at,
            status,
            digest_window_start,
            digest_window_end,
            payload,
            events (
                id,
                title,
                description,
                starts_at,
                ends_at,
                canonical_url,
                location_text,
                pinned,
                hidden,
                status,
                promote_outbound,
                event_entities (
                    relationship,
                    entities (
                        type,
                        handle,
                        name
                    )
                )
            )
        `)
        .eq('channel', 'buffer_x')
        .eq('kind', 'weekly_digest')
        .eq('digest_window_start', digest.digestWindowStart)
        .eq('digest_window_end', digest.digestWindowEnd)
        .in('status', ['pending', 'previewed', 'error'])
        .order('due_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (error) throw error;

    const job = data as unknown as DistributionJob | null;
    if (!job) throw new Error('No weekly X digest job found.');

    if (!job.digest_window_start || !job.digest_window_end) throw new Error('Weekly digest job is missing a digest window.');

    const events = dedupeEvents(await getDigestEvents(supabase, job.digest_window_start, job.digest_window_end));
    const mainText = renderWeeklyXDigest(events, job.digest_window_start, job.digest_window_end);
    const payload = {
        ...(job.payload || {}),
        composer: {
            mainText,
            eventCount: events.length,
            generatedAt: new Date().toISOString(),
            timeZone: TIME_ZONE,
        },
    };

    const { error: updateError } = await supabase
        .from('event_distribution_jobs')
        .update({
            status: 'previewed',
            preview_text: mainText,
            payload,
            last_error: null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', job.id);

    if (updateError) throw updateError;

    return {
        jobId: job.id,
        dueAt: job.due_at,
        digestWindow: {
            start: job.digest_window_start,
            end: job.digest_window_end,
        },
        mainText,
        postUrl: getXIntentUrl(mainText),
        eventCount: events.length,
    };
}

function getXIntentUrl(text: string) {
    const url = new URL('https://twitter.com/intent/tweet');
    url.searchParams.set('text', text);
    return url.toString();
}

export async function previewEventDistributionJobs(supabase: SupabaseClient, options: PreviewOptions = {}) {
    if (options.includeDigest !== false) {
        await ensureWeeklyDigestJobs(supabase);
    }

    const windowDays = options.windowDays ?? 14;
    const limit = options.limit ?? 50;
    const previewWindowEnd = new Date();
    previewWindowEnd.setDate(previewWindowEnd.getDate() + windowDays);

    const { data, error } = await supabase
        .from('event_distribution_jobs')
        .select(`
            id,
            event_id,
            channel,
            kind,
            due_at,
            status,
            digest_window_start,
            digest_window_end,
            payload,
            events (
                id,
                title,
                description,
                starts_at,
                ends_at,
                canonical_url,
                location_text,
                pinned,
                hidden,
                status,
                promote_outbound,
                event_entities (
                    relationship,
                    entities (
                        type,
                        handle,
                        name
                    )
                )
            )
        `)
        .in('status', ['pending', 'previewed'])
        .lte('due_at', previewWindowEnd.toISOString())
        .order('due_at', { ascending: true })
        .limit(limit);

    if (error) throw error;

    const previews: EventDistributionPreview[] = [];
    const seenReminderKeys = new Set<string>();
    for (const job of (data || []) as unknown as DistributionJob[]) {
        const preview = await renderPreviewForJob(supabase, job, seenReminderKeys);
        if (!preview) continue;
        previews.push(preview);

        await supabase
            .from('event_distribution_jobs')
            .update({
                status: 'previewed',
                preview_text: preview.previewText,
                payload: {
                    ...(job.payload || {}),
                    preview,
                    previewedAt: new Date().toISOString(),
                },
                updated_at: new Date().toISOString(),
            })
            .eq('id', job.id);
    }

    return previews;
}

async function renderPreviewForJob(
    supabase: SupabaseClient,
    job: DistributionJob,
    seenReminderKeys: Set<string>,
): Promise<EventDistributionPreview | null> {
    if (job.kind === 'event_reminder') {
        if (!job.events || !isOutboundEvent(job.events)) {
            await markJobSkipped(supabase, job.id, 'Event is hidden, demoted, missing, or no longer active.');
            return null;
        }

        const reminderKey = getEventClusterKey(job.events);
        if (seenReminderKeys.has(reminderKey)) {
            await markJobSkipped(supabase, job.id, 'Duplicate outbound reminder suppressed.');
            return null;
        }
        seenReminderKeys.add(reminderKey);

        return {
            id: job.id,
            channel: job.channel,
            kind: job.kind,
            dueAt: job.due_at,
            event: {
                id: job.events.id,
                title: job.events.title,
                startsAt: job.events.starts_at,
                url: job.events.canonical_url,
            },
            previewText: await renderEventReminderPost(job.events),
        };
    }

    if (!job.digest_window_start || !job.digest_window_end) {
        await markJobSkipped(supabase, job.id, 'Weekly digest job is missing a digest window.');
        return null;
    }

    const events = dedupeEvents(await getDigestEvents(supabase, job.digest_window_start, job.digest_window_end));
    const previewText = job.channel === 'email'
        ? renderWeeklyEmailDigest(events, job.digest_window_start, job.digest_window_end)
        : renderWeeklyXDigest(events, job.digest_window_start, job.digest_window_end);

    return {
        id: job.id,
        channel: job.channel,
        kind: job.kind,
        dueAt: job.due_at,
        digestWindow: {
            start: job.digest_window_start,
            end: job.digest_window_end,
        },
        previewText,
    };
}

async function markJobSkipped(supabase: SupabaseClient, jobId: string, message: string) {
    const { error } = await supabase
        .from('event_distribution_jobs')
        .update({
            status: 'skipped',
            last_error: message,
            updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

    if (error) throw error;
}

async function getDigestEvents(supabase: SupabaseClient, startDate: string, endDate: string): Promise<DistributionEvent[]> {
    const start = zonedDateToUtc(`${startDate}T00:00:00`);
    const endExclusive = addDaysToDateString(endDate, 1);
    const end = zonedDateToUtc(`${endExclusive}T00:00:00`);

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
            pinned,
            hidden,
            status,
            promote_outbound,
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
        .eq('promote_outbound', true)
        .in('status', ['active', 'postponed'])
        .gte('starts_at', start.toISOString())
        .lt('starts_at', end.toISOString())
        .order('pinned', { ascending: false })
        .order('starts_at', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as DistributionEvent[];
}

async function renderEventReminderPost(event: DistributionEvent): Promise<string> {
    const sourceName = getSourceName(event);
    const location = cleanLocation(event.location_text);
    const when = formatEventDateTime(event.starts_at);
    const meta = [sourceName, location].filter(Boolean).join(location && sourceName ? ' at ' : '');
    const detail = meta ? `${when} - ${meta}` : when;
    const fallback = trimForX(`Tomorrow in Miami tech: ${event.title}\n${detail}\n${event.canonical_url}`);

    return generateEventReminderCopy({
        title: event.title,
        startsAtLabel: when,
        sourceName,
        location,
        url: event.canonical_url,
        description: cleanDescription(event.description),
    }, fallback);
}

function renderWeeklyXDigest(events: DistributionEvent[], startDate: string, endDate: string): string {
    if (!events.length) {
        return `Miami tech events this week (${formatDateRange(startDate, endDate)}):\n\nNo listed events yet.`;
    }

    const lines = [`Miami tech events this week (${formatDateRange(startDate, endDate)}):`];
    let currentDay = '';
    for (const event of events) {
        const day = formatDigestDay(event.starts_at);
        if (day !== currentDay) {
            lines.push('', day);
            currentDay = day;
        }

        const source = getSourceName(event);
        lines.push(`- ${event.title}${source ? ` — ${source}` : ''}`);
    }

    return lines.join('\n');
}

function renderWeeklyEmailDigest(events: DistributionEvent[], startDate: string, endDate: string): string {
    const lines = [`Miami tech events this week: ${formatDateRange(startDate, endDate)}`, ''];

    if (!events.length) {
        lines.push('No listed events yet.', '', `Live calendar: ${MIAMI_TECH_EVENTS_URL}`);
        return lines.join('\n');
    }

    let currentDay = '';
    for (const event of events) {
        const day = formatDigestDay(event.starts_at);
        if (day !== currentDay) {
            if (currentDay) lines.push('');
            lines.push(day);
            currentDay = day;
        }

        const source = getSourceName(event);
        const location = cleanLocation(event.location_text);
        const details = [formatDigestEventTime(event.starts_at), source, location].filter(Boolean).join(' - ');
        lines.push(`- ${event.title}`);
        if (details) lines.push(`  ${details}`);
        lines.push(`  ${event.canonical_url}`);
    }

    lines.push('', `Full list: ${MIAMI_TECH_EVENTS_URL}`);
    return lines.join('\n');
}

function isOutboundEvent(event: DistributionEvent) {
    return !event.hidden && event.promote_outbound !== false && ['active', 'postponed'].includes(event.status);
}

function getSourceName(event: DistributionEvent): string {
    return event.event_entities?.find((item) => item.relationship === 'source')?.entities?.name || '';
}

function cleanLocation(value: string | null): string {
    if (!value) return '';
    const compact = value
        .replace(/\s+/g, ' ')
        .replace(/,\s*United States$/i, '')
        .replace(/\s*·\s*/g, ', ')
        .trim();

    if (!compact || /register to see address/i.test(compact)) return '';

    const parts = compact.split(',').map((part) => part.trim()).filter(Boolean);
    if (!parts.length) return '';
    if (parts.length === 1) return truncateLocation(parts[0]);

    const first = parts[0];
    const second = parts[1];

    if (/\b[A-Z]{2}\b/.test(second) || /^\d/.test(second)) {
        return truncateLocation(first);
    }

    return truncateLocation(`${first}, ${second}`);
}

function cleanDescription(value: string | null): string {
    if (!value) return '';
    const compact = value
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();

    if (compact.length <= 320) return compact;
    return `${compact.slice(0, 317).trimEnd()}...`;
}

function trimForX(value: string): string {
    if (value.length <= 280) return value;
    const lines = value.split('\n');
    const url = lines.at(-1) || '';
    const body = lines.slice(0, -1).join('\n');
    const maxBodyLength = Math.max(0, 276 - url.length);
    return `${body.slice(0, maxBodyLength).trimEnd()}...\n${url}`;
}

function truncateLocation(value: string): string {
    if (value.length <= 72) return value;
    return `${value.slice(0, 69).trimEnd()}...`;
}

function dedupeEvents(events: DistributionEvent[]) {
    const seen = new Set<string>();
    const deduped: DistributionEvent[] = [];

    for (const event of events) {
        if (hasExcludedDigestSource(event)) continue;
        const key = getEventClusterKey(event);
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(event);
    }

    return deduped;
}

function hasExcludedDigestSource(event: DistributionEvent): boolean {
    return event.event_entities?.some((item) => (
        item.relationship === 'source' &&
        item.entities?.handle &&
        EXCLUDED_DIGEST_SOURCE_HANDLES.has(item.entities.handle)
    )) || false;
}

function getEventClusterKey(event: DistributionEvent): string {
    return [
        normalizeTitle(event.title),
        formatDateKey(event.starts_at),
    ].join('|');
}

function normalizeTitle(value: string): string {
    return value
        .toLowerCase()
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function formatDateKey(value: string): string {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date(value));
    const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
    return `${get('year')}-${get('month')}-${get('day')}`;
}

function formatEventDateTime(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatDigestEventDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    }).format(new Date(value));
}

function formatDigestDay(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).format(new Date(value));
}

function formatDigestEventTime(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatDateRange(startDate: string, endDate: string): string {
    const start = zonedDateToUtc(`${startDate}T12:00:00`);
    const end = zonedDateToUtc(`${endDate}T12:00:00`);
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        month: 'short',
        day: 'numeric',
    });
    return `${formatter.format(start)}-${formatter.format(end)}`;
}

function getNextWeeklyDigestWindow(referenceDate: Date) {
    const zoned = getZonedParts(referenceDate);
    const start = zoned.weekday === 0
        ? addDaysToYmd(zoned, 1)
        : addDaysToYmd(zoned, -((zoned.weekday + 6) % 7));
    const end = addDaysToYmd(start, 6);
    const dueDate = addDaysToYmd(start, -1);
    const dueAt = makeZonedDate(dueDate.year, dueDate.month, dueDate.day, 19, 0);

    return {
        dueAt,
        startDate: ymdToDateString(start),
        endDate: ymdToDateString(end),
    };
}

function getZonedParts(date: Date) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
    return {
        year: Number(get('year')),
        month: Number(get('month')),
        day: Number(get('day')),
        weekday: weekdayNumber(get('weekday')),
    };
}

function weekdayNumber(value: string): number {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(value);
}

function addDaysToDateString(value: string, days: number): string {
    const [year, month, day] = value.split('-').map(Number);
    return ymdToDateString(addDaysToYmd({ year, month, day }, days));
}

function addDaysToYmd(value: { year: number; month: number; day: number }, days: number) {
    const date = new Date(Date.UTC(value.year, value.month - 1, value.day + days, 12, 0, 0));
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
    };
}

function ymdToDateString(value: { year: number; month: number; day: number }) {
    return [
        String(value.year).padStart(4, '0'),
        String(value.month).padStart(2, '0'),
        String(value.day).padStart(2, '0'),
    ].join('-');
}

function zonedDateToUtc(value: string): Date {
    const [datePart, timePart] = value.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, second = 0] = timePart.split(':').map(Number);
    return makeZonedDate(year, month, day, hour, minute, second);
}

function makeZonedDate(year: number, month: number, day: number, hour: number, minute: number, second = 0): Date {
    const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    const offset = getTimeZoneOffsetMs(utcGuess);
    return new Date(utcGuess.getTime() - offset);
}

function getTimeZoneOffsetMs(date: Date): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value || '0';
    const asUtc = Date.UTC(
        Number(get('year')),
        Number(get('month')) - 1,
        Number(get('day')),
        Number(get('hour')),
        Number(get('minute')),
        Number(get('second')),
    );
    return asUtc - date.getTime();
}
