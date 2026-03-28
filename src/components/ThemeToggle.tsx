'use client';
import { useState, useEffect } from 'react';
import { track } from '@vercel/analytics';

export function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark' | 'miami' | null>(null);

    useEffect(() => {
        if (document.documentElement.classList.contains('miami')) {
            setTheme('miami');
        } else if (document.documentElement.classList.contains('dark')) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    }, []);

    const toggle = () => {
        const doc = document.documentElement;
        let next: 'light' | 'dark' | 'miami';
        
        if (theme === 'light') next = 'dark';
        else if (theme === 'dark') next = 'miami';
        else next = 'light';

        doc.classList.remove('dark', 'miami');
        
        if (next === 'dark') doc.classList.add('dark');
        if (next === 'miami') doc.classList.add('miami');

        doc.style.colorScheme = next === 'light' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        track('theme_toggled', { theme: next });
        
        setTheme(next);
    };

    return (
        <button
            onClick={toggle}
            className="p-2 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-bg-border text-fg-secondary hover:text-fg-primary transition-all duration-200"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18" height="18"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    className="animate-fade-in"
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
            ) : theme === 'miami' ? (
                /* Fun miami-style icon (Palmtree or similar, maybe glasses) */
                 <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" height="18" 
                    viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" 
                    strokeLinecap="round" strokeLinejoin="round" 
                    className="animate-fade-in text-accent-pink"
                 >
                    <polygon points="12 2 2 22 12 17 22 22 12 2"/>
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18" height="18"
                    viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    className={`animate-fade-in ${theme === null ? 'opacity-0' : ''}`}
                >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
            )}
        </button>
    );
}
