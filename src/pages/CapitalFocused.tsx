import { CapitalIndex } from '../components/CapitalIndex';
import { Link } from 'react-router-dom';

export function CapitalFocused() {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <Link
                    to="/"
                    className="text-xs font-medium text-fg-muted hover:text-fg-primary transition-colors"
                >
                    ← Dashboard
                </Link>
                <h1 className="text-sm font-semibold text-fg-primary tracking-tight">
                    Capital Index
                </h1>
                <div className="w-16" />
            </header>

            {/* Full Capital view */}
            <div className="flex-1 min-h-0">
                <CapitalIndex expanded />
            </div>
        </div>
    );
}
