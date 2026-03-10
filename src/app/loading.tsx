import { SysInfo } from '../components/SysInfo';
import { CapitalIndex } from '../components/CapitalIndex';
import { SpacesDirectory } from '../components/SpacesDirectory';
import { CommunitiesDirectory } from '../components/CommunitiesDirectory';
import { ConferencesDirectory } from '../components/ConferencesDirectory';
import { AmbassadorsRegistry } from '../components/AmbassadorsRegistry';
import { NewsSources } from '../components/NewsSources';
import { Credits } from '../components/Credits';
import { FAQ } from '../components/FAQ';
import { Sponsors } from '../components/Sponsors';
import { ThemeToggle } from '../components/ThemeToggle';
import { QuickSearchHint } from '../components/QuickSearch';
import Link from 'next/link';
import { MobileNav } from '../components/MobileNav';

export default function HomeLoading() {
    return (
        <div className="h-full flex flex-col overflow-hidden opacity-60 pointer-events-none transition-opacity duration-300">
            {/* Global quick-search modal */}
            <div className="h-1 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green shrink-0 animate-pulse" />
            <header className="flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <Link href="/" className="text-2xl font-bold text-fg-primary tracking-tight cursor-pointer">
                    miamitech<span className="text-accent-pink">.ai</span>
                </Link>
                <div className="flex items-center gap-3">
                    <Credits />
                    <ThemeToggle />
                </div>
            </header>

            <MobileNav />

            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0 overflow-auto lg:overflow-hidden">
                {/* Left column */}
                <div className="shrink-0 lg:col-span-3 lg:flex lg:flex-col lg:border-r border-bg-border lg:min-h-0 lg:overflow-auto">
                    <div id="about" className="border-b border-bg-border scroll-mt-12">
                        <SysInfo />
                    </div>
                    <div className="border-b border-bg-border">
                        <Sponsors />
                    </div>
                    <div className="hidden lg:block border-b border-bg-border lg:border-b-0">
                        <QuickSearchHint />
                    </div>
                </div>

                {/* Middle column */}
                <div className="shrink-0 lg:col-span-4 lg:flex lg:flex-col lg:border-r border-bg-border lg:min-h-0 lg:overflow-auto animate-pulse">
                    <div id="spaces" className="border-b border-bg-border scroll-mt-12">
                        <SpacesDirectory initialData={[]} />
                    </div>
                    <div id="communities" className="border-b border-bg-border scroll-mt-12">
                        <CommunitiesDirectory initialData={[]} />
                    </div>
                    <div id="conferences" className="border-b border-bg-border scroll-mt-12">
                        <ConferencesDirectory initialData={[]} />
                    </div>
                    <div id="ambassadors" className="border-b border-bg-border scroll-mt-12">
                        <AmbassadorsRegistry initialData={[]} />
                    </div>
                    <div id="news" className="border-b border-bg-border scroll-mt-12">
                        <NewsSources />
                    </div>
                    <div id="faq" className="border-b border-bg-border lg:border-b-0 scroll-mt-12">
                        <FAQ />
                    </div>
                </div>

                {/* Right column: Capital */}
                <div id="capital" className="min-h-[60vh] lg:min-h-0 lg:col-span-5 lg:flex-1 flex flex-col lg:overflow-hidden scroll-mt-12">
                    <CapitalIndex data={[]} loading={true} />
                </div>
            </div>
        </div>
    );
}
