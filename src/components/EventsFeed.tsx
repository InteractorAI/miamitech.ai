'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import type { EventFeedItem } from '../lib/events/types';
import { Panel } from './TerminalBlock';

const PREVIEW_COUNT = 5;

function formatEventTime(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
    }).format(new Date(value));
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

function getPrimaryAssociation(event: EventFeedItem): string {
    return [getVenueName(event), event.location_text].filter(Boolean).join(' · ');
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
                    className="p-1.5 rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-hover transition-all duration-150 shrink-0 text-base leading-none border border-bg-border inline-flex items-center justify-center"
                    title="Expand"
                >
                    ↗
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

                        return (
                            <a
                                key={event.id}
                                href={event.canonical_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => track('event_clicked', { title: event.title, url: event.canonical_url })}
                                className="block px-5 py-2.5 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover transition-colors duration-100 group"
                            >
                                <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[5rem_minmax(0,1fr)] gap-3 items-start">
                                    <div className="text-[11px] font-semibold text-accent-green uppercase tracking-wide pt-0.5">
                                        {getDateLabel(event.starts_at)}
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
                                                className="mt-1 text-xs leading-5 text-fg-secondary overflow-hidden"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
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
                        className="w-full px-5 py-2.5 text-[11px] font-medium text-fg-muted hover:text-fg-primary transition-colors duration-150 text-center border-t border-bg-border-subtle"
                    >
                        {showAll ? '↑ Show less' : `↓ ${remaining} more`}
                    </button>
                )}
            </div>
        </Panel>
    );
}
