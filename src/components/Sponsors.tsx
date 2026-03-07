import { Panel } from './TerminalBlock';

interface Sponsor {
    title: string;
    subhead: string;
    url: string;
}

const SPONSORS: Sponsor[] = [
    {
        title: 'Interactor',
        subhead: 'The AI concierge for your business',
        url: 'https://interactor.ai',
    },
];

export function Sponsors() {
    return (
        <Panel title="Sponsors" noPadding>
            <div className="flex overflow-x-auto gap-2 p-3 no-scrollbar">
                {SPONSORS.map((s, i) => (
                    <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group shrink-0 w-44 border border-bg-border-subtle rounded-lg px-3 py-3 bg-gradient-to-b from-bg-elevated/40 to-bg-card/20 hover:border-fg-muted/30 hover:bg-bg-hover transition-all duration-300 shadow-sm"
                    >
                        <div className="text-xs font-semibold text-fg-primary group-hover:text-accent-blue leading-tight transition-colors">{s.title}</div>
                        <div className="text-[11px] text-fg-muted leading-snug mt-1.5">{s.subhead}</div>
                    </a>
                ))}
                <button
                    onClick={() => window.interactor?.message.send("I'm interested in sponsoring miamitech.ai")}
                    className="shrink-0 w-44 border border-dashed border-bg-border-subtle rounded-lg px-3 py-3 bg-bg-card/30 hover:border-fg-muted/30 hover:bg-bg-hover transition-all duration-300 text-left shadow-sm"
                >
                    <div className="text-xs font-semibold text-fg-muted leading-tight">Your brand here</div>
                    <div className="text-[11px] text-fg-muted/60 leading-snug mt-1.5">Become a sponsor →</div>
                </button>
            </div>
        </Panel>
    );
}
