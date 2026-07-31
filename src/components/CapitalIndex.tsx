'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Panel } from './TerminalBlock';
import { type CapitalEntry } from '../lib/googleSheets';
import { Favicon } from './Favicon';
import { track } from '@vercel/analytics';
import { askInteractor } from '../lib/interactor';
import { ExpandIcon } from './ExpandIcon';
import { InteractorAskIcon } from './InteractorAskIcon';

const STAGES = ['All', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'] as const;
const PREVIEW_COUNT = 12;

function getCapitalMeta(entry: CapitalEntry) {
    return [entry.stage, entry.checkSize, entry.type || entry.focus]
        .filter(Boolean)
        .join(' · ');
}

interface CapitalIndexProps {
    data: CapitalEntry[];
    loading: boolean;
    expanded?: boolean;
}

export function CapitalIndex({ data, loading, expanded = false }: CapitalIndexProps) {
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('All');
    const [showAll, setShowAll] = useState(false);

    const filtered = useMemo(() => {
        let result = data;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                e =>
                    e.name.toLowerCase().includes(q) ||
                    e.type.toLowerCase().includes(q) ||
                    e.stage.toLowerCase().includes(q) ||
                    e.focus.toLowerCase().includes(q) ||
                    e.location.toLowerCase().includes(q) ||
                    e.contact.toLowerCase().includes(q) ||
                    e.description.toLowerCase().includes(q)
            );
        }
        if (stageFilter !== 'All') {
            result = result.filter(e =>
                e.stage.toLowerCase().includes(stageFilter.toLowerCase())
            );
        }
        return result;
    }, [data, search, stageFilter]);

    const visible = expanded || showAll ? filtered : filtered.slice(0, PREVIEW_COUNT);
    const remaining = filtered.length - PREVIEW_COUNT;

    const handleRowClick = (entry: CapitalEntry) => {
        if (!entry.website) return;
        track('vc_link_clicked', { vc_name: entry.name, url: entry.website, from: 'row' });
        window.open(entry.website, '_blank', 'noopener,noreferrer');
    };

    const handleAskClick = (e: React.MouseEvent, entry: CapitalEntry) => {
        e.stopPropagation();
        track('vc_row_clicked', { vc_name: entry.name, from: 'ask_button' });
        askInteractor(`Tell me about ${entry.name}`);
    };

    return (
        <Panel
            title="Capital"
            className={`capital-panel ${expanded ? 'h-full' : ''}`}
            noPadding
            action={
                <div className="capital-filter-bar flex w-full min-w-0 items-center justify-end gap-1 sm:gap-2">
                    <div className="capital-stage-filters flex min-w-0 gap-1 overflow-x-auto no-scrollbar py-1 sm:gap-1.5">
                        {STAGES.map(s => (
                            <button
                                key={s}
                                onClick={() => setStageFilter(s)}
                                className={`inline-flex h-8 items-center rounded-md px-2 text-[10px] transition-colors duration-150 whitespace-nowrap sm:px-2.5 sm:text-[11px] ${stageFilter === s
                                    ? 'bg-bg-hover/30 text-fg-primary'
                                    : 'text-fg-muted hover:text-fg-secondary hover:bg-bg-hover'
                                    }`}
                                aria-pressed={stageFilter === s}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    {!expanded && (
                        <Link
                            href="/capital"
                            className="w-8 h-8 rounded-lg text-fg-muted hover:text-accent-pink hover:bg-bg-hover transition-colors duration-150 shrink-0 border border-bg-border ml-1 inline-flex items-center justify-center"
                            title="Expand"
                            aria-label="Expand capital"
                        >
                            <ExpandIcon />
                        </Link>
                    )}
                </div>
            }
        >
            {/* Search */}
            <div className={`${expanded ? 'px-5 py-3' : 'px-5 py-3'} border-b border-bg-border shrink-0`}>
                <div className="flex items-center rounded-md bg-bg-hover/45 transition-colors">
                    <div className="pl-3 flex items-center justify-center pointer-events-none">
                        <svg className="w-3.5 h-3.5 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder={loading ? 'Search investors...' : `Search ${data.length} investors...`}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`capital-search-input peer w-full bg-transparent border-none text-fg-primary placeholder:text-fg-muted/80 pl-2.5 pr-2 outline-none font-sans ${expanded ? 'text-sm py-2' : 'text-[13px] py-2'}`}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="pr-3 pl-1 flex items-center justify-center text-fg-muted hover:text-fg-primary transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="p-5 space-y-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-8 bg-bg-elevated rounded animate-pulse" style={{ opacity: 1 - i * 0.08 }} />
                    ))}
                </div>
            ) : (
                <div className={expanded ? 'overflow-auto flex-1 min-h-0' : ''}>
                    <table className="w-full text-sm table-fixed">
                        <thead className={`sticky top-0 z-10 bg-bg-card ${expanded ? 'hidden lg:table-header-group' : 'hidden xl:table-header-group'}`}>
                            <tr className="border-b border-bg-border">
                                <th className={`text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider ${expanded ? 'w-auto lg:w-[25%]' : 'w-auto'}`}>Name</th>
                                <th className={`text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider ${expanded ? 'hidden lg:table-cell lg:w-[15%]' : 'hidden xl:table-cell w-[25%]'}`}>Stage</th>
                                <th className={`text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider ${expanded ? 'hidden lg:table-cell lg:w-[15%]' : 'hidden xl:table-cell w-[30%]'}`}>Check</th>
                                {expanded && (
                                    <>
                                        <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider hidden xl:table-cell lg:w-[15%]">Type</th>
                                        <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider hidden xl:table-cell w-[20%]">Focus</th>
                                        <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider hidden xl:table-cell w-[10%]">Location</th>
                                    </>
                                )}
                                <th className="w-24 lg:w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((entry, idx) => {
                                const meta = getCapitalMeta(entry);
                                return (
                                <tr
                                    key={idx}
                                    onClick={() => handleRowClick(entry)}
                                    className={`border-b border-bg-border-subtle transition-colors duration-100 group ${entry.website ? 'cursor-pointer hover:bg-bg-hover' : ''}`}
                                >
                                    <td className="py-3 px-5 font-medium text-fg-primary transition-colors">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {entry.topTen && (
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-green shrink-0" />
                                            )}
                                            {entry.website && <Favicon url={entry.website} />}
                                            <span className="min-w-0 flex-1">
                                                <span className={`block truncate transition-colors ${entry.website ? 'group-hover:text-accent-blue' : ''}`}>{entry.name}</span>
                                                {meta && (
                                                    <span className="mt-0.5 block truncate text-xs font-normal text-fg-muted xl:hidden">
                                                        {meta}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={`py-3 px-5 text-fg-secondary text-[13px] truncate ${expanded ? 'hidden lg:table-cell' : 'hidden xl:table-cell'}`}>{entry.stage || '—'}</td>
                                    <td className={`py-3 px-5 text-fg-secondary text-[13px] tabular-nums truncate ${expanded ? 'hidden lg:table-cell' : 'hidden xl:table-cell'}`}>{entry.checkSize || '—'}</td>
                                    {expanded && (
                                        <>
                                            <td className="py-3 px-5 text-fg-secondary text-[13px] truncate hidden xl:table-cell">{entry.type || '—'}</td>
                                            <td className="py-3 px-5 text-fg-muted text-[13px] truncate hidden xl:table-cell">{entry.focus || '—'}</td>
                                            <td className="py-3 px-5 text-fg-muted text-[13px] truncate hidden xl:table-cell">{entry.location || '—'}</td>
                                        </>
                                    )}
                                    <td className="py-3 px-2 text-center w-24 lg:w-16">
                                        <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150">
                                            <button
                                                onClick={(e) => handleAskClick(e, entry)}
                                                className="min-h-9 min-w-9 lg:min-h-7 lg:min-w-7 p-2 lg:p-1 inline-flex shrink-0 items-center justify-center text-accent-pink active:scale-[0.98]"
                                                aria-label={`Ask about ${entry.name}`}
                                                title="Ask Interactor"
                                            >
                                                <InteractorAskIcon />
                                            </button>
                                            {entry.website && (
                                                <a
                                                    href={entry.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        track('vc_link_clicked', { vc_name: entry.name, url: entry.website || '' });
                                                    }}
                                                    className="inline-flex min-h-9 min-w-9 lg:min-h-7 lg:min-w-7 shrink-0 items-center justify-center p-2 lg:p-1 text-fg-muted hover:text-accent-blue"
                                                >
                                                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={expanded ? 7 : 5} className="py-12 text-center text-fg-muted text-sm">
                                        No results found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {!expanded && filtered.length > PREVIEW_COUNT && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="w-full px-5 py-2.5 text-[11px] font-medium text-fg-muted hover:text-accent-pink transition-colors duration-150 text-center border-t border-bg-border-subtle"
                        >
                            {showAll ? '↑ Show less' : `↓ ${remaining} more`}
                        </button>
                    )}
                </div>
            )}
        </Panel>
    );
}
