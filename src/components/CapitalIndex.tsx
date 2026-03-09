import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel } from './TerminalBlock';
import { type CapitalEntry } from '../lib/googleSheets';
import { Favicon } from './Favicon';

const STAGES = ['All', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'] as const;

interface CapitalIndexProps {
    data: CapitalEntry[];
    loading: boolean;
    expanded?: boolean;
}

export function CapitalIndex({ data, loading, expanded = false }: CapitalIndexProps) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('All');
    const [activeIndex, setActiveIndex] = useState<number>(-1);
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

    const handleRowClick = (entry: CapitalEntry) => {
        window.interactor?.message.send(
            `Tell me about ${entry.name}`
        );
    };

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (filtered.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => {
                const next = Math.min(prev + 1, filtered.length - 1);
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
            if (activeIndex >= 0 && activeIndex < filtered.length) {
                handleRowClick(filtered[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setSearch('');
            setActiveIndex(-1);
        }
    }, [filtered, activeIndex, handleRowClick]);

    return (
        <Panel
            title="Capital"
            className="h-full"
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
                        <button
                            onClick={() => navigate('/capital')}
                            className="p-1.5 rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-hover transition-all duration-150 shrink-0 text-base leading-none border border-bg-border ml-1"
                            title="Expand"
                        >
                            ↗
                        </button>
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
                <div className="overflow-auto flex-1 min-h-0">
                    <table className="w-full text-sm table-fixed">
                        <thead className="sticky top-0 z-10 bg-bg-card">
                            <tr className="border-b border-bg-border">
                                <th className={`text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider ${expanded ? 'w-[25%]' : 'w-[50%] sm:w-[40%]'}`}>Name</th>
                                <th className={`text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider ${expanded ? 'w-[20%]' : 'w-[30%] sm:w-[25%]'}`}>Stage</th>
                                <th className={`text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider hidden sm:table-cell ${expanded ? 'w-[15%]' : 'w-[25%]'}`}>Check</th>
                                {expanded && (
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider w-[12%] hidden md:table-cell">Type</th>
                                )}
                                <th className={`text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider hidden ${expanded ? 'md:table-cell' : 'xl:table-cell'}`}>Focus</th>
                                {expanded && (
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider w-[14%] hidden lg:table-cell">Location</th>
                                )}
                                <th className="w-10" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((entry, idx) => (
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
                                    <td className="py-3 px-5 text-fg-secondary text-[13px] truncate">{entry.stage || '—'}</td>
                                    <td className="py-3 px-5 text-fg-secondary text-[13px] tabular-nums truncate hidden sm:table-cell">{entry.checkSize || '—'}</td>
                                    {expanded && (
                                        <td className="py-3 px-5 text-fg-secondary text-[13px] truncate hidden md:table-cell">{entry.type || '—'}</td>
                                    )}
                                    <td className={`py-3 px-5 text-fg-muted text-[13px] truncate hidden ${expanded ? 'md:table-cell' : 'xl:table-cell'}`}>{entry.focus || '—'}</td>
                                    {expanded && (
                                        <td className="py-3 px-5 text-fg-muted text-[13px] truncate hidden lg:table-cell">{entry.location || '—'}</td>
                                    )}
                                    <td className="py-3 px-2 text-center w-10">
                                        {entry.website && (
                                            <a
                                                href={entry.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-fg-muted hover:text-accent-blue"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z" />
                                                </svg>
                                            </a>
                                        )}
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
                </div>
            )}
        </Panel>
    );
}
