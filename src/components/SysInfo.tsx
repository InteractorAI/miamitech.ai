import { Panel } from './TerminalBlock';

interface SysInfoProps {
    dataCount: number;
}

export function SysInfo({ dataCount }: SysInfoProps) {
    const handleLearnMore = () => {
        window.interactor?.message.send('Tell me about this project');
    };

    return (
        <Panel title="About">
            <div className="space-y-5">
                <p className="text-sm text-fg-secondary leading-relaxed">
                    The AI concierge and index for the Miami tech and startup ecosystem, powered by{' '}
                    <a
                        href="https://interactor.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fg-primary font-medium hover:text-accent-blue transition-colors"
                    >
                        Interactor
                    </a>.
                </p>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-fg-muted">Datapoints</span>
                        <span className="text-sm text-fg-primary font-medium">{dataCount || 235}+</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleLearnMore}
                        className="flex-1 text-xs font-medium text-fg-secondary border border-bg-border hover:border-fg-muted hover:text-fg-primary py-2.5 rounded-md transition-all duration-200"
                    >
                        Learn More
                    </button>
                    <button
                        onClick={() => window.interactor?.message.send('How can I contribute?')}
                        className="flex-1 text-xs font-medium text-fg-secondary border border-bg-border hover:border-fg-muted hover:text-fg-primary py-2.5 rounded-md transition-all duration-200"
                    >
                        Contribute
                    </button>
                </div>
            </div>
        </Panel>
    );
}
