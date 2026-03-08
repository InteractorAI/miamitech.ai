import { useState } from 'react';
import { Panel } from './TerminalBlock';
import { useSpacesData } from '../hooks/useSheetData';
import type { SpaceEntry } from '../lib/googleSheets';
import { Favicon } from './Favicon';

const PREVIEW_COUNT = 4;

export function SpacesDirectory() {
    const { data: spaces, loading } = useSpacesData();
    const [expanded, setExpanded] = useState(false);

    const visible = expanded ? spaces : spaces.slice(0, PREVIEW_COUNT);
    const remaining = spaces.length - PREVIEW_COUNT;

    const handleRowClick = (space: SpaceEntry) => {
        window.interactor?.message.send(
            `Tell me about ${space.name}`
        );
    };

    return (
        <Panel title="Spaces" subtitle={loading ? '...' : `${spaces.length}`} noPadding>
            <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                {visible.map((space, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleRowClick(space)}
                        className="flex items-center justify-between px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {space.url && <Favicon url={space.url} />}
                            <div className="flex items-baseline gap-2 min-w-0">
                                <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors truncate">
                                    {space.name}
                                </span>
                                <span className="text-xs text-fg-muted truncate">{space.location}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-fg-muted font-medium">{space.type}</span>
                            {space.url && (
                                <a
                                    href={space.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 text-fg-muted hover:text-accent-blue transition-colors opacity-0 group-hover:opacity-100"
                                    title="Website"
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
                {spaces.length > PREVIEW_COUNT && (
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
