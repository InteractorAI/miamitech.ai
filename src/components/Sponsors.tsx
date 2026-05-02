'use client';
import { useState, useEffect } from 'react';
import { Panel } from './TerminalBlock';
import { track } from '@vercel/analytics';

interface Sponsor {
    title: string;
    subhead: string;
    url: string;
}

const SPONSORS: Sponsor[] = [
    {
        title: 'Interactor',
        subhead: 'The AI concierge for your business',
        url: 'https://interactor.ai',
    },
];

export function Sponsors() {
    const [showModal, setShowModal] = useState(false);

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
            onClick={() => {
                track('sponsor_modal_opened', { from: 'info_icon' });
                setShowModal(true);
            }}
            className="flex items-center justify-center w-5 h-5 rounded-full border border-fg-muted/30 text-fg-muted hover:border-fg-secondary hover:text-fg-primary transition-all duration-200 text-[11px] font-semibold leading-none"
            title="Learn about sponsoring"
        >
            ?
        </button>
    );

    return (
        <Panel title="Sponsors" noPadding action={infoIcon}>
            <div className="flex overflow-x-auto gap-2 p-3 no-scrollbar">
                {SPONSORS.map((s, i) => (
                    <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => track('sponsor_link_clicked', { sponsor: s.title, url: s.url })}
                        className="group shrink-0 w-44 border border-bg-border-subtle rounded-lg px-3 py-3 bg-gradient-to-b from-bg-elevated/40 to-bg-card/20 hover:border-fg-muted/30 hover:bg-bg-hover transition-all duration-300 shadow-sm"
                    >
                        <div className="text-xs font-semibold text-fg-primary group-hover:text-accent-blue leading-tight transition-colors">{s.title}</div>
                        <div className="text-[11px] text-fg-muted leading-snug mt-1.5">{s.subhead}</div>
                    </a>
                ))}
                <button
                    onClick={() => {
                        track('sponsor_modal_opened', { from: 'placeholder' });
                        setShowModal(true);
                    }}
                    className="shrink-0 w-44 border border-dashed border-bg-border-subtle rounded-lg px-3 py-3 bg-bg-card/30 hover:border-fg-muted/30 hover:bg-bg-hover transition-all duration-300 text-left shadow-sm"
                >
                    <div className="text-xs font-semibold text-fg-muted leading-tight">Your brand here</div>
                    <div className="text-[11px] text-fg-muted/60 leading-snug mt-1.5">Become a sponsor →</div>
                </button>
            </div>

            {/* Sponsor Modal */}
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
                                Sponsor MiamiTech.ai
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-fg-muted hover:text-fg-primary transition-colors text-lg leading-none p-1"
                            >
                                ×
                            </button>
                        </div>

                        <div className="px-8 py-4">
                            <div className="space-y-4 text-sm leading-relaxed text-fg-secondary">
                                <ul className="space-y-2 mt-4 text-[14px]">
                                    <li className="flex items-start gap-2">
                                        <span className="text-accent-green">✓</span>
                                        <span>Support the Miami tech ecosystem</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-accent-green">✓</span>
                                        <span>Highlight your brand as an ecosystem pillar</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-accent-green">✓</span>
                                        <span>Get in front of newcomers and visitors</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-accent-green">✓</span>
                                        <span>Reach founders, investors, and talent</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-accent-green">✓</span>
                                        <span>Receive occassional shout outs</span>
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={() => {
                                    track('sponsor_get_started_clicked');
                                    setShowModal(false);
                                    window.interactor?.message.send("I'd like to sponsor miamitech.ai ");
                                }}
                                className="mt-8 w-full py-2.5 bg-bg-hover hover:bg-bg-border text-fg-primary hover:text-accent-pink rounded-lg font-medium transition-all border border-bg-border hover:border-accent-pink/40 animate-led active:scale-[0.98]"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Panel>
    );
}
