import React, { useState } from 'react';
import { Panel } from './TerminalBlock';

export function AskAI() {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            window.interactor?.message.send(query);
            setQuery('');
        }
    };

    return (
        <Panel title="Ask anything">
            <div className="space-y-4">
                <p className="text-[13px] text-fg-secondary leading-relaxed">
                    Chat with Miami Tech's AI for quick answers. Someone sees every chat and can jump in to help when needed.
                </p>

                <form onSubmit={handleSubmit} className="relative">
                    {/* Subtle persistent gradient border */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-accent-pink/20 via-accent-blue/20 to-accent-green/20 rounded-lg blur-[1px]" />

                    <div className="relative flex items-center bg-bg-primary/50 backdrop-blur-sm rounded-lg border border-bg-border focus-within:border-accent-pink/30 transition-all duration-300">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Message Miami Tech AI"
                            className="w-full bg-transparent text-fg-primary text-base px-4 py-2.5 focus:outline-none placeholder:text-fg-muted"
                        />
                        <button
                            type="submit"
                            disabled={!query.trim()}
                            className="pr-4 text-fg-muted hover:text-accent-pink disabled:opacity-10 transition-colors duration-200 group"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18" height="18"
                                viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"
                                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                            >
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </Panel>
    );
}
