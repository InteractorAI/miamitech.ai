'use client';
import { useState } from 'react';
import { Panel } from './TerminalBlock';
import type { ConferenceEntry } from '../lib/googleSheets';
import { Favicon } from './Favicon';
import { track } from '@vercel/analytics';
import { askInteractor, usesExplicitTouchActions } from '../lib/interactor';
import { InteractorAskIcon } from './InteractorAskIcon';

const PREVIEW_COUNT = 5;

export function ConferencesDirectory({ initialData = [] }: { initialData?: ConferenceEntry[] }) {
    const conferences = initialData;
    const loading = conferences.length === 0;
    const [expanded, setExpanded] = useState(false);

    const visible = expanded ? conferences : conferences.slice(0, PREVIEW_COUNT);
    const remaining = conferences.length - PREVIEW_COUNT;

    const handleRowClick = (conference: ConferenceEntry) => {
        if (usesExplicitTouchActions()) return;
        track('directory_row_clicked', { category: 'Conferences', title: conference.name });
        askInteractor(`Tell me about the ${conference.name} conference`);
    };

    const handleAskClick = (e: React.MouseEvent, conference: ConferenceEntry) => {
        e.stopPropagation();
        track('directory_row_clicked', { category: 'Conferences', title: conference.name, from: 'ask_button' });
        askInteractor(`Tell me about the ${conference.name} conference`);
    };

    return (
        <Panel title="Conferences" subtitle={loading ? '...' : `${conferences.length}`} noPadding>
            <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                {loading ? (
                    <div className="px-5 py-3 space-y-3">
                        {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
                            <div key={i} className="h-6 bg-bg-elevated rounded animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
                        ))}
                    </div>
                ) : (
                    <>
                        {visible.map((conference, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleRowClick(conference)}
                                className="flex items-center justify-between px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {conference.website && <Favicon url={conference.website} />}
                                    <div className="flex items-baseline gap-2 min-w-0 flex-1">
                                        <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors truncate shrink-0 max-w-[65%] sm:max-w-[80%]">
                                            {conference.name}
                                        </span>
                                        {conference.notes && (
                                            <span className="text-xs text-fg-muted truncate min-w-0 opacity-70">
                                                {conference.notes}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150">
                                    <button
                                        onClick={(e) => handleAskClick(e, conference)}
                                        className="min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 p-2 lg:p-1 inline-flex items-center justify-center text-accent-pink active:scale-[0.98]"
                                        aria-label={`Ask about ${conference.name}`}
                                        title="Ask Interactor"
                                    >
                                        <InteractorAskIcon />
                                    </button>
                                    {conference.website && (
                                        <a
                                            href={conference.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                track('directory_link_clicked', { category: 'Conferences', title: conference.name, url: conference.website || '' });
                                            }}
                                            className="min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 p-2 lg:p-1 inline-flex items-center justify-center text-fg-muted hover:text-accent-blue transition-colors"
                                            title="Website"
                                        >
                                            {/* Globe */}
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {conferences.length > PREVIEW_COUNT && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="w-full px-5 py-2.5 text-[11px] font-medium text-fg-muted hover:text-accent-pink transition-colors duration-150 text-center"
                            >
                                {expanded ? '↑ Show less' : `↓ ${remaining} more`}
                            </button>
                        )}
                    </>
                )}
            </div>
        </Panel>
    );
}
