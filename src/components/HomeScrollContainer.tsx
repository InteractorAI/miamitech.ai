'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const SCROLL_KEY = 'miamitech.home.scrollTop';

export function HomeScrollContainer({ children }: { children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const isRestoring = useRef(false);

    useEffect(() => {
        const saved = sessionStorage.getItem(SCROLL_KEY);
        if (!saved || !ref.current) return;
        sessionStorage.removeItem(SCROLL_KEY);
        isRestoring.current = true;

        requestAnimationFrame(() => {
            if (ref.current) ref.current.scrollTop = Number(saved) || 0;
            requestAnimationFrame(() => {
                isRestoring.current = false;
            });
        });
    }, []);

    return (
        <div
            ref={ref}
            onScroll={(e) => {
                if (isRestoring.current) return;
                sessionStorage.setItem(SCROLL_KEY, String(e.currentTarget.scrollTop));
            }}
            className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0 overflow-auto lg:overflow-hidden"
        >
            {children}
        </div>
    );
}
