import { SysInfo } from '../components/SysInfo';
import { CapitalIndex } from '../components/CapitalIndex';
import { SpacesDirectory } from '../components/SpacesDirectory';
import { AmbassadorsRegistry } from '../components/AmbassadorsRegistry';
import { Link } from 'react-router-dom';

export function Dashboard() {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header bar */}
            <header className="flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <h1 className="text-lg font-semibold text-fg-primary tracking-tight">
                    miamitech<span className="text-accent-pink">.ai</span>
                </h1>
                <Link
                    to="/capital"
                    className="text-xs font-medium text-fg-muted hover:text-accent-pink transition-colors"
                >
                    Full View →
                </Link>
            </header>

            {/* Main grid — no gaps, panels touch each other */}
            <div className="flex-1 grid grid-cols-12 min-h-0">
                {/* Left column */}
                <div className="col-span-3 flex flex-col border-r border-bg-border min-h-0">
                    <div className="border-b border-bg-border">
                        <SysInfo />
                    </div>
                    <div className="flex-1 border-b border-bg-border min-h-0 overflow-auto">
                        <SpacesDirectory />
                    </div>
                    <div>
                        <AmbassadorsRegistry />
                    </div>
                </div>

                {/* Main content — Capital takes 9 cols */}
                <div className="col-span-9 min-h-0">
                    <CapitalIndex />
                </div>
            </div>
        </div>
    );
}
