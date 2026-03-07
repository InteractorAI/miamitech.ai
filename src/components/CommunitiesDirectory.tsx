import { useState } from 'react';
import { Panel } from './TerminalBlock';
import { useCommunitiesData } from '../hooks/useSheetData';
import type { CommunityEntry } from '../lib/googleSheets';

const PREVIEW_COUNT = 4;

export function CommunitiesDirectory() {
    const { data: communities, loading } = useCommunitiesData();
    const [expanded, setExpanded] = useState(false);

    const visible = expanded ? communities : communities.slice(0, PREVIEW_COUNT);
    const remaining = communities.length - PREVIEW_COUNT;

    const handleRowClick = (community: CommunityEntry) => {
        if (community.url) {
            window.open(community.url, '_blank');
            return;
        }
        window.interactor?.message.send(
            `Tell me about the ${community.name} community`
        );
    };

    return (
        <Panel title="Communities" subtitle={loading ? '...' : `${communities.length}`} noPadding>
            <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                {visible.map((community, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleRowClick(community)}
                        className="flex items-center justify-between px-5 py-3 border-b border-bg-border/50 last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                    >
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors">
                                {community.name}
                            </span>
                        </div>
                        {community.calendar && (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(community.calendar, '_blank');
                                }}
                                className="text-[10px] px-2 py-0.5 rounded border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10 transition-colors"
                            >
                                Calendar
                            </span>
                        )}
                    </div>
                ))}
                {communities.length > PREVIEW_COUNT && (
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
