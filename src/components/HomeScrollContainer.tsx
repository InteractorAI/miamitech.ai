'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

const SCROLL_KEY = 'miamitech.home.scrollTop';
const SIDEBAR_WIDTH_KEY = 'miamitech.home.sidebarWidth';
const MIDDLE_WIDTH_KEY = 'miamitech.home.middleWidth';
const LEFT_KNOB_KEY = 'miamitech.home.leftKnobY';
const MIDDLE_KNOB_KEY = 'miamitech.home.middleKnobY';
const DEFAULT_SIDEBAR_WIDTH = 320;
const DEFAULT_MIDDLE_WIDTH = 560;
const DEFAULT_KNOB_Y = 50;
const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 540;
const MIN_MIDDLE_WIDTH = 360;
const MAX_MIDDLE_WIDTH = 760;
const MIN_RIGHT_WIDTH = 520;
const MIN_KNOB_Y = 10;
const MAX_KNOB_Y = 90;

type DragTarget = 'left' | 'middle';
type DragMode = 'resize' | 'move-knob';

export function HomeScrollContainer({ children }: { children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const isRestoring = useRef(false);
    const dragStart = useRef<{ x: number; y: number; mode: DragMode | null } | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
    const [middleWidth, setMiddleWidth] = useState(DEFAULT_MIDDLE_WIDTH);
    const [leftKnobY, setLeftKnobY] = useState(DEFAULT_KNOB_Y);
    const [middleKnobY, setMiddleKnobY] = useState(DEFAULT_KNOB_Y);
    const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);

    useEffect(() => {
        const savedSidebar = sessionStorage.getItem(SIDEBAR_WIDTH_KEY);
        const savedMiddle = sessionStorage.getItem(MIDDLE_WIDTH_KEY);
        const savedLeftKnob = sessionStorage.getItem(LEFT_KNOB_KEY);
        const savedMiddleKnob = sessionStorage.getItem(MIDDLE_KNOB_KEY);
        const parsedSidebar = Number(savedSidebar);
        const parsedMiddle = Number(savedMiddle);
        const parsedLeftKnob = Number(savedLeftKnob);
        const parsedMiddleKnob = Number(savedMiddleKnob);

        if (Number.isFinite(parsedSidebar)) {
            setSidebarWidth(Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, parsedSidebar)));
        }
        if (Number.isFinite(parsedMiddle)) {
            setMiddleWidth(Math.min(MAX_MIDDLE_WIDTH, Math.max(MIN_MIDDLE_WIDTH, parsedMiddle)));
        }
        if (Number.isFinite(parsedLeftKnob)) {
            setLeftKnobY(Math.min(MAX_KNOB_Y, Math.max(MIN_KNOB_Y, parsedLeftKnob)));
        }
        if (Number.isFinite(parsedMiddleKnob)) {
            setMiddleKnobY(Math.min(MAX_KNOB_Y, Math.max(MIN_KNOB_Y, parsedMiddleKnob)));
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
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        return () => {
            document.body.style.cursor = previousCursor;
            document.body.style.userSelect = previousSelect;
        };
    }, [dragTarget]);

    function getContainerWidth() {
        return ref.current?.getBoundingClientRect().width ?? 0;
    }

    function updateWidth(target: DragTarget, clientX: number) {
        if (!ref.current) return;
        const bounds = ref.current.getBoundingClientRect();
        const x = clientX - bounds.left;

        if (target === 'left') {
            setSidebarWidthValue(x);
            return;
        }

        setMiddleWidthValue(x - sidebarWidth);
    }

    function updateKnobY(target: DragTarget, clientY: number) {
        if (!ref.current) return;
        const bounds = ref.current.getBoundingClientRect();
        const nextY = Math.min(MAX_KNOB_Y, Math.max(MIN_KNOB_Y, ((clientY - bounds.top) / bounds.height) * 100));
        setKnobYValue(target, nextY);
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

    function setKnobYValue(target: DragTarget, y: number) {
        const nextY = Math.min(MAX_KNOB_Y, Math.max(MIN_KNOB_Y, y));
        if (target === 'left') {
            setLeftKnobY(nextY);
            sessionStorage.setItem(LEFT_KNOB_KEY, String(Math.round(nextY)));
            return;
        }
        setMiddleKnobY(nextY);
        sessionStorage.setItem(MIDDLE_KNOB_KEY, String(Math.round(nextY)));
    }

    function handlePointerDown(target: DragTarget, event: PointerEvent<HTMLButtonElement>) {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragStart.current = { x: event.clientX, y: event.clientY, mode: null };
        setDragTarget(target);
    }

    function handlePointerMove(target: DragTarget, event: PointerEvent<HTMLButtonElement>) {
        if (dragTarget !== target) return;
        if (!dragStart.current) return;

        const deltaX = event.clientX - dragStart.current.x;
        const deltaY = event.clientY - dragStart.current.y;

        if (!dragStart.current.mode && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 3) {
            dragStart.current.mode = Math.abs(deltaX) >= Math.abs(deltaY) ? 'resize' : 'move-knob';
        }

        if (dragStart.current.mode === 'resize') {
            updateWidth(target, event.clientX);
        } else if (dragStart.current.mode === 'move-knob') {
            updateKnobY(target, event.clientY);
        }
    }

    function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        dragStart.current = null;
        setDragTarget(null);
    }

    function handleKeyDown(target: DragTarget, event: KeyboardEvent<HTMLButtonElement>) {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();

        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            const direction = event.key === 'ArrowUp' ? -1 : 1;
            const currentY = target === 'left' ? leftKnobY : middleKnobY;
            setKnobYValue(target, currentY + direction * 4);
            return;
        }

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
                    '--resize-knob-y': `${leftKnobY}%`,
                } as CSSProperties}
                onPointerDown={(event) => handlePointerDown('left', event)}
                onPointerMove={(event) => handlePointerMove('left', event)}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={(event) => handleKeyDown('left', event)}
                className="sidebar-trip-handle group hidden lg:block"
            >
                <span className="sidebar-trip-core" />
                <span className="sidebar-trip-grip" />
                <span className="sidebar-trip-readout">{Math.round(sidebarWidth)}px</span>
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
                    '--resize-knob-y': `${middleKnobY}%`,
                } as CSSProperties}
                onPointerDown={(event) => handlePointerDown('middle', event)}
                onPointerMove={(event) => handlePointerMove('middle', event)}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={(event) => handleKeyDown('middle', event)}
                className="sidebar-trip-handle group hidden lg:block"
            >
                <span className="sidebar-trip-core" />
                <span className="sidebar-trip-grip" />
                <span className="sidebar-trip-readout">{Math.round(middleWidth)}px</span>
            </button>
        </div>
    );
}
