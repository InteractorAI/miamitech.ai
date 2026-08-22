'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@vercel/analytics';

export const themes = [
    { id: 'miami-tech', label: 'Miami Tech', description: 'Default', colorScheme: 'light' },
    { id: 'miami-tech-dark', label: 'Miami Tech Dark', description: 'The default, after dark', colorScheme: 'dark' },
    { id: 'simple-light', label: 'Simple Light', description: 'Clean and neutral', colorScheme: 'light' },
    { id: 'simple-dark', label: 'Simple Dark', description: 'Clean and low-light', colorScheme: 'dark' },
    { id: 'retro-miami', label: 'Retro Miami', description: 'Neon, after hours', colorScheme: 'dark' },
    { id: 'peach', label: 'Peach', description: 'Warm and bright', colorScheme: 'light' },
] as const;

export type Theme = (typeof themes)[number]['id'];

const themeIds = themes.map(({ id }) => id) as Theme[];

const legacyThemes: Record<string, Theme> = {
    'precision-light': 'miami-tech',
    light: 'simple-light',
    dark: 'simple-dark',
    miami: 'retro-miami',
    contrast: 'miami-tech-dark',
    'contrast-light': 'peach',
};

const legacyThemeIds = Object.keys(legacyThemes);

function getTheme(): Theme {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme && themeIds.includes(savedTheme as Theme)) {
        return savedTheme as Theme;
    }

    return legacyThemes[savedTheme ?? ''] ?? 'miami-tech';
}

function applyTheme(next: Theme) {
    const { colorScheme } = themes.find(({ id }) => id === next)!;
    const doc = document.documentElement;

    doc.classList.remove(...themeIds, ...legacyThemeIds);
    doc.classList.add(next);
    doc.style.colorScheme = colorScheme;
    localStorage.setItem('theme', next);
}

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const activeTheme = themes.find(({ id }) => id === theme) ?? themes[0];

    useEffect(() => {
        const initialTheme = getTheme();
        applyTheme(initialTheme);
        setTheme(initialTheme);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const closeOnOutsideClick = (event: MouseEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);

        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [isOpen]);

    const selectTheme = (next: Theme) => {
        applyTheme(next);
        track('theme_selected', { theme: next });
        setTheme(next);
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-bg-elevated/70 text-fg-secondary transition-colors duration-150 hover:bg-bg-hover hover:text-fg-primary"
                aria-label={`Choose theme. Current theme: ${activeTheme.label}`}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                title={`Theme: ${activeTheme.label}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="3.25" />
                    <path d="M12 3v2.25M12 18.75V21M5.64 5.64l1.59 1.59m9.54 9.54 1.59 1.59M3 12h2.25M18.75 12H21M5.64 18.36l1.59-1.59m9.54-9.54 1.59-1.59" />
                </svg>
            </button>

            {isOpen && (
                <div role="menu" aria-label="Choose a color theme" className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-xl border border-bg-border bg-bg-card p-1.5 shadow-xl shadow-black/10">
                    <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-muted">Theme</p>
                    {themes.map(({ id, label, description }) => {
                        const isActive = theme === id;

                        return (
                            <button
                                key={id}
                                type="button"
                                role="menuitemradio"
                                aria-checked={isActive}
                                onClick={() => selectTheme(id)}
                                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${isActive ? 'bg-accent-pink-alpha text-fg-primary' : 'text-fg-secondary hover:bg-bg-hover hover:text-fg-primary'}`}
                            >
                                <span className={`h-2.5 w-2.5 shrink-0 rounded-full border border-bg-border ${isActive ? 'bg-accent-blue' : 'bg-bg-elevated'}`} aria-hidden="true" />
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium leading-none">{label}</span>
                                    <span className="mt-1 block text-xs text-fg-muted">{description}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
