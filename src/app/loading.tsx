import type { ReactNode } from 'react';
import { SysInfo } from '../components/SysInfo';
import { CapitalIndex } from '../components/CapitalIndex';
import { EventsFeed } from '../components/EventsFeed';
import { Credits } from '../components/Credits';
import { Sponsors } from '../components/Sponsors';
import { ThemeToggle } from '../components/ThemeToggle';
import { QuickSearchHint } from '../components/QuickSearch';
import Link from 'next/link';
import { MobileNav } from '../components/MobileNav';
import { areEventsEnabled } from '../lib/featureFlags';
import { Panel } from '../components/TerminalBlock';

function TabSkeleton() {
    return (
        <div className="flex items-center gap-1 overflow-hidden py-1">
            <div className="h-8 w-20 rounded-md bg-bg-elevated animate-pulse" />
            <div className="h-8 w-16 rounded-md bg-bg-elevated animate-pulse opacity-70" />
        </div>
    );
}

function RowSkeleton({
    index,
    withIcon = true,
    withActions = true,
    withMeta = true,
}: {
    index: number;
    withIcon?: boolean;
    withActions?: boolean;
    withMeta?: boolean;
}) {
    const widths = ['72%', '58%', '66%', '48%', '62%', '54%'];
    const metaWidths = ['42%', '55%', '38%', '46%', '50%', '34%'];

    return (
        <div className="flex min-h-[56px] items-center justify-between gap-3 border-b border-bg-border-subtle px-5 py-3 last:border-b-0">
            <div className="flex min-w-0 flex-1 items-center gap-2">
                {withIcon && (
                    <div
                        className="h-4 w-4 shrink-0 rounded bg-bg-elevated animate-pulse"
                        style={{ opacity: Math.max(0.48, 0.9 - index * 0.06) }}
                    />
                )}
                <div className="min-w-0 flex-1">
                    <div
                        className="h-4 rounded bg-bg-elevated animate-pulse"
                        style={{ width: widths[index % widths.length], opacity: Math.max(0.5, 0.92 - index * 0.05) }}
                    />
                    {withMeta && (
                        <div
                            className="mt-2 h-3 rounded bg-bg-elevated animate-pulse"
                            style={{ width: metaWidths[index % metaWidths.length], opacity: Math.max(0.35, 0.58 - index * 0.03) }}
                        />
                    )}
                </div>
            </div>
            {withActions && (
                <div className="hidden shrink-0 items-center gap-3 sm:flex">
                    <div className="h-5 w-5 rounded bg-bg-elevated animate-pulse opacity-60" />
                    <div className="h-5 w-5 rounded-full bg-bg-elevated animate-pulse opacity-50" />
                </div>
            )}
        </div>
    );
}

function SectionSkeleton({
    title,
    subtitle,
    rows = 4,
    action,
    withIcon = true,
    withActions = true,
    withMeta = true,
}: {
    title: string;
    subtitle?: string;
    rows?: number;
    action?: ReactNode;
    withIcon?: boolean;
    withActions?: boolean;
    withMeta?: boolean;
}) {
    return (
        <Panel title={title} subtitle={subtitle} noPadding action={action}>
            <div aria-label={`Loading ${title.toLowerCase()}`}>
                {Array.from({ length: rows }).map((_, index) => (
                    <RowSkeleton
                        key={index}
                        index={index}
                        withIcon={withIcon}
                        withActions={withActions}
                        withMeta={withMeta}
                    />
                ))}
            </div>
        </Panel>
    );
}

export default function HomeLoading() {
    const showEvents = areEventsEnabled();

    return (
        <div className="h-full flex flex-col overflow-hidden opacity-60 pointer-events-none transition-opacity duration-300">
            {/* Global quick-search modal */}
            <div className="site-spectrum h-1 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green shrink-0 animate-pulse" />
            <header className="site-header flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <Link href="/" className="text-2xl font-bold text-fg-primary tracking-tight cursor-pointer">
                    miamitech<span className="text-accent-pink">.ai</span>
                </Link>
                <div className="flex items-center gap-3">
                    <Credits />
                    <ThemeToggle />
                </div>
            </header>

            <MobileNav showEvents={showEvents} />

            <div className="site-grid flex-1 flex flex-col min-[900px]:grid min-[900px]:grid-cols-12 min-h-0 overflow-auto min-[900px]:overflow-hidden">
                {/* Left column */}
                <div className="shrink-0 min-[900px]:col-span-3 min-[900px]:flex min-[900px]:flex-col min-[900px]:border-r border-bg-border min-[900px]:min-h-0 min-[900px]:overflow-auto">
                    <div id="about" className="border-b border-bg-border scroll-mt-12">
                        <SysInfo />
                    </div>
                    <div className="border-b border-bg-border">
                        <SectionSkeleton title="Follow" rows={1} withIcon={false} withActions={false} />
                    </div>
                    <div className="border-b border-bg-border">
                        <Sponsors />
                    </div>
                    <div className="hidden min-[900px]:block border-b border-bg-border min-[900px]:border-b-0">
                        <QuickSearchHint />
                    </div>
                </div>

                {/* Middle column */}
                <div className="shrink-0 min-[900px]:col-span-4 min-[900px]:flex min-[900px]:flex-col min-[900px]:border-r border-bg-border min-[900px]:min-h-0 min-[900px]:overflow-auto">
                    <div id="spaces" className="border-b border-bg-border scroll-mt-12">
                        <SectionSkeleton title="Spaces" rows={4} action={<TabSkeleton />} />
                    </div>
                    <div id="communities" className="border-b border-bg-border scroll-mt-12">
                        <SectionSkeleton title="Communities" subtitle="..." rows={4} />
                    </div>
                    {showEvents && (
                        <div id="events" className="border-b border-bg-border scroll-mt-12 min-[900px]:hidden">
                            <EventsFeed events={[]} loading />
                        </div>
                    )}
                    <div id="conferences" className="border-b border-bg-border scroll-mt-12">
                        <SectionSkeleton title="Conferences" subtitle="..." rows={5} />
                    </div>
                    <div id="ambassadors" className="border-b border-bg-border scroll-mt-12">
                        <SectionSkeleton title="Ambassadors" subtitle="..." rows={5} withIcon={false} withMeta={false} />
                    </div>
                    <div id="accelerators" className="border-b border-bg-border scroll-mt-12">
                        <SectionSkeleton title="Accelerators" subtitle="..." rows={5} />
                    </div>
                    <div id="news" className="border-b border-bg-border scroll-mt-12">
                        <SectionSkeleton title="News" subtitle="..." rows={4} />
                    </div>
                    <div id="faq" className="border-b border-bg-border min-[900px]:border-b-0 scroll-mt-12">
                        <SectionSkeleton title="FAQ" rows={5} withIcon={false} withActions={false} />
                    </div>
                </div>

                {/* Right column: optional Events + Capital */}
                <div className="min-h-[60vh] min-[900px]:min-h-0 min-[900px]:col-span-5 min-[900px]:flex min-[900px]:flex-col min-[900px]:overflow-auto">
                    {showEvents && (
                        <div className="hidden border-b border-bg-border scroll-mt-12 min-[900px]:block">
                            <EventsFeed events={[]} loading />
                        </div>
                    )}
                    <div id="capital" className="scroll-mt-12">
                        <CapitalIndex data={[]} loading={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}
