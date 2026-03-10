'use client';
import { useCallback } from 'react';

const SECTIONS = [
    { id: 'about', label: 'About' },
    { id: 'spaces', label: 'Spaces' },
    { id: 'communities', label: 'Communities' },
    { id: 'conferences', label: 'Conferences' },
    { id: 'ambassadors', label: 'Ambassadors' },
    { id: 'news', label: 'News' },
    { id: 'faq', label: 'FAQ' },
    { id: 'capital', label: 'Capital' },
];

export function MobileNav() {
    const scrollTo = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    return (
        <nav className="lg:hidden flex items-center gap-1 px-4 py-2 bg-bg-card/90 backdrop-blur-sm border-b border-bg-border shrink-0 sticky top-0 z-20 overflow-x-auto no-scrollbar">
            {SECTIONS.map((s) => (
                <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className="text-[11px] px-3 py-1.5 rounded-md font-medium text-fg-muted hover:text-fg-secondary hover:bg-bg-hover transition-all duration-150 whitespace-nowrap"
                >
                    {s.label}
                </button>
            ))}
        </nav>
    );
}
