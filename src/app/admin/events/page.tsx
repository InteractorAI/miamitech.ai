'use client';

import { useEffect, useMemo, useState } from 'react';

type CuratedEvent = {
    id: string;
    title: string;
    starts_at: string;
    canonical_url: string;
    location_text: string | null;
    status: string;
    hidden: boolean;
    pinned: boolean;
    promote_outbound: boolean;
    event_entities?: Array<{
        relationship: string;
        entities: {
            type: string;
            handle: string;
            name: string;
        } | null;
    }>;
};

type FilterMode = 'all' | 'promoted' | 'demoted';

const STORAGE_KEY = 'miamitech-event-admin-secret';

export default function EventCurationAdmin() {
    const [secret, setSecret] = useState('');
    const [events, setEvents] = useState<CuratedEvent[]>([]);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<FilterMode>('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setSecret(window.localStorage.getItem(STORAGE_KEY) || '');
    }, []);

    useEffect(() => {
        if (!secret) return;
        window.localStorage.setItem(STORAGE_KEY, secret);
    }, [secret]);

    const filteredEvents = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return events.filter((event) => {
            if (filter === 'promoted' && !event.promote_outbound) return false;
            if (filter === 'demoted' && event.promote_outbound) return false;
            if (!needle) return true;

            return [
                event.title,
                getSourceName(event),
                event.location_text || '',
            ].join(' ').toLowerCase().includes(needle);
        });
    }, [events, filter, query]);

    async function loadEvents() {
        if (!secret.trim()) {
            setError('Enter the job secret first.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/events?windowDays=60', {
                headers: {
                    'x-admin-secret': secret.trim(),
                    accept: 'application/json',
                },
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Failed to load events.');
            setEvents(body.events || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load events.');
        } finally {
            setLoading(false);
        }
    }

    async function updateEvent(id: string, updates: Partial<Pick<CuratedEvent, 'promote_outbound' | 'hidden' | 'pinned'>>) {
        setError('');
        const previous = events;
        setEvents((current) => current.map((event) => event.id === id ? { ...event, ...updates } : event));

        try {
            const res = await fetch('/api/admin/events', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-admin-secret': secret.trim(),
                },
                body: JSON.stringify({
                    id,
                    promoteOutbound: updates.promote_outbound,
                    hidden: updates.hidden,
                    pinned: updates.pinned,
                }),
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Failed to update event.');
        } catch (err) {
            setEvents(previous);
            setError(err instanceof Error ? err.message : 'Failed to update event.');
        }
    }

    return (
        <main className="flex h-full min-h-0 flex-col overflow-hidden bg-bg-primary text-fg-primary">
            <div className="h-1 shrink-0 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green" />
            <header className="shrink-0 border-b border-bg-border bg-bg-card px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">Internal</p>
                        <h1 className="text-2xl font-bold">Event Curation</h1>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[minmax(220px,320px)_auto]">
                        <input
                            type="password"
                            value={secret}
                            onChange={(event) => setSecret(event.target.value)}
                            placeholder="Job secret"
                            className="h-10 rounded border border-bg-border bg-bg-primary px-3 text-sm text-fg-primary placeholder:text-fg-muted"
                        />
                        <button
                            type="button"
                            onClick={loadEvents}
                            disabled={loading}
                            className="h-10 rounded bg-accent-pink px-4 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {loading ? 'Loading' : 'Load events'}
                        </button>
                    </div>
                </div>
            </header>

            <section className="shrink-0 border-b border-bg-border bg-bg-card px-5 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search events"
                            className="h-9 w-full max-w-xl rounded border border-bg-border bg-bg-primary px-3 text-sm text-fg-primary placeholder:text-fg-muted"
                        />
                    </div>
                    <div className="flex items-center gap-1 rounded border border-bg-border bg-bg-primary p-1">
                        {(['all', 'promoted', 'demoted'] satisfies FilterMode[]).map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setFilter(mode)}
                                className={`h-8 rounded px-3 text-xs font-semibold capitalize ${filter === mode ? 'bg-fg-primary text-bg-primary' : 'text-fg-secondary hover:bg-bg-hover'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
                {error && (
                    <p className="mt-3 border border-accent-pink bg-accent-pink/10 px-3 py-2 text-sm text-fg-primary">
                        {error}
                    </p>
                )}
            </section>

            <section className="min-h-0 flex-1 divide-y divide-bg-border overflow-y-auto">
                {filteredEvents.map((event) => (
                    <article key={event.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                                <span>{formatDateTime(event.starts_at)}</span>
                                {getSourceName(event) && <span>{getSourceName(event)}</span>}
                                {event.pinned && <span className="text-accent-green">Pinned</span>}
                                {!event.promote_outbound && <span className="text-accent-pink">Demoted</span>}
                                {event.hidden && <span className="text-accent-pink">Hidden</span>}
                            </div>
                            <h2 className="mt-1 truncate text-base font-semibold text-fg-primary">{event.title}</h2>
                            {event.location_text && (
                                <p className="mt-1 truncate text-sm text-fg-secondary">{event.location_text}</p>
                            )}
                            <a
                                href={event.canonical_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex text-sm font-semibold text-accent-blue hover:underline"
                            >
                                Event source
                            </a>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:w-[360px]">
                            <button
                                type="button"
                                onClick={() => updateEvent(event.id, { promote_outbound: !event.promote_outbound })}
                                className={`h-9 rounded px-3 text-xs font-semibold ${event.promote_outbound ? 'border border-accent-pink text-accent-pink' : 'bg-accent-pink text-white'}`}
                            >
                                {event.promote_outbound ? 'Demote' : 'Promote'}
                            </button>
                            <button
                                type="button"
                                onClick={() => updateEvent(event.id, { pinned: !event.pinned })}
                                className={`h-9 rounded px-3 text-xs font-semibold ${event.pinned ? 'bg-accent-green text-black' : 'border border-bg-border text-fg-secondary'}`}
                            >
                                {event.pinned ? 'Unpin' : 'Pin'}
                            </button>
                            <button
                                type="button"
                                onClick={() => updateEvent(event.id, { hidden: !event.hidden })}
                                className={`h-9 rounded px-3 text-xs font-semibold ${event.hidden ? 'bg-accent-pink text-white' : 'border border-bg-border text-fg-secondary'}`}
                            >
                                {event.hidden ? 'Show' : 'Hide'}
                            </button>
                        </div>
                    </article>
                ))}
                {!loading && filteredEvents.length === 0 && (
                    <div className="px-5 py-12 text-sm text-fg-muted">
                        No events loaded.
                    </div>
                )}
            </section>
        </main>
    );
}

function getSourceName(event: CuratedEvent) {
    return event.event_entities?.find((item) => item.relationship === 'source')?.entities?.name || '';
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}
