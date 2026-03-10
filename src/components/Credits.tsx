'use client';
import { useState, useEffect } from 'react';
import { useContributorsData } from '../hooks/useSheetData';

function XIcon() {
    return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.085 4.126H5.117z" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
    );
}

export function Credits() {
    const [open, setOpen] = useState(false);
    const { data: rawContributors, loading } = useContributorsData();
    const contributors = [...rawContributors].sort((a, b) => a.name.localeCompare(b.name));

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        if (open) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="text-[11px] font-medium text-fg-muted hover:text-fg-secondary transition-colors duration-150 px-2 py-1 rounded-md hover:bg-bg-hover"
            >
                Contributors
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

                    <div
                        className="relative bg-bg-card border border-bg-border rounded-xl shadow-2xl max-w-xs w-full animate-scale-in overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="h-1 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green" />

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-fg-primary tracking-tight">
                                    Key Contributors
                                </h3>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="text-fg-muted hover:text-fg-primary transition-colors text-lg leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            <div className={`max-h-72 overflow-y-auto -mx-2 ${loading ? 'opacity-50' : ''}`}>
                                {loading && (
                                    <div className="py-6 text-center text-xs text-fg-muted">Loading...</div>
                                )}

                                {!loading && contributors.map((c, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-bg-hover transition-colors duration-100 group"
                                    >
                                        <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors">
                                            {c.name}
                                        </span>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                            {c.twitter && (
                                                <a
                                                    href={c.twitter.startsWith('http') ? c.twitter : `https://x.com/${c.twitter.replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    className="p-1.5 text-fg-muted hover:text-accent-blue transition-colors rounded"
                                                    title="X / Twitter"
                                                >
                                                    <XIcon />
                                                </a>
                                            )}
                                            {c.linkedin && (
                                                <a
                                                    href={c.linkedin.startsWith('http') ? c.linkedin : `https://linkedin.com/in/${c.linkedin}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    className="p-1.5 text-fg-muted hover:text-accent-blue transition-colors rounded"
                                                    title="LinkedIn"
                                                >
                                                    <LinkedInIcon />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {!loading && (
                                    <div className="px-3 pt-1 pb-0.5">
                                        <button
                                            onClick={() => {
                                                setOpen(false);
                                                window.interactor?.message.send('I want to suggest someone who should be listed as a contributor to miamitech.ai');
                                            }}
                                            className="text-xs text-fg-muted hover:text-accent-pink transition-colors italic"
                                        >
                                            Missing someone? Tell us →
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-bg-border">
                                <p className="text-[11px] text-fg-muted text-center leading-relaxed">
                                    Powered by{' '}
                                    <a
                                        href="https://interactor.ai"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-fg-secondary hover:text-accent-blue transition-colors"
                                    >
                                        Interactor
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
