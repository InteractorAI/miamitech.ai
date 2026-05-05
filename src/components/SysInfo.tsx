'use client';
import { Panel } from './TerminalBlock';
import { track } from '@vercel/analytics';
import { askInteractor } from '../lib/interactor';
import { FollowMiamiTech } from './FollowMiamiTech';

export function SysInfo() {
    const actionClassName = 'flex-1 text-[11px] font-medium text-fg-secondary border border-bg-border hover:bg-bg-hover hover:text-accent-pink py-2 rounded-md transition-all duration-200';

    const handleLearnMore = () => {
        track('learn_more_clicked');
        window.dispatchEvent(new CustomEvent('open-about-modal', { detail: { tab: 'about' } }));
    };

    const handleContribute = () => {
        track('contribute_clicked');
        askInteractor('How can I contribute to miamitech.ai?');
    };

    return (
        <Panel title="About">
            <div className="space-y-5">
                <p className="text-sm text-fg-secondary leading-relaxed">
                    The AI concierge and index for the Miami tech ecosystem, connecting you to the best resources in our community.
                </p>

                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={handleLearnMore}
                        className={actionClassName}
                    >
                        Learn More
                    </button>
                    <button
                        onClick={handleContribute}
                        className={actionClassName}
                    >
                        Contribute
                    </button>
                    <FollowMiamiTech variant="button" className={actionClassName} />
                </div>
            </div>


        </Panel>
    );
}
