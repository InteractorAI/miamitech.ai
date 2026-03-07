import { useState } from 'react';
import { Panel } from './TerminalBlock';
import { useSpacesData } from '../hooks/useSheetData';
import type { SpaceEntry } from '../lib/googleSheets';

const PREVIEW_COUNT = 4;

export function SpacesDirectory() {
    const { data: spaces, loading } = useSpacesData();
    const [expanded, setExpanded] = useState(false);

    const visible = expanded ? spaces : spaces.slice(0, PREVIEW_COUNT);
    const remaining = spaces.length - PREVIEW_COUNT;

    const handleRowClick = (space: SpaceEntry) => {
        if (space.url) {
            window.open(space.url, '_blank');
            return;
        }
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
                        className="flex items-center justify-between px-5 py-3 border-b border-bg-border/50 last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                    >
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors">
                                {space.name}
                            </span>
                            <span className="text-xs text-fg-muted">{space.location}</span>
                        </div>
                        <span className="text-[11px] text-fg-muted font-medium">{space.type}</span>
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
