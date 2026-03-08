import { useState } from 'react';
import { Panel } from './TerminalBlock';
import { useCommunitiesData } from '../hooks/useSheetData';
import type { CommunityEntry } from '../lib/googleSheets';
import { Favicon } from './Favicon';

const PREVIEW_COUNT = 4;

export function CommunitiesDirectory() {
    const { data: communities, loading } = useCommunitiesData();
    const [expanded, setExpanded] = useState(false);

    const visible = expanded ? communities : communities.slice(0, PREVIEW_COUNT);
    const remaining = communities.length - PREVIEW_COUNT;

    const handleRowClick = (community: CommunityEntry) => {
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
                        className="flex items-center justify-between px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            {community.url && <Favicon url={community.url} />}
                            <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors truncate">
                                {community.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {community.url && (
                                <a
                                    href={community.url}
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
                            {community.calendar && (
                                <a
                                    href={community.calendar}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 text-fg-muted hover:text-accent-blue transition-colors opacity-0 group-hover:opacity-100"
                                    title="Event Calendar"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                    </svg>
                                </a>
                            )}
                        </div>
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
