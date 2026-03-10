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
        <div className="lg:hidden flex overflow-x-auto no-scrollbar py-2 px-5 border-b border-bg-border shrink-0 bg-bg-card/95 backdrop-blur z-20 sticky top-0">
            <div className="flex gap-2">
                {SECTIONS.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className="whitespace-nowrap px-3 py-1.5 rounded-full bg-bg-elevated text-fg-secondary text-[13px] font-medium hover:bg-bg-hover hover:text-fg-primary transition-colors border border-bg-border shadow-sm"
                    >
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
