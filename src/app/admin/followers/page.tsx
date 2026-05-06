'use client';

import { useEffect, useMemo, useState } from 'react';

type Follower = {
    id: string;
    display_name: string;
    email_normalized: string;
    phone_e164: string | null;
    email_opt_in: boolean;
    sms_opt_in: boolean;
    source: string;
    resend_contact_id: string | null;
    first_seen_at: string;
    last_seen_at: string;
    created_at: string;
    updated_at: string;
};

type FilterMode = 'all' | 'sms' | 'email';

const STORAGE_KEY = 'miamitech-admin-secret';

export default function FollowersAdmin() {
    const [secret, setSecret] = useState('');
    const [followers, setFollowers] = useState<Follower[]>([]);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<FilterMode>('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setSecret(window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem('miamitech-event-admin-secret') || '');
    }, []);

    useEffect(() => {
        if (!secret) return;
        window.localStorage.setItem(STORAGE_KEY, secret);
    }, [secret]);

    const filteredFollowers = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return followers.filter((follower) => {
            if (filter === 'sms' && !follower.sms_opt_in) return false;
            if (filter === 'email' && !follower.email_opt_in) return false;
            if (!needle) return true;

            return [
                follower.display_name,
                follower.email_normalized,
                follower.phone_e164 || '',
                follower.source,
            ].join(' ').toLowerCase().includes(needle);
        });
    }, [followers, filter, query]);

    const stats = useMemo(() => ({
        total: followers.length,
        email: followers.filter((follower) => follower.email_opt_in).length,
        sms: followers.filter((follower) => follower.sms_opt_in).length,
    }), [followers]);

    async function loadFollowers() {
        if (!secret.trim()) {
            setError('Enter the admin secret first.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/followers', {
                headers: {
                    'x-admin-secret': secret.trim(),
                    accept: 'application/json',
                },
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Failed to load followers.');
            setFollowers(body.followers || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load followers.');
        } finally {
            setLoading(false);
        }
    }

    function exportCsv() {
        if (filteredFollowers.length === 0) return;

        const rows = filteredFollowers.map((follower) => ({
            name: follower.display_name,
            email: follower.email_normalized,
            phone: follower.phone_e164 || '',
            email_opt_in: follower.email_opt_in ? 'yes' : 'no',
            sms_opt_in: follower.sms_opt_in ? 'yes' : 'no',
            source: follower.source,
            first_seen_at: follower.first_seen_at,
            last_seen_at: follower.last_seen_at,
            resend_contact_id: follower.resend_contact_id || '',
        }));

        const csv = [
            Object.keys(rows[0]).join(','),
            ...rows.map((row) => Object.values(row).map(escapeCsvValue).join(',')),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `miamitech-followers-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    return (
        <main className="flex h-full min-h-0 flex-col overflow-hidden bg-bg-primary text-fg-primary">
            <div className="h-1 shrink-0 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green" />
            <header className="shrink-0 border-b border-bg-border bg-bg-card px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">Internal</p>
                        <h1 className="text-2xl font-bold">Followers</h1>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[minmax(220px,320px)_auto]">
                        <input
                            type="password"
                            value={secret}
                            onChange={(event) => setSecret(event.target.value)}
                            placeholder="Admin secret"
                            className="h-10 rounded border border-bg-border bg-bg-primary px-3 text-sm text-fg-primary placeholder:text-fg-muted"
                        />
                        <button
                            type="button"
                            onClick={loadFollowers}
                            disabled={loading}
                            className="h-10 rounded bg-accent-pink px-4 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {loading ? 'Loading' : 'Load followers'}
                        </button>
                    </div>
                </div>
            </header>

            <section className="shrink-0 border-b border-bg-border bg-bg-card px-5 py-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Metric label="Total" value={stats.total} />
                        <Metric label="Email" value={stats.email} />
                        <Metric label="Text" value={stats.sms} />
                    </div>
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search name, email, phone"
                            className="h-9 w-full rounded border border-bg-border bg-bg-primary px-3 text-sm text-fg-primary placeholder:text-fg-muted lg:w-72"
                        />
                        <div className="flex items-center gap-1 rounded border border-bg-border bg-bg-primary p-1">
                            {(['all', 'email', 'sms'] satisfies FilterMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setFilter(mode)}
                                    className={`h-8 rounded px-3 text-xs font-semibold capitalize ${filter === mode ? 'bg-fg-primary text-bg-primary' : 'text-fg-secondary hover:bg-bg-hover'}`}
                                >
                                    {mode === 'sms' ? 'Text' : mode}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={exportCsv}
                            disabled={filteredFollowers.length === 0}
                            className="h-9 rounded border border-bg-border px-3 text-xs font-semibold text-fg-secondary hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Export CSV
                        </button>
                    </div>
                </div>
                {error && (
                    <p className="mt-3 border border-accent-pink bg-accent-pink/10 px-3 py-2 text-sm text-fg-primary">
                        {error}
                    </p>
                )}
            </section>

            <section className="min-h-0 flex-1 overflow-y-auto">
                <div className="grid grid-cols-[minmax(190px,1.1fr)_minmax(220px,1.3fr)_minmax(120px,0.8fr)_110px_150px] border-b border-bg-border bg-bg-card px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-fg-muted max-lg:hidden">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Phone</span>
                    <span>Opt-ins</span>
                    <span>Last seen</span>
                </div>
                <div className="divide-y divide-bg-border">
                    {filteredFollowers.map((follower) => (
                        <article key={follower.id} className="grid gap-2 px-5 py-4 lg:grid-cols-[minmax(190px,1.1fr)_minmax(220px,1.3fr)_minmax(120px,0.8fr)_110px_150px] lg:items-center">
                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-semibold text-fg-primary">{follower.display_name}</h2>
                                <p className="mt-1 truncate text-xs text-fg-muted">{formatSource(follower.source)}</p>
                            </div>
                            <a href={`mailto:${follower.email_normalized}`} className="truncate text-sm font-medium text-accent-blue hover:underline">
                                {follower.email_normalized}
                            </a>
                            <div className="text-sm text-fg-secondary">
                                {follower.phone_e164 ? (
                                    <a href={`tel:${follower.phone_e164}`} className="hover:text-accent-blue">{follower.phone_e164}</a>
                                ) : (
                                    <span className="text-fg-muted">-</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {follower.email_opt_in && <Badge>Email</Badge>}
                                {follower.sms_opt_in && <Badge>Text</Badge>}
                            </div>
                            <time className="text-xs text-fg-muted" dateTime={follower.last_seen_at}>
                                {formatDateTime(follower.last_seen_at)}
                            </time>
                        </article>
                    ))}
                    {!loading && filteredFollowers.length === 0 && (
                        <div className="px-5 py-12 text-sm text-fg-muted">
                            No followers loaded.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="min-w-24 rounded border border-bg-border bg-bg-primary px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{label}</p>
            <p className="mt-1 text-xl font-bold text-fg-primary">{value}</p>
        </div>
    );
}

function Badge({ children }: { children: string }) {
    return (
        <span className="rounded border border-accent-green/40 bg-accent-green/10 px-2 py-0.5 text-[11px] font-semibold text-fg-primary">
            {children}
        </span>
    );
}

function escapeCsvValue(value: string) {
    if (!/[",\n]/.test(value)) return value;
    return `"${value.replace(/"/g, '""')}"`;
}

function formatSource(value: string) {
    return value.replace(/_/g, ' ');
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}
