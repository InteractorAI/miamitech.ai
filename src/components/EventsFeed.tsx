'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import type { EventFeedItem } from '../lib/events/types';
import { ExpandIcon } from './ExpandIcon';
import { Panel } from './TerminalBlock';

const PREVIEW_COUNT = 5;

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
                                className={`block px-5 ${expanded ? 'py-3' : 'py-2.5'} border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover transition-colors duration-100 group`}
                            >
                                <div className={`${expanded ? 'grid-cols-[4.75rem_minmax(0,1fr)]' : 'grid-cols-[4.25rem_minmax(0,1fr)]'} grid gap-3 items-start`}>
                                    <div
                                        className={`${expanded ? 'h-14 w-14' : 'h-12 w-12'} rounded-lg bg-bg-elevated/70 flex flex-col items-center justify-center text-center shrink-0`}
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
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="text-sm font-medium text-fg-primary group-hover:text-accent-blue transition-colors truncate">
                                                {event.title}
                                            </div>
                                            {event.pinned && (
                                                <span className="text-[10px] font-semibold text-accent-green shrink-0">PINNED</span>
                                            )}
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
