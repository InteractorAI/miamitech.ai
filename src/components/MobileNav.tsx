'use client';
import { useCallback } from 'react';

const SECTIONS = [
    { id: 'events', label: 'Events' },
    { id: 'spaces', label: 'Spaces' },
    { id: 'communities', label: 'Communities' },
    { id: 'capital', label: 'Capital' },
    { id: 'accelerators', label: 'Accelerators' },
    { id: 'conferences', label: 'Conferences' },
    { id: 'ambassadors', label: 'Ambassadors' },
    { id: 'news', label: 'News' },
    { id: 'faq', label: 'FAQ' },
];

export function MobileNav() {
    const scrollTo = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    return (
        <nav className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 bg-bg-card/95 backdrop-blur-sm border-b border-bg-border shrink-0 sticky top-0 z-20 overflow-x-auto no-scrollbar">
            {SECTIONS.map((s) => (
                <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className="text-[12px] px-3.5 py-2 rounded-lg font-medium text-fg-secondary hover:text-fg-primary hover:bg-bg-hover active:bg-bg-hover transition-colors duration-150 whitespace-nowrap"
                >
                    {s.label}
                </button>
            ))}
        </nav>
    );
}
