import { Panel } from './TerminalBlock';

const AMBASSADORS = [
    { name: 'Dave Notik', handle: '@dave' },
    { name: 'Maria Derchi', handle: '@maria' },
    { name: 'Natalia Martinez-Kalinina', handle: '@natalia' },
];

export function AmbassadorsRegistry() {
    return (
        <Panel title="Ambassadors" noPadding>
            <div>
                {AMBASSADORS.map((a, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between px-5 py-3 border-b border-bg-border/50 last:border-b-0"
                    >
                        <span className="text-sm font-medium text-fg-primary">{a.name}</span>
                        <span className="text-xs text-fg-muted">{a.handle}</span>
                    </div>
                ))}
            </div>
        </Panel>
    );
}
