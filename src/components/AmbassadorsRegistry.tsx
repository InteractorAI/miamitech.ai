import { useState } from 'react';
import { Panel } from './TerminalBlock';

const AMBASSADORS = [
    { name: 'Melissa Medina', handle: '@melmedina305' },
    { name: 'Ruben Harris', handle: '@rubenharris' },
    { name: 'Michael Vega-Sanz', handle: '@MattVanzz' },
    { name: 'Hannan Parvizian', handle: '@HaPi31415' },
    { name: 'Dami Osunsanya', handle: '@DamiOsunsanya' },
    { name: 'Auston Bunsen', handle: '@bunsen' },
    { name: 'Saxon Baum', handle: '@Saxonbaum' },
    { name: 'Geoffrey Woo', handle: '@geoffreywoo' },
    { name: 'Katherine Boyle', handle: '@KTmBoyle' },
    { name: 'Rony Abovitz', handle: '@rabovitz' },
    { name: 'Chester Ng', handle: '@chest' },
    { name: 'Nafis Azad', handle: '@AzadNafis' },
    { name: 'Saif Ishoof', handle: '@saif305' },
];

const PREVIEW_COUNT = 5;

export function AmbassadorsRegistry() {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? AMBASSADORS : AMBASSADORS.slice(0, PREVIEW_COUNT);
    const remaining = AMBASSADORS.length - PREVIEW_COUNT;

    const handleRowClick = (name: string) => {
        window.interactor?.message.send(`Tell me about ${name}`);
    };

    return (
        <Panel title="Ambassadors" subtitle={`${AMBASSADORS.length}`} noPadding>
            <div>
                {visible.map((a, i) => (
                    <div
                        key={i}
                        onClick={() => handleRowClick(a.name)}
                        className="flex items-center justify-between px-5 py-3 border-b border-bg-border/50 last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                    >
                        <span className="text-sm font-medium text-fg-primary group-hover:text-accent-pink transition-colors">
                            {a.name}
                        </span>
                        <a
                            href={`https://x.com/${a.handle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-fg-muted px-2 py-1 rounded-md hover:text-accent-blue hover:bg-accent-blue/10 transition-all duration-150"
                        >
                            {a.handle}
                        </a>
                    </div>
                ))}
                {AMBASSADORS.length > PREVIEW_COUNT && (
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
