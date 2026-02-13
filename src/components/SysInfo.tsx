import { Panel } from './TerminalBlock';

export function SysInfo() {
    const handleRoadmap = () => {
        window.interactor?.message.send('Tell me about the miamitech.ai project roadmap and what\'s coming next.');
    };

    return (
        <Panel title="About">
            <div className="space-y-5">
                <p className="text-sm text-fg-secondary leading-relaxed">
                    The operating layer for Miami's tech ecosystem. Connecting capital, builders, and spaces.
                </p>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-fg-muted">Version</span>
                        <span className="text-sm text-fg-primary font-medium">1.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-fg-muted">Status</span>
                        <span className="text-sm text-accent-green font-medium">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-fg-muted">Entries</span>
                        <span className="text-sm text-fg-primary font-medium">235+</span>
                    </div>
                </div>

                <button
                    onClick={handleRoadmap}
                    className="w-full text-xs font-medium text-fg-secondary border border-bg-border hover:border-fg-muted hover:text-fg-primary py-2.5 rounded-md transition-all duration-200"
                >
                    View Roadmap →
                </button>
            </div>
        </Panel>
    );
}
