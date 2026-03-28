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

    return (
        <Panel 
            title="Accelerators" 
            subtitle={isActuallyLoading ? '...' : `${accelerators.length}`} 
            noPadding 
            action={action || undefined}
            className={expanded ? "h-full" : ""}
        >
            <div className={isActuallyLoading ? 'opacity-50 pointer-events-none' : ''}>
                <div className="overflow-auto flex-1 min-h-0">
                    <table className="w-full text-sm table-fixed">
                        <thead>
                            <tr className="border-b border-bg-border bg-bg-card/50">
                                <th className="sticky top-0 z-10 bg-bg-card text-left py-2 px-5 text-[10px] font-bold text-fg-muted uppercase tracking-wider w-[40%]">Name</th>
                                <th className="sticky top-0 z-10 bg-bg-card text-left py-2 px-5 text-[10px] font-bold text-fg-muted uppercase tracking-wider w-[30%]">Stage</th>
                                {expanded && (
                                    <>
                                        <th className="sticky top-0 z-10 bg-bg-card text-left py-2 px-5 text-[10px] font-bold text-fg-muted uppercase tracking-wider w-[15%]">Check Size</th>
                                        <th className="sticky top-0 z-10 bg-bg-card text-left py-2 px-5 text-[10px] font-bold text-fg-muted uppercase tracking-wider w-[15%]">Note</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((a, i) => (
                                <tr
                                    key={i}
                                    onClick={() => handleRowClick(a)}
                                    className="border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                                >
                                    <td className="py-3 px-5 truncate">
                                        <div className="flex items-center gap-2">
                                            {a.website && <Favicon url={a.website} />}
                                            <span className="font-medium text-fg-primary group-hover:text-accent-pink transition-colors truncate">
                                                {a.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 text-fg-secondary truncate">
                                        {a.stage || '—'}
                                    </td>
                                    {expanded && (
                                        <>
                                            <td className="py-3 px-5 text-fg-secondary truncate">
                                                {a.checkSize || '—'}
                                            </td>
                                            <td className="py-3 px-5 text-fg-secondary truncate">
                                                {a.note || '—'}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
