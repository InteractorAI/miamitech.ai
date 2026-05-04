import { SysInfo } from '../components/SysInfo';
import { CapitalIndex } from '../components/CapitalIndex';
import { SpacesDirectory } from '../components/SpacesDirectory';
import { CommunitiesDirectory } from '../components/CommunitiesDirectory';
import { ConferencesDirectory } from '../components/ConferencesDirectory';
import { AmbassadorsRegistry } from '../components/AmbassadorsRegistry';
import { AcceleratorsRegistry } from '../components/AcceleratorsRegistry';
import { NewsSources } from '../components/NewsSources';
import { EventsFeed } from '../components/EventsFeed';
import { Credits } from '../components/Credits';
import { FAQ } from '../components/FAQ';
import { Sponsors } from '../components/Sponsors';
import { ThemeToggle } from '../components/ThemeToggle';
import { QuickSearch, QuickSearchHint } from '../components/QuickSearch';
import Link from 'next/link';
import { MobileNav } from '../components/MobileNav';
import { HomeScrollContainer } from '../components/HomeScrollContainer';

// Server-side data fetching
import { SHEET_CONFIG, mappers, parseSheetCSV } from '../lib/googleSheets';
import { getUpcomingEvents } from '../lib/events/query';
import { areEventsEnabled } from '../lib/featureFlags';

export const dynamic = 'force-dynamic';

async function fetchSheetData<T>(gid: string, mapper: any, skipRows: number): Promise<T[]> {
    try {
        const url = `${SHEET_CONFIG.BASE_URL}&gid=${gid}`;
        const res = await fetch(url, { next: { revalidate: 0 } });
        const text = await res.text();
        return parseSheetCSV(text, mapper, skipRows);
    } catch (e) {
        console.error('Failed to fetch sheet data', e);
        return [];
    }
}

export default async function Dashboard() {
    const showEvents = areEventsEnabled();
    const [capitalData, spacesData, coffeeShopsData, communitiesData, conferencesData, ambassadorsData, newsData, faqData, acceleratorsData, eventsData] = await Promise.all([
        fetchSheetData<any>(SHEET_CONFIG.TABS.VCs, mappers.capital, 4),
        fetchSheetData<any>(SHEET_CONFIG.TABS.Spaces, mappers.spaces, 1),
        fetchSheetData<any>(SHEET_CONFIG.TABS.CoffeeShops, mappers.coffeeShops, 1),
        fetchSheetData<any>(SHEET_CONFIG.TABS.Communities, mappers.communities, 1),
        fetchSheetData<any>(SHEET_CONFIG.TABS.Conferences, mappers.conferences, 1),
        fetchSheetData<any>(SHEET_CONFIG.TABS.Ambassadors, mappers.ambassadors, 1),
        fetchSheetData<any>(SHEET_CONFIG.TABS.News, mappers.news, 1),
        fetchSheetData<any>(SHEET_CONFIG.TABS.FAQs, mappers.faqs, 1),
        fetchSheetData<any>(SHEET_CONFIG.TABS.Accelerators, mappers.accelerators, 1),
        showEvents ? getUpcomingEvents(40) : Promise.resolve([]),
    ]);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Global quick-search modal */}
            <QuickSearch />

            <div className="h-1 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green shrink-0" />
            <header className="flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <Link href="/" className="cursor-pointer">
                    <h1 className="text-2xl font-bold text-fg-primary tracking-tight">
                        miamitech<span className="text-accent-pink">.ai</span>
                    </h1>
                </Link>
                <div className="flex items-center gap-3">
                    <Credits />
                    <ThemeToggle />
                </div>
            </header>

            <MobileNav showEvents={showEvents} />

            <HomeScrollContainer>
                {/* Left column */}
                <div className="shrink-0 min-[900px]:col-auto min-[900px]:flex min-[900px]:flex-col min-[900px]:border-r border-bg-border min-[900px]:min-h-0 min-[900px]:overflow-auto">
                    <div id="about" className="border-b border-bg-border scroll-mt-12">
                        <SysInfo />
                    </div>
                    <div className="border-b border-bg-border">
                        <Sponsors />
                    </div>
                    <div className="hidden min-[900px]:block border-b border-bg-border min-[900px]:border-b-0">
                        <QuickSearchHint />
                    </div>
                </div>

                {/* Middle column */}
                <div className="shrink-0 min-[900px]:col-auto min-[900px]:flex min-[900px]:flex-col min-[900px]:border-r border-bg-border min-[900px]:min-h-0 min-[900px]:overflow-auto">
                    <div id="spaces" className="border-b border-bg-border scroll-mt-12">
                        <SpacesDirectory initialData={spacesData} coffeeShops={coffeeShopsData} />
                    </div>
                    <div id="communities" className="border-b border-bg-border scroll-mt-12">
                        <CommunitiesDirectory initialData={communitiesData} />
                    </div>
                    <div id="conferences" className="border-b border-bg-border scroll-mt-12">
                        <ConferencesDirectory initialData={conferencesData} />
                    </div>
                    <div id="ambassadors" className="border-b border-bg-border scroll-mt-12">
                        <AmbassadorsRegistry initialData={ambassadorsData} />
                    </div>
                    <div id="accelerators" className="border-b border-bg-border scroll-mt-12">
                        <AcceleratorsRegistry initialData={acceleratorsData} />
                    </div>
                    <div id="news" className="border-b border-bg-border scroll-mt-12">
                        <NewsSources initialData={newsData} />
                    </div>
                    <div id="faq" className="border-b border-bg-border min-[900px]:border-b-0 scroll-mt-12">
                        <FAQ initialData={faqData} />
                    </div>
                </div>

                {/* Right column: optional Events + Capital */}
                <div className="min-h-[60vh] min-[900px]:min-h-0 min-[900px]:col-auto min-[900px]:flex min-[900px]:flex-col min-[900px]:overflow-auto">
                    {showEvents && (
                        <div id="events" className="border-b border-bg-border scroll-mt-12">
                            <EventsFeed events={eventsData} />
                        </div>
                    )}
                    <div id="capital" className="scroll-mt-12">
                        <CapitalIndex data={capitalData} loading={false} />
                    </div>
                </div>
            </HomeScrollContainer>
        </div>
    );
}
