'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Panel } from './TerminalBlock';
import type { AcceleratorEntry } from '../lib/googleSheets';
import { track } from '@vercel/analytics';
import { Favicon } from './Favicon';

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
        track('directory_row_clicked', { category: 'Accelerators', title: entry.name });
        window.interactor?.message.send(`Tell me about ${entry.name}`);
    };

    const action = !expanded && (
        <Link
            href="/accelerators"
            className="p-1.5 rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-hover transition-all duration-150 shrink-0 text-base leading-none border border-bg-border inline-flex items-center justify-center"
            title="Expand"
        >
            ↗
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
            className="inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-fg-muted hover:text-accent-blue"
            title="Website"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider w-[40%]">Name</th>
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider w-[25%]">Note</th>
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider w-[15%]">Check</th>
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider w-[15%]">Stage</th>
                                    <th className="w-10" />
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((a, i) => (
                                    <tr
                                        key={i}
                                        onClick={() => handleRowClick(a)}
                                        className="border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                                    >
                                        <td className="py-3 px-5 font-medium text-fg-primary">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {a.website && <Favicon url={a.website} />}
                                                <span className="truncate group-hover:text-accent-pink transition-colors truncate">
                                                    {a.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-5 text-fg-muted text-[13px] truncate">
                                            {a.note || '—'}
                                        </td>
                                        <td className="py-3 px-5 text-fg-secondary text-[13px] truncate">
                                            {a.checkSize || '—'}
                                        </td>
                                        <td className="py-3 px-5 text-fg-secondary text-[13px] truncate">
                                            {a.stage || '—'}
                                        </td>
                                        <td className="py-3 px-2 text-center w-10">
                                            {a.website && globeIcon(a.website, a.name)}
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
                                className="flex items-center justify-between px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    {a.website && <Favicon url={a.website} />}
                                    <div className="flex items-baseline gap-2 min-w-0">
                                        <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors truncate">
                                            {a.name}
                                        </span>
                                        <span className="text-xs text-fg-muted truncate">{a.stage}</span>
                                    </div>
                                </div>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
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
