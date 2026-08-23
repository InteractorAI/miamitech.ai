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
            className="site-grid flex-1 flex flex-col min-h-0 overflow-auto min-[1200px]:grid min-[1200px]:grid-cols-[minmax(280px,360px)_minmax(360px,4fr)_minmax(420px,5fr)] min-[1200px]:overflow-hidden"
        >
            {children}
        </div>
    );
}
