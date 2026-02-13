import { useEffect, useState, useMemo } from 'react';
import { Panel } from './TerminalBlock';
import { parseCSV, type CapitalEntry } from '../lib/googleSheets';

const SHEET_CSV_URL =
    'https://docs.google.com/spreadsheets/d/1hqKbGMHKT3pbgFRLKVWcJ7xgInwe6FLwYaMn1uld_Pg/export?format=csv';

const STAGES = ['All', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'] as const;

export function CapitalIndex({ expanded = false }: { expanded?: boolean }) {
    const [data, setData] = useState<CapitalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('All');

    const fetchData = async () => {
        try {
            const res = await fetch(SHEET_CSV_URL);
            const text = await res.text();
            setData(parseCSV(text));
        } catch (err) {
            console.error('Failed to fetch capital data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60_000);
        return () => clearInterval(interval);
    }, []);

    const filtered = useMemo(() => {
        let result = data;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                e =>
                    e.name.toLowerCase().includes(q) ||
                    e.type.toLowerCase().includes(q) ||
                    e.focus.toLowerCase().includes(q) ||
                    e.location.toLowerCase().includes(q) ||
                    e.contact.toLowerCase().includes(q)
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
            `Tell me more about ${entry.name}. What do they invest in and what's their typical process?`
        );
    };

    const count = filtered.length;

    return (
        <Panel
            title="Capital"
            subtitle={loading ? '...' : `${count} entries`}
            className="h-full"
            noPadding
            action={
                <div className="flex gap-1.5">
                    {STAGES.map(s => (
                        <button
                            key={s}
                            onClick={() => setStageFilter(s)}
                            className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all duration-150 ${stageFilter === s
                                    ? 'bg-accent-pink/12 text-accent-pink'
                                    : 'text-fg-muted hover:text-fg-secondary hover:bg-bg-hover'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            }
        >
            {/* Search */}
            <div className="px-5 py-3 border-b border-bg-border">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search investors..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-bg-elevated border-none text-sm text-fg-primary placeholder:text-fg-muted pl-10 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-accent-pink/30 rounded-lg font-sans transition-shadow"
                    />
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
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-bg-card">
                            <tr className="border-b border-bg-border">
                                <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider">Name</th>
                                <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider">Stage</th>
                                <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider">Check Size</th>
                                {expanded && (
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider">Type</th>
                                )}
                                <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider">Focus</th>
                                {expanded && (
                                    <th className="text-left py-3 px-5 text-[11px] font-semibold text-fg-muted uppercase tracking-wider">Location</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((entry, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => handleRowClick(entry)}
                                    className="border-b border-bg-border/50 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                                >
                                    <td className="py-3 px-5 font-medium text-fg-primary group-hover:text-accent-pink transition-colors whitespace-nowrap">
                                        {entry.topTen && (
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-green mr-2 align-middle" />
                                        )}
                                        {entry.name}
                                    </td>
                                    <td className="py-3 px-5 text-fg-secondary text-[13px]">{entry.stage || '—'}</td>
                                    <td className="py-3 px-5 text-fg-secondary text-[13px] tabular-nums">{entry.checkSize || '—'}</td>
                                    {expanded && (
                                        <td className="py-3 px-5 text-fg-secondary text-[13px]">{entry.type || '—'}</td>
                                    )}
                                    <td className="py-3 px-5 text-fg-muted text-[13px] truncate max-w-[220px]">{entry.focus || '—'}</td>
                                    {expanded && (
                                        <td className="py-3 px-5 text-fg-muted text-[13px] truncate max-w-[180px]">{entry.location || '—'}</td>
                                    )}
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={expanded ? 6 : 4} className="py-12 text-center text-fg-muted text-sm">
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
