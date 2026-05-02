'use client';
import { Panel } from './TerminalBlock';
import { track } from '@vercel/analytics';
import type { FAQEntry } from '../lib/googleSheets';
import { askInteractor } from '../lib/interactor';
import { InteractorAskIcon } from './InteractorAskIcon';

const DEFAULT_FAQS = [
    'How do I get started?',
    'Who are the top investors in Miami?',
    'What coworking spaces are available?',
    'How can I raise a pre-seed round here?',
    'What events should I attend?',
    'How do I connect with founders?',
];

export function FAQ({ initialData = [] }: { initialData?: FAQEntry[] }) {
    const questions = initialData.length > 0 
        ? initialData.map(d => d.question) 
        : DEFAULT_FAQS;

    const handleClick = (question: string) => {
        track('faq_clicked', { question });
        askInteractor(question);
    };

    return (
        <Panel title="FAQ" noPadding>
            <div>
                {questions.map((q, i) => (
                    <button
                        key={i}
                        onClick={() => handleClick(q)}
                        className="w-full text-left flex items-center gap-2 px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover cursor-pointer transition-colors duration-100 group"
                    >
                        <span className="text-fg-muted text-xs shrink-0">?</span>
                        <span className="text-sm text-fg-primary group-hover:text-accent-pink transition-colors flex-1">
                            {q}
                        </span>
                        <span className="ml-auto shrink-0 inline-flex min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 items-center justify-center p-2 lg:p-1 text-accent-pink" title="Ask Interactor">
                            <InteractorAskIcon />
                        </span>
                    </button>
                ))}
            </div>
        </Panel>
    );
}
