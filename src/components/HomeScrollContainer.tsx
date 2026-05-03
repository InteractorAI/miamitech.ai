'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent, type ReactNode } from 'react';

const SCROLL_KEY = 'miamitech.home.scrollTop';
const MIDDLE_WIDTH_KEY = 'miamitech.home.middleWidth';
const DEFAULT_SIDEBAR_WIDTH = 320;
const DEFAULT_MIDDLE_WIDTH = 520;
const MIN_MIDDLE_WIDTH = 360;
const MAX_MIDDLE_WIDTH = 760;
const MIN_RIGHT_WIDTH = 420;

function clampMiddleWidth(width: number, containerWidth: number) {
    const responsiveMax = containerWidth > 0
        ? containerWidth - DEFAULT_SIDEBAR_WIDTH - MIN_RIGHT_WIDTH
        : MAX_MIDDLE_WIDTH;
    const availableMax = Math.max(MIN_MIDDLE_WIDTH, Math.min(MAX_MIDDLE_WIDTH, responsiveMax));
    return Math.min(availableMax, Math.max(MIN_MIDDLE_WIDTH, width));
}

export function HomeScrollContainer({ children }: { children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const isRestoring = useRef(false);
    const dragStart = useRef<{
        x: number;
        middleWidth: number;
    } | null>(null);
    const [middleWidth, setMiddleWidth] = useState(DEFAULT_MIDDLE_WIDTH);
    const [isDraggingMiddle, setIsDraggingMiddle] = useState(false);

    useEffect(() => {
        const savedMiddle = sessionStorage.getItem(MIDDLE_WIDTH_KEY);
        const parsedMiddle = Number(savedMiddle);

        if (Number.isFinite(parsedMiddle)) {
            setMiddleWidth(clampMiddleWidth(parsedMiddle, getContainerWidth()));
        }
    }, []);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const clampToContainer = () => {
            setMiddleWidth((currentWidth) => {
                const nextWidth = clampMiddleWidth(currentWidth, getContainerWidth());
                if (Math.round(nextWidth) !== Math.round(currentWidth)) {
                    sessionStorage.setItem(MIDDLE_WIDTH_KEY, String(Math.round(nextWidth)));
                }
                return nextWidth;
            });
        };

        clampToContainer();

        const observer = new ResizeObserver(clampToContainer);
        observer.observe(container);
        window.addEventListener('resize', clampToContainer);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', clampToContainer);
        };
    }, []);

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

    useEffect(() => {
        if (!isDraggingMiddle) return;

        const previousCursor = document.body.style.cursor;
        const previousSelect = document.body.style.userSelect;
        const clearDrag = () => {
            dragStart.current = null;
            setIsDraggingMiddle(false);
        };
        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') clearDrag();
        };

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        window.addEventListener('pointerup', clearDrag);
        window.addEventListener('pointercancel', clearDrag);
        window.addEventListener('blur', clearDrag);
        window.addEventListener('keydown', handleGlobalKeyDown);

        return () => {
            document.body.style.cursor = previousCursor;
            document.body.style.userSelect = previousSelect;
            window.removeEventListener('pointerup', clearDrag);
            window.removeEventListener('pointercancel', clearDrag);
            window.removeEventListener('blur', clearDrag);
            window.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [isDraggingMiddle]);

    function getContainerWidth() {
        return ref.current?.getBoundingClientRect().width ?? 0;
    }

    function setMiddleWidthValue(width: number) {
        const nextWidth = clampMiddleWidth(width, getContainerWidth());
        setMiddleWidth(nextWidth);
        sessionStorage.setItem(MIDDLE_WIDTH_KEY, String(Math.round(nextWidth)));
    }

    function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragStart.current = {
            x: event.clientX,
            middleWidth,
        };
        setIsDraggingMiddle(true);
    }

    function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
        if (!isDraggingMiddle) return;
        if (!dragStart.current) return;

        const deltaX = event.clientX - dragStart.current.x;
        const absX = Math.abs(deltaX);

        if (absX < 3) return;

        setMiddleWidthValue(dragStart.current.middleWidth + deltaX);
    }

    function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        dragStart.current = null;
        setIsDraggingMiddle(false);
    }

    function handleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        setMiddleWidthValue(middleWidth + direction * 16);
    }

    return (
        <div
            ref={ref}
            style={{
                '--left-sidebar-width': `${DEFAULT_SIDEBAR_WIDTH}px`,
                '--middle-column-width': `${Math.round(middleWidth)}px`,
            } as CSSProperties}
            onScroll={(e) => {
                if (isRestoring.current) return;
                sessionStorage.setItem(SCROLL_KEY, String(e.currentTarget.scrollTop));
            }}
            className={`relative flex-1 flex flex-col min-h-0 overflow-auto min-[900px]:grid min-[900px]:[grid-template-columns:var(--left-sidebar-width)_var(--middle-column-width)_minmax(0,1fr)] min-[900px]:overflow-hidden ${isDraggingMiddle ? 'sidebar-trip-active' : ''}`}
        >
            {children}
            <button
                type="button"
                role="separator"
                aria-label="Resize resource column"
                aria-orientation="vertical"
                aria-valuemin={MIN_MIDDLE_WIDTH}
                aria-valuemax={MAX_MIDDLE_WIDTH}
                aria-valuenow={Math.round(middleWidth)}
                data-active={isDraggingMiddle}
                style={{
                    '--resize-handle-x': `${Math.round(DEFAULT_SIDEBAR_WIDTH + middleWidth)}px`,
                } as CSSProperties}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={handleKeyDown}
                className="sidebar-trip-handle group hidden min-[900px]:block"
            >
                <span className="sidebar-trip-core" />
            </button>
        </div>
    );
}
