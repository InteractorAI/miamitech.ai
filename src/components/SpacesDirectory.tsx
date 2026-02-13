import { useState } from 'react';
import { Panel } from './TerminalBlock';

const SPACES = [
    { name: 'The LAB Miami', hood: 'Wynwood', type: 'Coworking' },
    { name: 'Mana Tech', hood: 'Downtown', type: 'Tech Hub' },
    { name: 'CIC Miami', hood: 'Miami', type: 'Innovation Campus' },
    { name: 'Büro', hood: 'Multiple', type: 'Coworking' },
    { name: 'The Cannon', hood: 'Coral Gables', type: 'Coworking' },
    { name: 'Pipeline Workspaces', hood: 'Multiple', type: 'Coworking' },
    { name: 'WeWork', hood: 'Multiple', type: 'Coworking' },
] as const;

const PREVIEW_COUNT = 4;

export function SpacesDirectory() {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? SPACES : SPACES.slice(0, PREVIEW_COUNT);
    const remaining = SPACES.length - PREVIEW_COUNT;

    const handleRowClick = (space: (typeof SPACES)[number]) => {
        window.interactor?.message.send(
            `Tell me about ${space.name}`
        );
    };

    return (
        <Panel title="Spaces" subtitle={`${SPACES.length}`} noPadding>
            <div>
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
                            <span className="text-xs text-fg-muted">{space.hood}</span>
                        </div>
                        <span className="text-[11px] text-fg-muted font-medium">{space.type}</span>
                    </div>
                ))}
                {SPACES.length > PREVIEW_COUNT && (
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
