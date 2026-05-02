'use client';
import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Panel } from './TerminalBlock';
import { type CapitalEntry } from '../lib/googleSheets';
import { Favicon } from './Favicon';
import { track } from '@vercel/analytics';
import { askInteractor, usesExplicitTouchActions } from '../lib/interactor';
import { ExpandIcon } from './ExpandIcon';
import { InteractorAskIcon } from './InteractorAskIcon';

const STAGES = ['All', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'] as const;
const PREVIEW_COUNT = 12;

interface CapitalIndexProps {
    data: CapitalEntry[];
    loading: boolean;
    expanded?: boolean;
}

export function CapitalIndex({ data, loading, expanded = false }: CapitalIndexProps) {
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('All');
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [showAll, setShowAll] = useState(false);
    const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

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
        if (usesExplicitTouchActions()) return;
        track('vc_row_clicked', { vc_name: entry.name });
        askInteractor(`Tell me about ${entry.name}`);
    };

    const handleAskClick = (e: React.MouseEvent, entry: CapitalEntry) => {
        e.stopPropagation();
        track('vc_row_clicked', { vc_name: entry.name, from: 'ask_button' });
        askInteractor(`Tell me about ${entry.name}`);
    };

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (visible.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => {
                const next = Math.min(prev + 1, visible.length - 1);
                rowRefs.current[next]?.scrollIntoView({ block: 'nearest' });
                return next;
            });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => {
                const next = Math.max(prev - 1, 0);
                rowRefs.current[next]?.scrollIntoView({ block: 'nearest' });
                return next;
            });
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && activeIndex < visible.length) {
                handleRowClick(visible[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setSearch('');
            setActiveIndex(-1);
        }
    }, [visible, activeIndex, handleRowClick]);

    return (
        <Panel
            title="Capital"
            className={expanded ? 'h-full' : ''}
            noPadding
            action={
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                        {STAGES.map(s => (
                            <button
                                key={s}
                                onClick={() => setStageFilter(s)}
                                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all duration-150 whitespace-nowrap ${stageFilter === s
                                    ? 'bg-accent-pink-alpha text-accent-pink'
                                    : 'text-fg-muted hover:text-fg-secondary hover:bg-bg-hover'
                                    }`}
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
            <div className="px-5 py-3 border-b border-bg-border shrink-0">
                <div className="flex items-center bg-bg-elevated rounded-lg focus-within:ring-1 focus-within:ring-accent-pink/30 transition-shadow">
                    <div className="pl-3 flex items-center justify-center pointer-events-none">
                        <svg className="w-4 h-4 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder={loading ? 'Search investors...' : `Search ${data.length} investors...`}
                        value={search}
                        onChange={e => { setSearch(e.target.value); setActiveIndex(-1); }}
                        onKeyDown={handleKeyDown}
                        className="peer w-full bg-transparent border-none text-base text-fg-primary placeholder:text-fg-muted pl-3 pr-2 py-2 outline-none font-sans"
                    />
                    <div className="hidden md:flex items-center gap-0.5 pr-2 pointer-events-none text-fg-muted opacity-0 peer-focus:opacity-50 transition-opacity duration-200">
                        <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 h-5 text-[10px] font-sans font-medium bg-bg-card border border-bg-border rounded shadow-[0_1px_0_rgba(255,255,255,0.1)_inset]">↑</kbd>
                        <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 h-5 text-[10px] font-sans font-medium bg-bg-card border border-bg-border rounded shadow-[0_1px_0_rgba(255,255,255,0.1)_inset]">↓</kbd>
                    </div>
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
                        <thead className="sticky top-0 z-10 bg-bg-card">
                            <tr className="border-b border-bg-border">
                                <th className={`text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider ${expanded ? 'w-auto lg:w-[25%]' : 'w-auto'}`}>Name</th>
                                <th className={`text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider hidden lg:table-cell ${expanded ? 'lg:w-[15%]' : 'w-[25%]'}`}>Stage</th>
                                <th className={`text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider hidden lg:table-cell ${expanded ? 'lg:w-[15%]' : 'w-[30%]'}`}>Check</th>
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
                            {visible.map((entry, idx) => (
                                <tr
                                    key={idx}
                                    ref={el => { rowRefs.current[idx] = el; }}
                                    onClick={() => { setActiveIndex(idx); handleRowClick(entry); }}
                                    className={`border-b border-bg-border-subtle cursor-pointer transition-colors duration-100 group ${activeIndex === idx
                                        ? 'bg-accent-pink/10'
                                        : 'hover:bg-bg-hover'
                                        }`}
                                >
                                    <td className={`py-3 px-5 font-medium transition-colors ${activeIndex === idx ? 'text-accent-pink' : 'text-fg-primary'}`}>
                                        <div className="flex items-center gap-2 min-w-0">
                                            {entry.topTen && (
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-green shrink-0" />
                                            )}
                                            {entry.website && <Favicon url={entry.website} />}
                                            <span className="truncate group-hover:text-accent-pink transition-colors">{entry.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-5 text-fg-secondary text-[13px] truncate hidden lg:table-cell">{entry.stage || '—'}</td>
                                    <td className="py-3 px-5 text-fg-secondary text-[13px] tabular-nums truncate hidden lg:table-cell">{entry.checkSize || '—'}</td>
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
                            ))}
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
