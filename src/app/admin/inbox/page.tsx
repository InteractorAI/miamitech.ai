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
    text_body: string | null;
    html_body: string | null;
    body_status: string;
    received_at: string;
};

const STORAGE_KEY = 'miamitech-admin-secret';

export default function InboxAdmin() {
    const [secret, setSecret] = useState('');
    const [messages, setMessages] = useState<InboxMessage[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
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

    const selectedMessage = useMemo(() => {
        return messages.find((message) => message.id === selectedId) || filteredMessages[0] || null;
    }, [filteredMessages, messages, selectedId]);

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
            setSelectedId((current) => current || body.messages?.[0]?.id || null);
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

            <section className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(420px,0.95fr)_minmax(420px,1.05fr)]">
                <div className="min-h-0 overflow-y-auto border-r border-bg-border">
                    <div className="grid grid-cols-[minmax(160px,1fr)_minmax(180px,1.2fr)_120px] border-b border-bg-border bg-bg-card px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-fg-muted max-lg:hidden">
                        <span>From</span>
                        <span>Subject</span>
                        <span>Received</span>
                    </div>
                    <div className="divide-y divide-bg-border">
                        {filteredMessages.map((message) => (
                            <button
                                type="button"
                                key={message.id}
                                onClick={() => setSelectedId(message.id)}
                                className={`grid w-full gap-2 px-5 py-4 text-left transition-colors lg:grid-cols-[minmax(160px,1fr)_minmax(180px,1.2fr)_120px] lg:items-center ${selectedMessage?.id === message.id ? 'bg-bg-hover' : 'hover:bg-bg-card'}`}
                            >
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
                                <time className="text-xs text-fg-muted" dateTime={message.received_at}>
                                    {formatDateTime(message.received_at)}
                                </time>
                            </button>
                        ))}
                        {!loading && filteredMessages.length === 0 && (
                            <div className="px-5 py-12 text-sm text-fg-muted">
                                No inbound emails loaded.
                            </div>
                        )}
                    </div>
                </div>

                <div className="min-h-0 overflow-y-auto bg-bg-card">
                    {selectedMessage ? (
                        <div className="px-5 py-5">
                            <div className="border-b border-bg-border pb-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Message</p>
                                <h2 className="mt-2 text-xl font-bold text-fg-primary">{selectedMessage.subject || '(no subject)'}</h2>
                                <dl className="mt-4 grid gap-2 text-sm text-fg-secondary">
                                    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
                                        <dt className="font-semibold text-fg-muted">From</dt>
                                        <dd className="min-w-0 break-words">{selectedMessage.from_text || '-'}</dd>
                                    </div>
                                    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
                                        <dt className="font-semibold text-fg-muted">To</dt>
                                        <dd className="min-w-0 break-words">{selectedMessage.to_addresses.join(', ') || '-'}</dd>
                                    </div>
                                    <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
                                        <dt className="font-semibold text-fg-muted">When</dt>
                                        <dd>{formatDateTime(selectedMessage.received_at)}</dd>
                                    </div>
                                </dl>
                            </div>
                            <div className="py-5">
                                {messageBody(selectedMessage) ? (
                                    <pre className="whitespace-pre-wrap break-words rounded border border-bg-border bg-bg-primary p-4 font-sans text-sm leading-relaxed text-fg-primary">
                                        {messageBody(selectedMessage)}
                                    </pre>
                                ) : (
                                    <div className="rounded border border-bg-border bg-bg-primary p-4 text-sm text-fg-muted">
                                        {selectedMessage.body_status === 'failed'
                                            ? 'Body unavailable. The provider API key needs receiving read access to retrieve message content.'
                                            : 'No body captured for this message yet.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="px-5 py-12 text-sm text-fg-muted">Select a message.</div>
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

function messageBody(message: InboxMessage) {
    if (message.text_body) return message.text_body;
    if (!message.html_body) return '';
    return message.html_body
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
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
