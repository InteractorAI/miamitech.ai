'use client';
import { useState } from 'react';
import { Panel } from './TerminalBlock';
// import { useSpacesData } from '../hooks/useSheetData';
import type { SpaceEntry } from '../lib/googleSheets';
import { Favicon } from './Favicon';
import { track } from '@vercel/analytics';
import { askInteractor, usesExplicitTouchActions } from '../lib/interactor';
import { InteractorAskIcon } from './InteractorAskIcon';

const PREVIEW_COUNT = 4;

export function SpacesDirectory({ initialData = [] }: { initialData?: SpaceEntry[] }) {
    const spaces = initialData;
    const loading = spaces.length === 0;
    const [expanded, setExpanded] = useState(false);

    const visible = expanded ? spaces : spaces.slice(0, PREVIEW_COUNT);
    const remaining = spaces.length - PREVIEW_COUNT;

    const handleRowClick = (space: SpaceEntry) => {
        if (usesExplicitTouchActions()) return;
        track('directory_row_clicked', { category: 'Spaces', title: space.name });
        askInteractor(`Tell me about ${space.name}`);
    };

    const handleAskClick = (e: React.MouseEvent, space: SpaceEntry) => {
        e.stopPropagation();
        track('directory_row_clicked', { category: 'Spaces', title: space.name, from: 'ask_button' });
        askInteractor(`Tell me about ${space.name}`);
    };

    const handleRowKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, space: SpaceEntry) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        handleRowClick(space);
    };

    return (
        <Panel title="Spaces" subtitle={loading ? '...' : `${spaces.length}`} noPadding>
            <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                {visible.map((space, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleRowClick(space)}
                        onKeyDown={(e) => handleRowKeyDown(e, space)}
                        role="button"
                        tabIndex={0}
                        className="focus-row flex items-center justify-between px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {space.url && <Favicon url={space.url} />}
                            <div className="flex items-baseline gap-2 min-w-0">
                                <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors truncate">
                                    {space.name}
                                </span>
                                <span className="text-xs text-fg-muted truncate">{space.location}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 transition-opacity duration-150">
                            <button
                                onClick={(e) => handleAskClick(e, space)}
                                className="min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 p-2 lg:p-1 inline-flex items-center justify-center text-accent-pink active:scale-[0.98]"
                                aria-label={`Ask about ${space.name}`}
                                title="Ask Interactor"
                            >
                                <InteractorAskIcon />
                            </button>
                            {space.url && (
                                <a
                                    href={space.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        track('directory_link_clicked', { category: 'Spaces', title: space.name, url: space.url || '' });
                                    }}
                                    className="min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 p-2 lg:p-1 inline-flex items-center justify-center text-fg-muted hover:text-accent-blue transition-colors"
                                    title="Website"
                                >
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
                {spaces.length > PREVIEW_COUNT && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full px-5 py-2.5 text-[11px] font-medium text-fg-muted hover:text-accent-pink transition-colors duration-150 text-center"
                    >
                        {expanded ? '↑ Show less' : `↓ ${remaining} more`}
                    </button>
                )}
            </div>
        </Panel>
    );
}
