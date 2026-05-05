'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Panel } from './TerminalBlock';
import type { AcceleratorEntry } from '../lib/googleSheets';
import { track } from '@vercel/analytics';
import { Favicon } from './Favicon';
import { askInteractor } from '../lib/interactor';
import { ExpandIcon } from './ExpandIcon';
import { InteractorAskIcon } from './InteractorAskIcon';

const PREVIEW_COUNT = 5;

export function AcceleratorsRegistry({ 
    initialData = [], 
    loading = false,
    expanded = false 
}: { 
    initialData?: AcceleratorEntry[],
    loading?: boolean,
    expanded?: boolean
}) {
    const accelerators = initialData;
    const isActuallyLoading = loading || (accelerators.length === 0 && !loading);
    const [showAll, setShowAll] = useState(false);

    const visible = expanded || showAll ? accelerators : accelerators.slice(0, PREVIEW_COUNT);
    const remaining = accelerators.length - PREVIEW_COUNT;

    const handleRowClick = (entry: AcceleratorEntry) => {
        if (!entry.website) return;
        track('directory_link_clicked', { category: 'Accelerators', title: entry.name, url: entry.website, from: 'row' });
        window.open(entry.website, '_blank', 'noopener,noreferrer');
    };

    const handleAskClick = (e: React.MouseEvent, entry: AcceleratorEntry) => {
        e.stopPropagation();
        track('directory_row_clicked', { category: 'Accelerators', title: entry.name, from: 'ask_button' });
        askInteractor(`Tell me about ${entry.name}`);
    };

    const action = !expanded && (
        <Link
            href="/accelerators"
            className="w-8 h-8 rounded-lg text-fg-muted hover:text-accent-pink hover:bg-bg-hover transition-colors duration-150 shrink-0 border border-bg-border inline-flex items-center justify-center"
            title="Expand"
            aria-label="Expand accelerators"
        >
            <ExpandIcon />
        </Link>
    );

    const globeIcon = (url: string, name: string) => (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
                e.stopPropagation();
                track('directory_link_clicked', { category: 'Accelerators', title: name, url });
            }}
            className="inline-flex items-center justify-center min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 p-2 lg:p-0 text-fg-muted hover:text-accent-blue"
            title="Website"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z" />
            </svg>
        </a>
    );

    return (
        <Panel 
            title="Accelerators" 
            subtitle={isActuallyLoading ? '...' : `${accelerators.length}`} 
            noPadding 
            action={action || undefined}
            className={expanded ? "h-full" : ""}
        >
            <div className={isActuallyLoading ? 'opacity-50 pointer-events-none' : ''}>
                {expanded ? (
                    <div className="overflow-auto flex-1 min-h-0">
                        <table className="w-full text-sm table-fixed">
                            <thead className="sticky top-0 z-10 bg-bg-card">
                                <tr className="border-b border-bg-border">
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider w-[40%] sm:w-[35%] lg:w-[40%]">Name</th>
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider w-[25%] hidden lg:table-cell">Note</th>
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider w-[20%] hidden sm:table-cell">Check</th>
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider w-[40%] sm:w-[25%] lg:w-[15%]">Stage</th>
                                    <th className="w-10" />
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((a, i) => (
                                    <tr
                                        key={i}
                                        onClick={() => handleRowClick(a)}
                                        className={`border-b border-bg-border-subtle last:border-b-0 transition-colors duration-100 group ${a.website ? 'cursor-pointer hover:bg-bg-hover' : ''}`}
                                    >
                                        <td className="py-3 px-5 font-medium text-fg-primary">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {a.website && <Favicon url={a.website} />}
                                                <span className={`truncate transition-colors ${a.website ? 'group-hover:text-accent-blue' : ''}`}>
                                                    {a.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-5 text-fg-muted text-[13px] truncate hidden lg:table-cell">
                                            {a.note || '—'}
                                        </td>
                                        <td className="py-3 px-5 text-fg-secondary text-[13px] truncate hidden sm:table-cell">
                                            {a.checkSize || '—'}
                                        </td>
                                        <td className="py-3 px-5 text-fg-secondary text-[13px] truncate">
                                            {a.stage || '—'}
                                        </td>
                                        <td className="py-3 px-2 text-center w-24 lg:w-10">
                                            <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150">
                                                <button
                                                    onClick={(e) => handleAskClick(e, a)}
                                                    className="min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 p-2 lg:p-1 inline-flex items-center justify-center text-accent-pink active:scale-[0.98]"
                                                    aria-label={`Ask about ${a.name}`}
                                                    title="Ask Interactor"
                                                >
                                                    <InteractorAskIcon />
                                                </button>
                                                {a.website && globeIcon(a.website, a.name)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div>
                        {visible.map((a, i) => (
                            <div
                                key={i}
                                onClick={() => handleRowClick(a)}
                                className={`flex items-center justify-between px-5 py-3 border-b border-bg-border-subtle last:border-b-0 transition-colors duration-100 group ${a.website ? 'cursor-pointer hover:bg-bg-hover' : ''}`}
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {a.website && <Favicon url={a.website} />}
                                    <div className="flex min-w-0 flex-1 flex-col min-[480px]:flex-row min-[480px]:items-baseline min-[480px]:gap-2">
                                        <span className={`text-sm font-medium text-fg-primary transition-colors truncate ${a.website ? 'group-hover:text-accent-blue' : ''}`}>
                                            {a.name}
                                        </span>
                                        {(a.stage || a.checkSize) && (
                                            <span className="text-xs text-fg-muted truncate min-w-0 opacity-80">
                                                {[a.stage, a.checkSize].filter(Boolean).join(' · ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleAskClick(e, a)}
                                        className="min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 p-2 lg:p-1 inline-flex items-center justify-center text-accent-pink active:scale-[0.98]"
                                        aria-label={`Ask about ${a.name}`}
                                        title="Ask Interactor"
                                    >
                                        <InteractorAskIcon />
                                    </button>
                                    {a.website && globeIcon(a.website, a.name)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!expanded && accelerators.length > PREVIEW_COUNT && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full px-5 py-2.5 text-[11px] font-medium text-fg-muted hover:text-accent-pink transition-colors duration-150 text-center border-t border-bg-border-subtle"
                    >
                        {showAll ? '↑ Show less' : `↓ ${remaining} more`}
                    </button>
                )}
            </div>
        </Panel>
    );
}
