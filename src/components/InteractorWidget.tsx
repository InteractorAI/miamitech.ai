'use client';
import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        interactor: any;
    }
}

export function InteractorWidget() {
    const initialized = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined' || initialized.current) return;
        initialized.current = true;

        // Catch interactor's specific console error natively before it hits UI overlay
        const originalError = console.error;
        console.error = (...args) => {
            if (args[0] && typeof args[0] === 'string' && args[0].includes('Chat iframe not found')) return;
            originalError.apply(console, args);
        };

        // Delay injection slightly to ensure React hydration has fully completed
        const timer = setTimeout(() => {
            const script = document.createElement('script');
            script.src = 'https://embed.interactor.ai/assets/index.js';
            script.type = 'module';
            script.crossOrigin = 'anonymous';

            script.onload = () => {
                const check = setInterval(() => {
                    if (window.interactor) {
                        clearInterval(check);
                        try {
                            window.interactor.initialize('miamitech', {
                                type: 'mobile',
                                isOpen: false,
                                isFabVisible: true
                            });
                        } catch (e) { }
                    }
                }, 100);
            };

            document.body.appendChild(script);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    return (
        <link rel="stylesheet" href="https://embed.interactor.ai/assets/index.css" crossOrigin="anonymous" />
    );
}
