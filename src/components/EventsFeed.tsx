'use client';

import { track } from '@vercel/analytics';
import type { EventFeedItem } from '../lib/events/types';
import { Panel } from './TerminalBlock';

function formatEventDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
    }).format(new Date(value));
}

function getPrimaryAssociation(event: EventFeedItem): string {
    const source = event.event_entities?.find((item) => item.relationship === 'source')?.entities;
    const venue = event.event_entities?.find((item) => item.relationship === 'venue')?.entities;
    return [source?.name, venue?.name].filter(Boolean).join(' · ');
}

export function EventsFeed({ events = [] }: { events?: EventFeedItem[] }) {
    return (
        <Panel title="Events" subtitle={events.length ? `${events.length} upcoming` : 'upcoming'} noPadding>
            <div>
                {events.length === 0 ? (
                    <div className="px-5 py-4 text-sm text-fg-muted">
                        Event aggregation is ready. Add Supabase credentials and run the ingestion job to populate upcoming events.
                    </div>
                ) : (
                    events.map((event) => {
                        const association = getPrimaryAssociation(event);

                        return (
                            <a
                                key={event.id}
                                href={event.canonical_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => track('event_clicked', { title: event.title, url: event.canonical_url })}
                                className="block px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover transition-colors duration-100 group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-medium text-accent-blue uppercase tracking-wide">
                                            {formatEventDate(event.starts_at)}
                                        </div>
                                        <div className="mt-1 text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors truncate">
                                            {event.title}
                                        </div>
                                        {(event.location_text || association) && (
                                            <div className="mt-1 text-xs text-fg-muted truncate">
                                                {[event.location_text, association].filter(Boolean).join(' · ')}
                                            </div>
                                        )}
                                    </div>
                                    {event.pinned && (
                                        <span className="text-[10px] font-semibold text-accent-green shrink-0">PINNED</span>
                                    )}
                                </div>
                            </a>
                        );
                    })
                )}
            </div>
        </Panel>
    );
}
