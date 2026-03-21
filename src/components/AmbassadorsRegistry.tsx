'use client';
import { useState, useEffect } from 'react';
import { Panel } from './TerminalBlock';
import type { AmbassadorEntry } from '../lib/googleSheets';

const PREVIEW_COUNT = 5;

export function AmbassadorsRegistry({ initialData = [] }: { initialData?: AmbassadorEntry[] }) {
    const ambassadors = initialData;
    const loading = ambassadors.length === 0;
    const [expanded, setExpanded] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const visible = expanded ? ambassadors : ambassadors.slice(0, PREVIEW_COUNT);
    const remaining = ambassadors.length - PREVIEW_COUNT;

    const handleRowClick = (name: string) => {
        window.interactor?.message.send(`Tell me about ${name}`);
    };

    // Close modal on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowModal(false);
        };
        if (showModal) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [showModal]);

    const infoIcon = (
        <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center w-5 h-5 rounded-full border border-fg-muted/30 text-fg-muted hover:border-fg-secondary hover:text-fg-primary transition-all duration-200 text-[11px] font-semibold leading-none"
            title="Learn more"
        >
            ?
        </button>
    );

    return (
        <Panel title="Ambassadors" subtitle={loading ? '...' : `${ambassadors.length}`} noPadding action={infoIcon}>
            <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                {visible.map((a, i) => (
                    <div
                        key={i}
                        onClick={() => handleRowClick(a.name)}
                        className="flex items-center justify-between px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                    >
                        <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors truncate">
                            {a.name}
                        </span>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {a.twitter && (
                                <a
                                    href={a.twitter.startsWith('http') ? a.twitter : `https://x.com/${a.twitter.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 text-fg-muted hover:text-accent-blue transition-colors"
                                    title="Twitter / X"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.085 4.126H5.117z" />
                                    </svg>
                                </a>
                            )}
                            {a.linkedin && (
                                <a
                                    href={a.linkedin.startsWith('http') ? a.linkedin : `https://linkedin.com/in/${a.linkedin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 text-fg-muted hover:text-accent-blue transition-colors"
                                    title="LinkedIn"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                ))}
                {ambassadors.length > PREVIEW_COUNT && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full px-5 py-2.5 text-[11px] font-medium text-fg-muted hover:text-accent-pink transition-colors duration-150 text-center"
                    >
                        {expanded ? '↑ Show less' : `↓ ${remaining} more`}
                    </button>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="relative bg-bg-card border border-bg-border rounded-xl shadow-2xl max-w-sm w-full animate-scale-in overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="h-1.5 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green" />
                        
                        <div className="p-4 flex items-center justify-between border-b border-bg-border shrink-0">
                            <h3 className="text-[15px] font-bold text-fg-primary tracking-tight px-1">
                                Miami Tech Ecosystem Ambassadors
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-fg-muted hover:text-fg-primary transition-colors text-lg leading-none p-1"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="space-y-4 text-sm leading-relaxed text-fg-secondary">
                                <p>
                                    The people featured here are active members of Miami’s tech community and are prepared to help others navigate our ecosystem.
                                </p>
                                <p>
                                    If you’re new to Miami tech, these are individuals you can follow and reach out to as you explore the community and find your footing.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="mt-8 w-full py-2.5 bg-bg-hover hover:bg-bg-border text-fg-primary rounded-lg font-medium transition-colors border border-bg-border"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Panel>
    );
}
