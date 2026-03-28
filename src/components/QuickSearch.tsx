'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSpacesData } from '../hooks/useSheetData';
import { useCommunitiesData } from '../hooks/useSheetData';
import { useConferencesData } from '../hooks/useSheetData';
import { useAmbassadorsData } from '../hooks/useSheetData';
import { useCapitalData } from '../hooks/useSheetData';
import { useAcceleratorsData } from '../hooks/useSheetData';
import { Favicon } from './Favicon';
import { track } from '@vercel/analytics';

interface SearchResult {
    name: string;
    section: string;
    sectionColor: string;
    url?: string;
    onRowClick: () => void;
}

function buildResults(
    query: string,
    spaces: ReturnType<typeof useSpacesData>['data'],
    communities: ReturnType<typeof useCommunitiesData>['data'],
    conferences: ReturnType<typeof useConferencesData>['data'],
    ambassadors: ReturnType<typeof useAmbassadorsData>['data'],
    capital: ReturnType<typeof useCapitalData>['data'],
    accelerators: ReturnType<typeof useAcceleratorsData>['data'],
): SearchResult[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const results: SearchResult[] = [];

    spaces.filter(s => s.name.toLowerCase().includes(q) || s.location?.toLowerCase().includes(q)).forEach(s => {
        results.push({
            name: s.name,
            section: 'Spaces',
            sectionColor: 'text-accent-blue',
            url: s.url || undefined,
            onRowClick: () => window.interactor?.message.send(`Tell me about ${s.name}`),
        });
    });

    communities.filter(c => c.name.toLowerCase().includes(q)).forEach(c => {
        results.push({
            name: c.name,
            section: 'Communities',
            sectionColor: 'text-accent-green',
            url: c.url || undefined,
            onRowClick: () => window.interactor?.message.send(`Tell me about the ${c.name} community`),
        });
    });

    conferences.filter(c => c.name.toLowerCase().includes(q)).forEach(c => {
        results.push({
            name: c.name,
            section: 'Conferences',
            sectionColor: 'text-accent-pink',
            url: c.website || undefined,
            onRowClick: () => window.interactor?.message.send(`Tell me about ${c.name}`),
        });
    });

    ambassadors.filter(a => a.name.toLowerCase().includes(q)).forEach(a => {
        results.push({
            name: a.name,
            section: 'Ambassadors',
            sectionColor: 'text-yellow-400',
            url: a.linkedin || a.twitter || undefined,
            onRowClick: () => window.interactor?.message.send(`Tell me about ${a.name}`),
        });
    });

    capital.filter(c => c.name.toLowerCase().includes(q) || c.type?.toLowerCase().includes(q)).forEach(c => {
        results.push({
            name: c.name,
            section: 'Capital',
            sectionColor: 'text-purple-400',
            url: c.website || undefined,
            onRowClick: () => window.interactor?.message.send(`Tell me about ${c.name}`),
        });
    });
    
    accelerators.filter(a => a.name.toLowerCase().includes(q) || a.stage?.toLowerCase().includes(q)).forEach(a => {
        results.push({
            name: a.name,
            section: 'Accelerators',
            sectionColor: 'text-accent-pink',
            url: a.website || undefined,
            onRowClick: () => window.interactor?.message.send(`Tell me about ${a.name}`),
        });
    });

    return results.slice(0, 12);
}

