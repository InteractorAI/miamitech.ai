'use client';
import { useState } from 'react';
import { Panel } from './TerminalBlock';
import { Favicon } from './Favicon';
import type { NewsEntry } from '../lib/googleSheets';
import { track } from '@vercel/analytics';
import { askInteractor } from '../lib/interactor';
import { InteractorAskIcon } from './InteractorAskIcon';

const PREVIEW_COUNT = 4;

export function NewsSources({ initialData = [] }: { initialData?: NewsEntry[] }) {
    const [expanded, setExpanded] = useState(false);
    const NEWS_SOURCES = initialData;
    const visible = expanded ? NEWS_SOURCES : NEWS_SOURCES.slice(0, PREVIEW_COUNT);
    const remaining = NEWS_SOURCES.length - PREVIEW_COUNT;

    const handleRowClick = (source: NewsEntry) => {
        if (!source.url) return;
        track('news_link_clicked', { title: source.name, url: source.url, from: 'row' });
        window.open(source.url, '_blank', 'noopener,noreferrer');
    };

    const handleAskClick = (event: React.MouseEvent, source: NewsEntry) => {
        event.stopPropagation();
        track('directory_row_clicked', { category: 'News', title: source.name, from: 'ask_button' });
        askInteractor(`Tell me about ${source.name}`);
    };

    return (
        <Panel title="News" subtitle={`${NEWS_SOURCES.length} sources`} noPadding>
            <div>
                {visible.map((source, i) => (
                    <div
                        key={i}
                        onClick={() => handleRowClick(source)}
                        className="flex items-center justify-between px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Favicon url={source.url} />
                            <span className="flex min-w-0 flex-1 flex-col min-[480px]:flex-row min-[480px]:items-baseline min-[480px]:gap-2">
                                <span className="truncate text-sm font-medium text-fg-primary group-hover:text-accent-blue transition-colors min-[480px]:shrink-0 min-[480px]:max-w-[65%] sm:max-w-[80%]">{source.name}</span>
                                <span className="block truncate text-xs text-fg-muted opacity-80 min-w-0">{source.desc}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150">
                            <button
                                onClick={(event) => handleAskClick(event, source)}
                                className="min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 p-2 lg:p-1 inline-flex items-center justify-center text-accent-pink active:scale-[0.98]"
                                aria-label={`Ask about ${source.name}`}
                                title="Ask Interactor"
                            >
                                <InteractorAskIcon />
                            </button>
                            {source.url && (
                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        track('news_link_clicked', { title: source.name, url: source.url, from: 'icon' });
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
                {NEWS_SOURCES.length > PREVIEW_COUNT && (
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
