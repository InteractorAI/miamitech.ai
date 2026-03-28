import { Panel } from '../../components/TerminalBlock';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function Loading() {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <Link href="/" className="text-xs font-medium text-fg-muted">
                    ← Home
                </Link>
                <h1 className="text-sm font-semibold text-fg-primary tracking-tight">
                    Accelerators Directory
                </h1>
                <div className="w-16 flex justify-end">
                    <ThemeToggle />
                </div>
            </header>

            {/* Skeleton view */}
            <div className="flex-1 min-h-0">
                <Panel title="Accelerators" subtitle="..." noPadding className="h-full">
                    <div className="p-5 space-y-4">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="h-10 bg-bg-elevated rounded animate-pulse" style={{ opacity: 1 - i * 0.05 }} />
                        ))}
                    </div>
                </Panel>
            </div>
        </div>
    );
}
