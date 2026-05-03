'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import type { EventFeedItem } from '../lib/events/types';
import { ExpandIcon } from './ExpandIcon';
import { Panel } from './TerminalBlock';

const PREVIEW_COUNT = 5;

function PinMark() {
    return (
        <span
            className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border border-bg-border bg-bg-primary text-accent-green shadow-sm"
            aria-label="Pinned event"
        >
            <svg
                viewBox="-5 0 24 24"
                aria-hidden="true"
                className="h-3 w-3"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.99999 9.91864V5.82929C1.8348 5.41746 0.99999 4.30622 0.99999 3C0.99999 1.34315 2.34314 0 3.99999 0H10C11.6568 0 13 1.34315 13 3C13 4.30622 12.1652 5.41746 11 5.82929V9.91864C11.1699 10.095 11.3195 10.2935 11.4441 10.5116L13.1584 13.5116C13.9804 14.9501 13.4806 16.7827 12.042 17.6047C11.5888 17.8638 11.0757 18 10.5536 18H8V23C8 23.5523 7.5523 24 7 24C6.4477 24 6 23.5523 6 23V18H3.44635C1.7895 18 0.44635 16.6569 0.44635 15C0.44635 14.4779 0.5826 13.9649 0.84162 13.5116L2.55591 10.5116C2.6805 10.2935 2.83013 10.095 2.99999 9.91864ZM4.99999 9H9V6H4.99999V9ZM10 4C10.5523 4 11 3.55228 11 3C11 2.44772 10.5523 2 10 2H3.99999C3.44771 2 2.99999 2.44772 2.99999 3C2.99999 3.55228 3.44771 4 3.99999 4H10ZM5.1606 11C4.80178 11 4.47044 11.1923 4.29239 11.5039L2.57811 14.5039C2.49177 14.655 2.44635 14.826 2.44635 15C2.44635 15.5523 2.89407 16 3.44635 16H10.5536C10.7277 16 10.8987 15.9546 11.0498 15.8682C11.5293 15.5942 11.6959 14.9834 11.4219 14.5039L9.7076 11.5039C9.5295 11.1923 9.1982 11 8.8393 11H5.1606Z"
                />
            </svg>
        </span>
    );
}

function formatEventTime(value: string): string {
    const parts = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
    }).formatToParts(new Date(value));

    const hour = parts.find((part) => part.type === 'hour')?.value || '';
    const minute = parts.find((part) => part.type === 'minute')?.value || '';
    const dayPeriod = parts.find((part) => part.type === 'dayPeriod')?.value.toLowerCase() || '';

    return `${hour}${minute && minute !== '00' ? `:${minute}` : ''}${dayPeriod}`;
}

function getDateLabel(value: string): string {
    const date = new Date(value);
    const todayKey = getDateKey(new Date());
    const eventKey = getDateKey(date);

    if (eventKey === todayKey) return 'Today';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (eventKey === getDateKey(tomorrow)) return 'Tomorrow';

    const daysAway = Math.round((dateKeyToUtc(eventKey) - dateKeyToUtc(todayKey)) / 86400000);
    if (daysAway > 1 && daysAway < 7) {
        return new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'America/New_York' }).format(date);
    }

    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }).format(date);
}

function getDateTile(value: string): { top: string; bottom: string } {
    const label = getDateLabel(value);
    if (label === 'Today') return { top: 'Today', bottom: '' };
    if (label === 'Tomorrow') return { top: 'Tomorrow', bottom: '' };
    if (/^[A-Za-z]{3}$/.test(label)) {
        return {
            top: label,
            bottom: new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: 'America/New_York' }).format(new Date(value)),
        };
    }

    const [month, day] = label.split(' ');
    return { top: month || label, bottom: day || '' };
}

function getDateKey(value: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/New_York',
    }).format(value);
}

function dateKeyToUtc(value: string): number {
    const [year, month, day] = value.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
}

function getSourceName(event: EventFeedItem): string {
    return event.event_entities?.find((item) => item.relationship === 'source')?.entities?.name || '';
}

function getVenueName(event: EventFeedItem): string {
    return event.event_entities?.find((item) => item.relationship === 'venue')?.entities?.name || '';
}

