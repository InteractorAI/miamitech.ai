'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import type { EventFeedItem } from '../lib/events/types';
import { Panel } from './TerminalBlock';

const PREVIEW_COUNT = 5;

function formatEventDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
    }).format(new Date(value));
}

function getEventDay(value: string): { month: string; day: string } {
    const date = new Date(value);
    return {
        month: new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'America/New_York' }).format(date),
        day: new Intl.DateTimeFormat('en-US', { day: 'numeric', timeZone: 'America/New_York' }).format(date),
    };
}

function getPrimaryAssociation(event: EventFeedItem): string {
    const source = event.event_entities?.find((item) => item.relationship === 'source')?.entities;
    const venue = event.event_entities?.find((item) => item.relationship === 'venue')?.entities;
    return [source?.name, venue?.name].filter(Boolean).join(' · ');
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
            subtitle={events.length ? `${events.length} upcoming` : 'upcoming'}
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
                        const association = getPrimaryAssociation(event);
                        const teaser = cleanDescription(event.description);
                        const day = getEventDay(event.starts_at);

                        return (
                            <a
                                key={event.id}
                                href={event.canonical_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => track('event_clicked', { title: event.title, url: event.canonical_url })}
                                className="block px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover transition-colors duration-100 group"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`${expanded ? 'w-24 h-16' : 'w-16 h-14'} shrink-0 overflow-hidden rounded-md bg-bg-elevated border border-bg-border-subtle`}>
                                        {event.image_url ? (
                                            <img
                                                src={event.image_url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-center">
                                                <span className="text-[10px] font-semibold text-accent-blue uppercase leading-none">{day.month}</span>
                                                <span className="text-lg font-semibold text-fg-primary leading-tight">{day.day}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-[11px] font-medium text-accent-blue uppercase tracking-wide">
                                                    {formatEventDate(event.starts_at)}
                                                </div>
                                                <div className="mt-1 text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors truncate">
                                                    {event.title}
                                                </div>
                                            </div>
                                            {event.pinned && (
                                                <span className="text-[10px] font-semibold text-accent-green shrink-0">PINNED</span>
                                            )}
                                        </div>
                                        {teaser && (
                                            <div
                                                className="mt-1 text-xs leading-5 text-fg-secondary overflow-hidden"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: expanded ? 2 : 1,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {teaser}
                                            </div>
                                        )}
                                        {(event.location_text || association) && (
                                            <div className="mt-1 text-xs text-fg-muted truncate">
                                                {[event.location_text, association].filter(Boolean).join(' · ')}
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
                        className="w-full px-5 py-2.5 text-[11px] font-medium text-fg-muted hover:text-accent-pink transition-colors duration-150 text-center border-t border-bg-border-subtle"
                    >
                        {showAll ? '↑ Show less' : `↓ ${remaining} more`}
                    </button>
                )}
            </div>
        </Panel>
    );
}
