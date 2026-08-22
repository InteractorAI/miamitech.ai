'use client';
import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        interactor: any;
    }
}

type InteractorTheme = 'light' | 'dark';

function getInteractorTheme(): InteractorTheme {
    const root = document.documentElement;
    if (
        root.classList.contains('miami-tech-dark') ||
        root.classList.contains('simple-dark') ||
        root.classList.contains('retro-miami')
    ) {
        return 'dark';
    }
    return 'light';
}

export function InteractorWidget() {
    const initialized = useRef(false);
    const activeTheme = useRef<InteractorTheme | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || initialized.current) return;
        initialized.current = true;
        let check: ReturnType<typeof setInterval> | null = null;
        let observer: MutationObserver | null = null;

        const originalError = console.error;
        console.error = (...args) => {
            if (args[0]) {
                const msg = typeof args[0] === 'string' ? args[0] : (args[0].toString ? args[0].toString() : '');
                if (
                    msg.includes('Chat iframe not found') ||
                    msg.includes('No valid user agent string was provided') ||
                    msg.includes('Target carousel ref')
                ) {
                    return;
                }
            }
            originalError.apply(console, args);
        };

        const initialize = () => {
            if (!window.interactor) return;
            const theme = getInteractorTheme();
            if (activeTheme.current === theme) return;

            try {
                window.interactor.initialize('miamitech', {
                    type: 'mobile',
                    theme,
                    isOpen: false,
                    isFabVisible: true
                });
                activeTheme.current = theme;
            } catch (e) { }
        };

        const waitForInteractor = () => {
            check = setInterval(() => {
                if (window.interactor) {
                    if (check) clearInterval(check);
                    initialize();
                }
            }, 100);
        };

        // Delay injection slightly to ensure React hydration has fully completed
        const timer = setTimeout(() => {
            const existingScript = document.querySelector<HTMLScriptElement>('script[data-interactor-embed="miamitech"]');
            const script = existingScript ?? document.createElement('script');
            script.src = 'https://embed.interactor.ai/assets/index.js';
            script.type = 'module';
            script.crossOrigin = 'anonymous';
            script.dataset.interactorEmbed = 'miamitech';

            script.onload = () => {
                waitForInteractor();
            };

            if (existingScript && window.interactor) {
                initialize();
            } else if (existingScript) {
                waitForInteractor();
            } else if (!existingScript) {
                document.body.appendChild(script);
            }
        }, 500);

        observer = new MutationObserver(initialize);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => {
            clearTimeout(timer);
            if (check) clearInterval(check);
            observer?.disconnect();
            console.error = originalError;
        };
    }, []);

    return (
        <link rel="stylesheet" href="https://embed.interactor.ai/assets/index.css" crossOrigin="anonymous" />
    );
}