function cleanEventLocation(value: string | null): string {
    const location = (value || '').trim();

    return location
        .replace(/\s*,?\s*(?:FL|Florida)\s*,?\s*\d{5}(?:-\d{4})?/gi, '')
        .replace(/\s*,?\s*(?:FL|Florida)\b/gi, '')
        .replace(/\s*,?\s*(?:USA|United States(?: of America)?)\b/gi, '')
        .replace(/\s*,\s*\d{5}(?:-\d{4})?\s*$/g, '')
        .replace(/\s*,\s*$/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function getPrimaryAssociation(event: EventFeedItem): string {
    return [getVenueName(event), cleanEventLocation(event.location_text)].filter(Boolean).join(' · ');
}

function cleanDescription(value: string | null): string {
    return (value || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

export function EventsFeed({
    events = [],
    expanded = false,
}: {
    events?: EventFeedItem[];
    expanded?: boolean;
}) {
    const [showAll, setShowAll] = useState(false);
    const visible = expanded || showAll ? events : events.slice(0, PREVIEW_COUNT);
    const remaining = events.length - PREVIEW_COUNT;

    return (
        <Panel
            title="Events"
            subtitle={events.length ? `${events.length} upcoming · next 3 weeks` : 'next 3 weeks'}
            noPadding
            className={expanded ? 'h-full' : ''}
            action={!expanded && (
                <Link
                    href="/events"
                    className="w-8 h-8 rounded-lg text-fg-muted hover:text-fg-primary hover:bg-bg-hover transition-colors duration-150 shrink-0 border border-bg-border inline-flex items-center justify-center"
                    title="Expand"
                    aria-label="Expand events"
                >
                    <ExpandIcon />
                </Link>
            )}
        >
            <div className={expanded ? 'overflow-auto flex-1 min-h-0' : ''}>
                {events.length === 0 ? (
                    <div className="px-5 py-4 text-sm text-fg-muted">
                        Event aggregation is ready. Add Supabase credentials and run the ingestion job to populate upcoming events.
                    </div>
                ) : (
                    visible.map((event) => {
                        const sourceName = getSourceName(event);
                        const eventMeta = [sourceName, formatEventTime(event.starts_at), getPrimaryAssociation(event)].filter(Boolean).join(' · ');
                        const teaser = cleanDescription(event.description);
                        const dateTile = getDateTile(event.starts_at);

                        return (
                            <a
                                key={event.id}
                                href={event.canonical_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => track('event_clicked', { title: event.title, url: event.canonical_url })}
                                className={`focus-row block px-5 ${expanded ? 'py-3' : 'py-2.5'} border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover transition-colors duration-100 group`}
                            >
                                <div className={`${expanded ? 'grid-cols-[4.75rem_minmax(0,1fr)]' : 'grid-cols-[4.25rem_minmax(0,1fr)]'} grid gap-3 items-start`}>
                                    <div
                                        className={`${expanded ? 'h-14 w-14' : 'h-12 w-12'} relative rounded-lg bg-bg-elevated/70 flex flex-col items-center justify-center text-center shrink-0 ${event.pinned ? 'ring-1 ring-accent-green/45' : ''}`}
                                        aria-label={getDateLabel(event.starts_at)}
                                    >
                                        <div className={`${dateTile.top.length > 5 ? 'text-[9px]' : 'text-[10px]'} font-semibold text-accent-green uppercase leading-none tracking-wide`}>
                                            {dateTile.top}
                                        </div>
                                        {dateTile.bottom && (
                                            <div className="text-lg font-semibold text-fg-primary mt-0.5 leading-none">
                                                {dateTile.bottom}
                                            </div>
                                        )}
                                        {event.pinned && <PinMark />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="text-sm font-medium text-fg-primary group-hover:text-accent-blue transition-colors truncate">
                                                {event.title}
                                            </div>
                                        </div>
                                        <div className="mt-0.5 text-xs text-fg-muted truncate">
                                            {eventMeta}
                                        </div>
                                        {expanded && teaser && (
                                            <div
                                                className="mt-1 max-w-4xl text-xs leading-5 text-fg-secondary overflow-hidden"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {teaser}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </a>
                        );
                    })
                )}
                {!expanded && events.length > PREVIEW_COUNT && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full px-5 py-2.5 text-[11px] font-medium text-fg-muted hover:text-fg-primary transition-colors duration-150 text-center"
                    >
                        {showAll ? '↑ Show less' : `↓ ${remaining} more`}
                    </button>
                )}
            </div>
        </Panel>
    );
}
