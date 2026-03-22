'use client';
import { useState, useEffect } from 'react';
import { useContributorsData } from '../hooks/useSheetData';
import Image from 'next/image';

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
    const [activeTab, setActiveTab] = useState<'about' | 'contributors'>('about');

    const { data: rawContributors, loading } = useContributorsData();
    const contributors = [...rawContributors].sort((a, b) => a.name.localeCompare(b.name));

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        const openHandler = (e: any) => {
            setOpen(true);
            if (e.detail?.tab) {
                setActiveTab(e.detail.tab);
            }
        };

        if (open) window.addEventListener('keydown', handler);
        window.addEventListener('open-about-modal', openHandler);

        return () => {
            window.removeEventListener('keydown', handler);
            window.removeEventListener('open-about-modal', openHandler);
        };
    }, [open]);

    // Cleanup backward compatibility event name if still used elsewhere
    useEffect(() => {
        const legacyHandler = () => {
            setOpen(true);
            setActiveTab('contributors');
        };
        window.addEventListener('open-contributors', legacyHandler);
        return () => window.removeEventListener('open-contributors', legacyHandler);
    }, []);

    const handleOpen = (tab: 'about' | 'contributors' = 'about') => {
        setActiveTab(tab);
        setOpen(true);
    };

    return (
        <>
            <button
                onClick={() => handleOpen('contributors')}
                className="text-[11px] font-medium text-fg-muted hover:text-fg-secondary transition-colors duration-150 px-2 py-1 rounded-md hover:bg-bg-hover"
            >
                Contributors
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" />

                    <div
                        className="relative bg-bg-card border border-bg-border rounded-xl shadow-2xl max-w-sm w-full animate-scale-in flex flex-col max-h-[85vh] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="h-1.5 shrink-0 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green" />

                        {/* Modal Header */}
                        <div className="p-4 flex items-center justify-between border-b border-bg-border shrink-0">
                            <div className="flex gap-1 p-1 bg-bg-hover rounded-lg">
                                <button
                                    onClick={() => setActiveTab('about')}
                                    className={`px-4 py-1.5 text-[11px] font-bold tracking-tight rounded-md transition-all duration-200 ${activeTab === 'about'
                                        ? 'bg-bg-card text-fg-primary shadow-sm ring-1 ring-bg-border'
                                        : 'text-fg-muted hover:text-fg-secondary'
                                        }`}
                                >
                                    About
                                </button>
                                <button
                                    onClick={() => setActiveTab('contributors')}
                                    className={`px-4 py-1.5 text-[11px] font-bold tracking-tight rounded-md transition-all duration-200 ${activeTab === 'contributors'
                                        ? 'bg-bg-card text-fg-primary shadow-sm ring-1 ring-bg-border'
                                        : 'text-fg-muted hover:text-fg-secondary'
                                        }`}
                                >
                                    Contributors
                                </button>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-fg-muted hover:text-fg-primary transition-colors text-lg leading-none p-1"
                            >
                                ×
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {activeTab === 'about' ? (
                                <div className="p-8 flex flex-col items-center text-center animate-fade-in shadow-inner-top">
                                    <div className="p-4 bg-bg-hover rounded-2xl mb-5 border border-bg-border">
                                        <Image
                                            src="/favicon.png"
                                            alt="miamitech.ai logo"
                                            width={56}
                                            height={56}
                                            className="rounded-xl shadow-sm overflow-hidden bg-black"
                                            priority
                                            unoptimized
                                        />
                                    </div>
                                    <h2 className="text-xl font-bold text-fg-primary tracking-tight mb-2">
                                        miamitech<span className="text-accent-pink">.ai</span>
                                    </h2>
                                    <p className="text-[12px] font-bold text-accent-green tracking-[0.15em] uppercase mb-6">
                                        Community Concierge & Index
                                    </p>

                                    <div className="space-y-4 text-sm text-fg-secondary leading-relaxed max-w-xs transition-all duration-300 font-medium">
                                        <p>
                                            MiamiTech.ai is an AI concierge and index for the Miami tech ecosystem. It provides an information-dense view of local resources alongside an AI agent that helps people navigate the ecosystem, backed by humans who can assist when needed.
                                        </p>

                                        <div className="pt-4 border-t border-bg-border/50 flex flex-col items-center">
                                            <a
                                                href="https://docs.google.com/spreadsheets/d/1hqKbGMHKT3pbgFRLKVWcJ7xgInwe6FLwYaMn1uld_Pg/edit"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-bold text-fg-muted hover:text-accent-blue flex items-center gap-1.5 uppercase tracking-wider transition-all duration-200"
                                            >
                                                <span>View Source Data</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className="p-6 animate-fade-in shadow-inner-top">
                                    <div className={`-mx-2 ${loading ? 'opacity-50' : ''}`}>
                                        {loading && (
                                            <div className="py-12 text-center text-xs text-fg-muted">Loading contributors...</div>
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
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
