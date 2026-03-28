'use client';
import { useState } from 'react';
import { Panel } from './TerminalBlock';
import type { AcceleratorEntry } from '../lib/googleSheets';
import { track } from '@vercel/analytics';
import { Favicon } from './Favicon';

const PREVIEW_COUNT = 5;

export function AcceleratorsRegistry({ initialData = [] }: { initialData?: AcceleratorEntry[] }) {
    const accelerators = initialData;
    const loading = accelerators.length === 0;
    const [expanded, setExpanded] = useState(false);

    const visible = expanded ? accelerators : accelerators.slice(0, PREVIEW_COUNT);
    const remaining = accelerators.length - PREVIEW_COUNT;

    const handleRowClick = (entry: AcceleratorEntry) => {
        track('directory_row_clicked', { category: 'Accelerators', title: entry.name });
        window.interactor?.message.send(`Tell me about ${entry.name}`);
    };

    return (
        <Panel title="Accelerators" subtitle={loading ? '...' : `${accelerators.length}`} noPadding>
            <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm table-fixed">
                        <thead>
                            <tr className="border-b border-bg-border bg-bg-card/50">
                                <th className="text-left py-2 px-5 text-[10px] font-bold text-fg-muted uppercase tracking-wider w-[40%]">Name</th>
                                <th className="text-left py-2 px-5 text-[10px] font-bold text-fg-muted uppercase tracking-wider w-[30%]">Stage</th>
                                {expanded && (
                                    <>
                                        <th className="text-left py-2 px-5 text-[10px] font-bold text-fg-muted uppercase tracking-wider w-[30%]">Check Size</th>
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
                                        <td className="py-3 px-5 text-fg-secondary truncate">
                                            {a.checkSize || '—'}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {accelerators.length > PREVIEW_COUNT && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full px-5 py-2.5 text-[11px] font-medium text-fg-muted hover:text-accent-pink transition-colors duration-150 text-center border-t border-bg-border-subtle"
                    >
                        {expanded ? '↑ Show less' : `↓ ${remaining} more`}
                    </button>
                )}
            </div>
        </Panel>
    );
}
