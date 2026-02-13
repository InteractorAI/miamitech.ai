import React from 'react';

interface TerminalBlockProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}

export const TerminalBlock: React.FC<TerminalBlockProps> = ({ title, children, className = '', action }) => {
    return (
        <div className={`terminal-border bg-miami-dark p-4 flex flex-col h-full ${className}`}>
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                <h2 className="text-miami-pink font-bold uppercase tracking-wider text-sm">
                    [{title}]
                </h2>
                {action && <div>{action}</div>}
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
                {children}
            </div>
        </div>
    );
};
