import { useState } from 'react';
import { Panel } from './TerminalBlock';

const AMBASSADORS = [
    { name: 'Dave Notik', handle: '@dave' },
    { name: 'Maria Derchi', handle: '@maria' },
    { name: 'Natalia Martinez-Kalinina', handle: '@natalia' },
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
    { name: 'Nafis Azad', handle: '@AzadNafis' },
];

const PREVIEW_COUNT = 5;

export function AmbassadorsRegistry() {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? AMBASSADORS : AMBASSADORS.slice(0, PREVIEW_COUNT);
    const remaining = AMBASSADORS.length - PREVIEW_COUNT;

    return (
        <Panel title="Ambassadors" subtitle={`${AMBASSADORS.length}`} noPadding>
            <div>
                {visible.map((a, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between px-5 py-3 border-b border-bg-border/50 last:border-b-0"
                    >
                        <span className="text-sm font-medium text-fg-primary">{a.name}</span>
                        <span className="text-xs text-fg-muted">{a.handle}</span>
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
