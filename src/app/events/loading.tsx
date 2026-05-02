import Link from 'next/link';
import { Panel } from '../../components/TerminalBlock';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function EventsLoading() {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            <header className="flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <Link href="/" className="text-xs font-medium text-fg-muted">
                    ← Home
                </Link>
                <h1 className="text-sm font-semibold text-fg-primary tracking-tight">
                    Events
                </h1>
                <div className="w-16 flex justify-end">
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 min-h-0">
                <Panel title="Events" subtitle="..." noPadding className="h-full">
                    <div className="p-5 space-y-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="h-20 bg-bg-elevated rounded animate-pulse" style={{ opacity: 1 - i * 0.06 }} />
                        ))}
                    </div>
                </Panel>
            </div>
        </div>
    );
}
