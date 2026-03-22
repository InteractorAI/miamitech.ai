'use client';
import { Panel } from './TerminalBlock';

export function SysInfo() {
    const handleLearnMore = () => {
        window.dispatchEvent(new CustomEvent('open-about-modal', { detail: { tab: 'about' } }));
    };

    return (
        <Panel title="About">
            <div className="space-y-5">
                <p className="text-sm text-fg-secondary leading-relaxed">
                    The AI concierge for the Miami tech ecosystem, connecting you to the best resources in our community.
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={handleLearnMore}
                        className="flex-1 text-[11px] font-medium text-fg-secondary border border-bg-border hover:bg-bg-hover hover:text-fg-primary py-2 rounded-md transition-all duration-200"
                    >
                        Learn More
                    </button>
                    <button
                        onClick={() => window.interactor?.message.send('How can I contribute to miamitech.ai?')}
                        className="flex-1 text-[11px] font-medium text-fg-secondary border border-bg-border hover:bg-bg-hover hover:text-fg-primary py-2 rounded-md transition-all duration-200"
                    >
                        Contribute
                    </button>
                </div>
            </div>


        </Panel>
    );
}
