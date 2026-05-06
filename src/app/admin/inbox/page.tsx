'use client';

import { useEffect, useMemo, useState } from 'react';

type InboxMessage = {
    id: string;
    provider: string;
    provider_event_id: string;
    provider_email_id: string | null;
    message_id: string | null;
    from_text: string | null;
    to_addresses: string[];
    cc_addresses: string[];
    bcc_addresses: string[];
    subject: string | null;
    attachment_count: number;
    received_at: string;
};

const STORAGE_KEY = 'miamitech-admin-secret';

export default function InboxAdmin() {
    const [secret, setSecret] = useState('');
    const [messages, setMessages] = useState<InboxMessage[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setSecret(window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem('miamitech-event-admin-secret') || '');
    }, []);

    useEffect(() => {
        if (!secret) return;
        window.localStorage.setItem(STORAGE_KEY, secret);
    }, [secret]);

    const filteredMessages = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return messages;

        return messages.filter((message) => [
            message.from_text || '',
            message.to_addresses.join(' '),
            message.subject || '',
            message.provider,
        ].join(' ').toLowerCase().includes(needle));
    }, [messages, query]);

    async function loadMessages() {
        if (!secret.trim()) {
            setError('Enter the admin secret first.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/inbox', {
                headers: {
                    'x-admin-secret': secret.trim(),
                    accept: 'application/json',
                },
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || 'Failed to load inbox.');
            setMessages(body.messages || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load inbox.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex h-full min-h-0 flex-col overflow-hidden bg-bg-primary text-fg-primary">
            <div className="h-1 shrink-0 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green" />
            <header className="shrink-0 border-b border-bg-border bg-bg-card px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-accent-pink">Internal</p>
                        <h1 className="text-2xl font-bold">Inbox</h1>
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
                            onClick={loadMessages}
                            disabled={loading}
                            className="h-10 rounded bg-accent-pink px-4 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {loading ? 'Loading' : 'Load inbox'}
                        </button>
                    </div>
                </div>
            </header>

            <section className="shrink-0 border-b border-bg-border bg-bg-card px-5 py-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Metric label="Messages" value={messages.length} />
                        <Metric label="Attachments" value={messages.reduce((sum, message) => sum + message.attachment_count, 0)} />
                    </div>
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search from, subject, recipient"
                        className="h-9 w-full rounded border border-bg-border bg-bg-primary px-3 text-sm text-fg-primary placeholder:text-fg-muted lg:w-80"
                    />
                </div>
                {error && (
                    <p className="mt-3 border border-accent-pink bg-accent-pink/10 px-3 py-2 text-sm text-fg-primary">
                        {error}
                    </p>
                )}
            </section>

            <section className="min-h-0 flex-1 overflow-y-auto">
                <div className="grid grid-cols-[minmax(220px,1fr)_minmax(260px,1.5fr)_minmax(180px,0.9fr)_150px] border-b border-bg-border bg-bg-card px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-fg-muted max-lg:hidden">
                    <span>From</span>
                    <span>Subject</span>
                    <span>To</span>
                    <span>Received</span>
                </div>
                <div className="divide-y divide-bg-border">
                    {filteredMessages.map((message) => (
                        <article key={message.id} className="grid gap-2 px-5 py-4 lg:grid-cols-[minmax(220px,1fr)_minmax(260px,1.5fr)_minmax(180px,0.9fr)_150px] lg:items-center">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-fg-primary">{message.from_text || '-'}</p>
                                <p className="mt-1 text-xs text-fg-muted">{formatProvider(message.provider)}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-fg-primary">{message.subject || '(no subject)'}</p>
                                {message.attachment_count > 0 && (
                                    <p className="mt-1 text-xs text-fg-muted">{message.attachment_count} attachment{message.attachment_count === 1 ? '' : 's'}</p>
                                )}
                            </div>
                            <p className="truncate text-sm text-fg-secondary">{message.to_addresses.join(', ') || '-'}</p>
                            <time className="text-xs text-fg-muted" dateTime={message.received_at}>
                                {formatDateTime(message.received_at)}
                            </time>
                        </article>
                    ))}
                    {!loading && filteredMessages.length === 0 && (
                        <div className="px-5 py-12 text-sm text-fg-muted">
                            No inbound emails loaded.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className="min-w-28 rounded border border-bg-border bg-bg-primary px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{label}</p>
            <p className="mt-1 text-xl font-bold text-fg-primary">{value}</p>
        </div>
    );
}

function formatProvider(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
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
