'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent, type ReactNode } from 'react';

const SCROLL_KEY = 'miamitech.home.scrollTop';
const SIDEBAR_WIDTH_KEY = 'miamitech.home.sidebarWidth';
const MIDDLE_WIDTH_KEY = 'miamitech.home.middleWidth';
const DEFAULT_SIDEBAR_WIDTH = 320;
const DEFAULT_MIDDLE_WIDTH = 560;
const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 540;
const MIN_MIDDLE_WIDTH = 360;
const MAX_MIDDLE_WIDTH = 760;
const MIN_RIGHT_WIDTH = 520;

type DragTarget = 'left' | 'middle';

export function HomeScrollContainer({ children }: { children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const isRestoring = useRef(false);
    const dragStart = useRef<{
        x: number;
        sidebarWidth: number;
        middleWidth: number;
    } | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
    const [middleWidth, setMiddleWidth] = useState(DEFAULT_MIDDLE_WIDTH);
    const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);

    useEffect(() => {
        const savedSidebar = sessionStorage.getItem(SIDEBAR_WIDTH_KEY);
        const savedMiddle = sessionStorage.getItem(MIDDLE_WIDTH_KEY);
        const parsedSidebar = Number(savedSidebar);
        const parsedMiddle = Number(savedMiddle);

        if (Number.isFinite(parsedSidebar)) {
            setSidebarWidth(Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, parsedSidebar)));
        }
        if (Number.isFinite(parsedMiddle)) {
            setMiddleWidth(Math.min(MAX_MIDDLE_WIDTH, Math.max(MIN_MIDDLE_WIDTH, parsedMiddle)));
        }
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
        if (!dragTarget) return;

        const previousCursor = document.body.style.cursor;
        const previousSelect = document.body.style.userSelect;
        const clearDrag = () => {
            dragStart.current = null;
            setDragTarget(null);
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
    }, [dragTarget]);

    function getContainerWidth() {
        return ref.current?.getBoundingClientRect().width ?? 0;
    }

    function setSidebarWidthValue(width: number) {
        const availableMax = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, getContainerWidth() - middleWidth - MIN_RIGHT_WIDTH));
        const nextWidth = Math.min(availableMax, Math.max(MIN_SIDEBAR_WIDTH, width));
        setSidebarWidth(nextWidth);
        sessionStorage.setItem(SIDEBAR_WIDTH_KEY, String(Math.round(nextWidth)));
    }

    function setMiddleWidthValue(width: number) {
        const availableMax = Math.max(MIN_MIDDLE_WIDTH, Math.min(MAX_MIDDLE_WIDTH, getContainerWidth() - sidebarWidth - MIN_RIGHT_WIDTH));
        const nextWidth = Math.min(availableMax, Math.max(MIN_MIDDLE_WIDTH, width));
        setMiddleWidth(nextWidth);
        sessionStorage.setItem(MIDDLE_WIDTH_KEY, String(Math.round(nextWidth)));
    }

    function handlePointerDown(target: DragTarget, event: PointerEvent<HTMLButtonElement>) {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragStart.current = {
            x: event.clientX,
            sidebarWidth,
            middleWidth,
        };
        setDragTarget(target);
    }

    function handlePointerMove(target: DragTarget, event: PointerEvent<HTMLButtonElement>) {
        if (dragTarget !== target) return;
        if (!dragStart.current) return;

        const deltaX = event.clientX - dragStart.current.x;
        const absX = Math.abs(deltaX);

        if (absX < 3) return;

        const nextWidth =
            target === 'left'
                ? dragStart.current.sidebarWidth + deltaX
                : dragStart.current.middleWidth + deltaX;

        if (target === 'left') {
            setSidebarWidthValue(nextWidth);
        } else {
            setMiddleWidthValue(nextWidth);
        }
    }

    function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        dragStart.current = null;
        setDragTarget(null);
    }

    function handleKeyDown(target: DragTarget, event: ReactKeyboardEvent<HTMLButtonElement>) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        if (target === 'left') {
            setSidebarWidthValue(sidebarWidth + direction * 16);
        } else {
            setMiddleWidthValue(middleWidth + direction * 16);
        }
    }

    return (
        <div
            ref={ref}
            style={{
                '--left-sidebar-width': `${Math.round(sidebarWidth)}px`,
                '--middle-column-width': `${Math.round(middleWidth)}px`,
            } as CSSProperties}
            onScroll={(e) => {
                if (isRestoring.current) return;
                sessionStorage.setItem(SCROLL_KEY, String(e.currentTarget.scrollTop));
            }}
            className={`relative flex-1 flex flex-col min-h-0 overflow-auto lg:grid lg:[grid-template-columns:var(--left-sidebar-width)_var(--middle-column-width)_minmax(0,1fr)] lg:overflow-hidden ${dragTarget ? 'sidebar-trip-active' : ''}`}
        >
            {children}
            <button
                type="button"
                role="separator"
                aria-label="Resize left sidebar"
                aria-orientation="vertical"
                aria-valuemin={MIN_SIDEBAR_WIDTH}
                aria-valuemax={MAX_SIDEBAR_WIDTH}
                aria-valuenow={Math.round(sidebarWidth)}
                data-active={dragTarget === 'left'}
                style={{
                    '--resize-handle-x': `${Math.round(sidebarWidth)}px`,
                } as CSSProperties}
                onPointerDown={(event) => handlePointerDown('left', event)}
                onPointerMove={(event) => handlePointerMove('left', event)}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={(event) => handleKeyDown('left', event)}
                className="sidebar-trip-handle group hidden lg:block"
            >
                <span className="sidebar-trip-core" />
            </button>
            <button
                type="button"
                role="separator"
                aria-label="Resize resource column"
                aria-orientation="vertical"
                aria-valuemin={MIN_MIDDLE_WIDTH}
                aria-valuemax={MAX_MIDDLE_WIDTH}
                aria-valuenow={Math.round(middleWidth)}
                data-active={dragTarget === 'middle'}
                style={{
                    '--resize-handle-x': `${Math.round(sidebarWidth + middleWidth)}px`,
                } as CSSProperties}
                onPointerDown={(event) => handlePointerDown('middle', event)}
                onPointerMove={(event) => handlePointerMove('middle', event)}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={(event) => handleKeyDown('middle', event)}
                className="sidebar-trip-handle group hidden lg:block"
            >
                <span className="sidebar-trip-core" />
            </button>
        </div>
    );
}
