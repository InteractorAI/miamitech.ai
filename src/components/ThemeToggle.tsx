'use client';
import { useState, useEffect } from 'react';
import { track } from '@vercel/analytics';

export function ThemeToggle() {
    const [isDark, setIsDark] = useState<boolean | null>(null);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggle = () => {
        const doc = document.documentElement;
        const next = !isDark;
        if (next) {
            doc.classList.add('dark');
            doc.style.colorScheme = 'dark';
            localStorage.setItem('theme', 'dark');
            track('theme_toggled', { theme: 'dark' });
        } else {
            doc.classList.remove('dark');
            doc.style.colorScheme = 'light';
            localStorage.setItem('theme', 'light');
            track('theme_toggled', { theme: 'light' });
        }
        setIsDark(next);
    };

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-bg-border text-fg-secondary hover:text-fg-primary transition-all duration-200"
            aria-label="Toggle theme"
        >
            {isDark === false ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18" height="18"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    className="animate-fade-in"
                >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18" height="18"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    className={`animate-fade-in ${isDark === null ? 'opacity-0' : ''}`}
                >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                </svg>
            )}
        </button>
    );
}
