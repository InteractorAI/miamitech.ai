import React from 'react';
import { TerminalBlock } from './TerminalBlock';

export const SysInfo: React.FC = () => {
    const handleDeepDive = () => {
        // Interactor trigger logic will go here
        window.interactor?.message.send("Tell me about the miamitech.ai roadmap.");
    };

    return (
        <TerminalBlock title="SYS_INFO" className="h-full">
            <div className="space-y-4 text-sm text-gray-400">
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-miami-purple">VERSION:</div>
                    <div className="text-white">1.0.0-rc1</div>
                    <div className="text-miami-purple">STATUS:</div>
                    <div className="text-green-500">ONLINE_ACTIVE</div>
                    <div className="text-miami-purple">UPTIME:</div>
                    <div className="text-white">99.9%</div>
                </div>

                <div className="border-t border-gray-800 my-2"></div>

                <p>
                    <span className="text-miami-pink">MISSION:</span> Constructing the high-density operating system for the Miami tech ecosystem. connecting capital, talent, and spaces through a unified terminal interface.
                </p>

                <button
                    onClick={handleDeepDive}
                    className="w-full mt-4 border border-miami-blue/50 text-miami-blue hover:bg-miami-blue/10 py-2 px-4 transition-all uppercase text-xs tracking-widest hover:border-miami-pink hover:text-miami-pink"
                >
                    [INITIATE_DEEP_DIVE]
                </button>
            </div>
        </TerminalBlock>
    );
};
