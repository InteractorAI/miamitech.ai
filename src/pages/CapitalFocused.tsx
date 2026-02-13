import React from 'react';
import { CapitalIndex } from '../components/CapitalIndex';
import { Link } from 'react-router-dom';

export const CapitalFocused: React.FC = () => {
    return (
        <div className="p-4 h-screen flex flex-col gap-4">
            <header className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2 shrink-0">
                <Link to="/" className="text-miami-pink hover:text-white transition-colors text-sm uppercase">
                    &lt; [RETURN_TO_GRID]
                </Link>
                <h1 className="text-xl font-bold text-gray-200 tracking-wider">
                    MODULE: CAPITAL_INDEX
                </h1>
                <div className="w-24"></div> {/* Spacer for centering */}
            </header>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Side panel context */}
                <div className="w-64 shrink-0 border-r border-gray-800 pr-4 hidden md:block">
                    <h3 className="text-miami-orange font-bold mb-2">SECTOR_BRIEFING</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                        Miami's venture capital landscape has evolved into a multi-stage ecosystem.
                        Key focus areas include FinTech, HealthTech, and Crypto/Web3.
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        USAGE: Tap any row to initialize deep-dive query via Interactor AI.
                    </p>
                </div>

                <div className="flex-1 min-h-0">
                    <CapitalIndex />
                </div>
            </div>
        </div>
    );
};
