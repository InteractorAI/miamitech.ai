'use client';
import { Panel } from './TerminalBlock';

const FAQS = [
    'How do I get started?',
    'Who are the top investors in Miami?',
    'What coworking spaces are available?',
    'How can I raise a pre-seed round here?',
    'What events should I attend?',
    'How do I connect with founders?',
];

export function FAQ() {
    const handleClick = (question: string) => {
        window.interactor?.message.send(question);
    };

    return (
        <Panel title="FAQ" noPadding>
            <div>
                {FAQS.map((q, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(q)}
                        className="w-full text-left flex items-center gap-2 px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                    >
                        <span className="text-fg-muted text-xs shrink-0">?</span>
                        <span className="text-sm text-fg-primary group-hover:text-accent-pink transition-colors">
                            {q}
                        </span>
                    </button>
                ))}
            </div>
        </Panel>
    );
}
