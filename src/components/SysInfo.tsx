import { Panel } from './TerminalBlock';

export function SysInfo() {
    const handleRoadmap = () => {
        window.interactor?.message.send('What\'s on the roadmap?');
    };

    return (
        <Panel title="About">
            <div className="space-y-5">
                <p className="text-sm text-fg-secondary leading-relaxed">
                    The operating layer for Miami's tech ecosystem. Connecting capital, builders, and spaces.
                </p>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-fg-muted">Datapoints</span>
                        <span className="text-sm text-fg-primary font-medium">235+</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-fg-muted">Last Updated</span>
                        <span className="text-sm text-fg-primary font-medium">Feb 2025</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleRoadmap}
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
