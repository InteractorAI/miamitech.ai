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
                        className="group shrink-0 w-44 border border-bg-border rounded-md px-3 py-2.5 hover:border-fg-muted hover:bg-bg-hover transition-all duration-150 sheen"
                    >
                        <div className="text-xs font-semibold text-fg-primary group-hover:text-accent-blue leading-tight transition-colors">{s.title}</div>
                        <div className="text-[11px] text-fg-muted leading-snug mt-0.5">{s.subhead}</div>
                    </a>
                ))}
                <button
                    onClick={() => window.interactor?.message.send("I'm interested in sponsoring miamitech.ai")}
                    className="shrink-0 w-44 border border-dashed border-bg-border rounded-md px-3 py-2.5 hover:border-fg-muted hover:bg-bg-hover transition-all duration-150 text-left sheen"
                >
                    <div className="text-xs font-semibold text-fg-muted leading-tight">Your brand here</div>
                    <div className="text-[11px] text-fg-muted/60 leading-snug mt-0.5">Become a sponsor →</div>
                </button>
            </div>
        </Panel>
    );
}
