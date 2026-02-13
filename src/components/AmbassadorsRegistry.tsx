import React from 'react';
import { TerminalBlock } from './TerminalBlock';

const AMBASSADORS = [
    { name: "Dave Notik", handle: "@dave" },
    { name: "Maria Derchi", handle: "@maria" },
    { name: "Natalia Martinez-Kalinina", handle: "@natalia" },
    // Add more placeholders
];

export const AmbassadorsRegistry: React.FC = () => {
    return (
        <TerminalBlock title="AMBASSADORS_REGISTRY" className="h-full">
            <ul className="space-y-2 text-xs">
                {AMBASSADORS.map((p, i) => (
                    <li key={i} className="flex justify-between items-center border-b border-gray-900 pb-1 last:border-0 hover:text-miami-purple cursor-help transition-colors">
                        <span className="text-gray-300">{p.name}</span>
                        <span className="text-gray-500 font-mono">{p.handle}</span>
                    </li>
                ))}
            </ul>
        </TerminalBlock>
    );
};
