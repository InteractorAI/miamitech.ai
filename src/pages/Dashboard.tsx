import { SysInfo } from '../components/SysInfo';
import { AskAI } from '../components/AskAI';
import { CapitalIndex } from '../components/CapitalIndex';
import { SpacesDirectory } from '../components/SpacesDirectory';
import { CommunitiesDirectory } from '../components/CommunitiesDirectory';
import { AmbassadorsRegistry } from '../components/AmbassadorsRegistry';
import { NewsSources } from '../components/NewsSources';
import { Credits } from '../components/Credits';
import { FAQ } from '../components/FAQ';
import { Sponsors } from '../components/Sponsors';
import { ThemeToggle } from '../components/ThemeToggle';
import { useCapitalData } from '../hooks/useSheetData';

const SECTIONS = ['About', 'Ask anything', 'Spaces', 'Communities', 'Ambassadors', 'News', 'FAQ', 'Capital'] as const;

export function Dashboard() {
    const { data, loading } = useCapitalData();

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green shrink-0" />
            <header className="flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <h1
                    className="text-2xl font-bold text-fg-primary tracking-tight cursor-pointer"
                    onClick={() => window.location.reload()}
                >
                    miamitech<span className="text-accent-pink">.ai</span>
                </h1>
                <div className="flex items-center gap-3">
                    <Credits />
                    <ThemeToggle />
                </div>
            </header>

            <nav className="lg:hidden flex items-center gap-1 px-4 py-2 bg-bg-card/90 backdrop-blur-sm border-b border-bg-border shrink-0 sticky top-0 z-20 overflow-x-auto">
                {SECTIONS.map(s => (
                    <button
                        key={s}
                        onClick={() => scrollTo(s.toLowerCase().replace(' ', '-'))}
                        className="text-[11px] px-3 py-1.5 rounded-md font-medium text-fg-muted hover:text-fg-secondary hover:bg-bg-hover transition-all duration-150 whitespace-nowrap"
                    >
                        {s}
                    </button>
                ))}
            </nav>

            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0 overflow-auto lg:overflow-hidden">
                {/* Left column: identity + AI + sponsors */}
                <div className="shrink-0 lg:col-span-3 lg:flex lg:flex-col lg:border-r border-bg-border lg:min-h-0 lg:overflow-auto">
                    <div id="about" className="border-b border-bg-border scroll-mt-12">
                        <SysInfo />
                    </div>
                    <div id="ask-ai" className="border-b border-bg-border scroll-mt-12">
                        <AskAI />
                    </div>
                    <div className="border-b border-bg-border lg:border-b-0">
                        <Sponsors />
                    </div>
                </div>

                {/* Middle column: community directories */}
                <div className="shrink-0 lg:col-span-4 lg:flex lg:flex-col lg:border-r border-bg-border lg:min-h-0 lg:overflow-auto">
                    <div id="spaces" className="border-b border-bg-border scroll-mt-12">
                        <SpacesDirectory />
                    </div>
                    <div id="communities" className="border-b border-bg-border scroll-mt-12">
                        <CommunitiesDirectory />
                    </div>
                    <div id="ambassadors" className="border-b border-bg-border scroll-mt-12">
                        <AmbassadorsRegistry />
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
                    <CapitalIndex data={data} loading={loading} />
                </div>
            </div>
        </div>
    );
}
