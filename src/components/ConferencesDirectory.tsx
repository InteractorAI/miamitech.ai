import { useState } from 'react';
import { Panel } from './TerminalBlock';
import { useConferencesData } from '../hooks/useSheetData';
import type { ConferenceEntry } from '../lib/googleSheets';

const PREVIEW_COUNT = 5;

export function ConferencesDirectory() {
    const { data: conferences, loading } = useConferencesData();
    const [expanded, setExpanded] = useState(false);

    const visible = expanded ? conferences : conferences.slice(0, PREVIEW_COUNT);
    const remaining = conferences.length - PREVIEW_COUNT;

    const handleRowClick = (conference: ConferenceEntry) => {
        window.interactor?.message.send(
            `Tell me about the ${conference.name} conference`
        );
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
                                <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors truncate">
                                    {conference.name}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                    {conference.website && (
                                        <a
                                            href={conference.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1 text-fg-muted hover:text-accent-blue transition-colors opacity-0 group-hover:opacity-100"
                                            title="Website"
                                        >
                                            {/* Globe */}
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z" />
                                            </svg>
                                        </a>
                                    )}
                                    {conference.linkedin && (
                                        <a
                                            href={conference.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1 text-fg-muted hover:text-accent-blue transition-colors opacity-0 group-hover:opacity-100"
                                            title="LinkedIn"
                                        >
                                            {/* LinkedIn */}
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                        </a>
                                    )}
                                    {conference.twitter && (
                                        <a
                                            href={`https://x.com/${conference.twitter.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1 text-fg-muted hover:text-accent-blue transition-colors opacity-0 group-hover:opacity-100"
                                            title="X / Twitter"
                                        >
                                            {/* X */}
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.737-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
