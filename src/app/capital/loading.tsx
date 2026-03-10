import { CapitalIndex } from '../../components/CapitalIndex';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function CapitalLoading() {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <Link
                    href="/"
                    className="text-xs font-medium text-fg-muted hover:text-fg-primary transition-colors"
                >
                    ← Home
                </Link>
                <h1 className="text-sm font-semibold text-fg-primary tracking-tight">
                    Capital Index
                </h1>
                <div className="w-16 flex justify-end">
                    <ThemeToggle />
                </div>
            </header>

            {/* Full Capital view skeleton */}
            <div className="flex-1 min-h-0">
                <CapitalIndex data={[]} loading={true} expanded />
            </div>
        </div>
    );
}