export function QuickSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: spaces } = useSpacesData();
    const { data: communities } = useCommunitiesData();
    const { data: conferences } = useConferencesData();
    const { data: ambassadors } = useAmbassadorsData();
    const { data: capital } = useCapitalData();
    const { data: accelerators } = useAcceleratorsData();

    const results = buildResults(query, spaces, communities, conferences, ambassadors, capital, accelerators);

    const close = useCallback(() => {
        setOpen(false);
        setQuery('');
        setActiveIdx(0);
    }, []);

    // Global keyboard shortcut: Cmd+J / Ctrl+J
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
                e.preventDefault();
                setOpen(prev => {
                    const next = !prev;
                    if (next) {
                        track('search_opened', { from: 'shortcut' });
                        setActiveIdx(0);
                    }
                    return next;
                });
            }
            if (e.key === 'Escape') close();
        };
        const handleCustomOpen = () => {
            track('search_opened', { from: 'event' });
            setOpen(true);
            setActiveIdx(0);
        };
        window.addEventListener('keydown', handler);
        window.addEventListener('openQuickSearch', handleCustomOpen);
        return () => {
            window.removeEventListener('keydown', handler);
            window.removeEventListener('openQuickSearch', handleCustomOpen);
        };
    }, [close]);

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Reset active index when results change
    useEffect(() => {
        setActiveIdx(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[activeIdx]) {
                results[activeIdx].onRowClick();
                close();
            }
        }
    };

    const handleRowClick = (result: SearchResult) => {
        track('search_result_clicked', {
            title: result.name,
            category: result.section,
            url: result.url || ''
        });
        result.onRowClick();
        close();
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
            onClick={close}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-xl mx-4 bg-bg-card border border-bg-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: '60vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-bg-border">
                    <svg className="w-4 h-4 text-fg-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="11" cy="11" r="8" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Find a resource…"
                        className="flex-1 bg-transparent text-fg-primary text-sm focus:outline-none placeholder:text-fg-muted"
                    />
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-fg-muted bg-bg-elevated border border-bg-border rounded">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto">
                    {query.trim() === '' ? (
                        <div className="px-4 py-8 text-center text-sm text-fg-muted">
                            Type to search across Spaces, Communities, Capital…
                        </div>
                    ) : results.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-fg-muted">
                            No results for <span className="text-fg-secondary">"{query}"</span>
                        </div>
                    ) : (
                        <div>
                            {results.map((result, idx) => (
                                <div
                                    key={`${result.section}-${result.name}`}
                                    onClick={() => handleRowClick(result)}
                                    className={`flex items-center justify-between px-4 py-2.5 border-b border-bg-border-subtle last:border-b-0 cursor-pointer transition-colors duration-75 group ${idx === activeIdx ? 'bg-bg-hover' : 'hover:bg-bg-hover'
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {result.url && <Favicon url={result.url} />}
                                        <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors truncate">
                                            {result.name}
                                        </span>
                                        <span className={`text-[11px] font-medium ${result.sectionColor} shrink-0`}>
                                            {result.section}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {result.url && (
                                            <a
                                                href={result.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="p-1 text-fg-muted/50 hover:text-accent-blue transition-colors"
                                                title="Open URL"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                {results.length > 0 && (
                    <div className="px-4 py-2 border-t border-bg-border flex items-center gap-3 text-[11px] text-fg-muted bg-bg-elevated/50">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 py-0.5 bg-bg-card border border-bg-border rounded text-[10px]">↑↓</kbd> navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 py-0.5 bg-bg-card border border-bg-border rounded text-[10px]">↵</kbd> ask AI
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 py-0.5 bg-bg-card border border-bg-border rounded text-[10px]">ESC</kbd> close
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

/** Small inline hint badge shown in the left column on desktop */
export function QuickSearchHint({ onOpen }: { onOpen?: () => void }) {
    const handleClick = () => {
        track('search_opened', { from: 'hint_badge' });
        if (onOpen) onOpen();
        else window.dispatchEvent(new CustomEvent('openQuickSearch'));
    };

    return (
        <button
            onClick={handleClick}
            className="hidden lg:flex items-center justify-between w-full px-5 py-4 hover:bg-bg-hover transition-colors group"
            title="Quick search (⌘J)"
        >
            <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-fg-muted group-hover:text-accent-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                </svg>
                <span className="text-sm font-medium text-fg-secondary group-hover:text-fg-primary transition-colors">
                    Find a resource…
                </span>
            </div>
            <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-[11px] font-sans font-medium text-fg-muted bg-bg-elevated border border-bg-border rounded">⌘</kbd>
                <kbd className="px-1.5 py-0.5 text-[11px] font-sans font-medium text-fg-muted bg-bg-elevated border border-bg-border rounded">J</kbd>
            </div>
        </button>
    );
}
