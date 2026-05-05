import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventsFeed } from '../../components/EventsFeed';
import { ThemeToggle } from '../../components/ThemeToggle';
import { getUpcomingEvents } from '../../lib/events/query';
import { areEventsEnabled } from '../../lib/featureFlags';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Miami Tech Events — MiamiTech.ai',
    description: 'Upcoming tech, startup, AI, and community events across the Miami ecosystem.',
    openGraph: {
        title: 'Miami Tech Events — MiamiTech.ai',
        description: 'Upcoming tech, startup, AI, and community events across the Miami ecosystem.',
        url: 'https://miamitech.ai/events',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Miami Tech Events — MiamiTech.ai',
        description: 'Upcoming tech, startup, AI, and community events across the Miami ecosystem.',
        images: ['/og-image.png'],
    },
};

export default async function EventsFocused() {
    if (!areEventsEnabled()) notFound();

    const events = await getUpcomingEvents(80);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <header className="flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <Link
                    href="/"
                    className="text-xs font-medium text-fg-muted hover:text-fg-primary transition-colors"
                >
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
                <EventsFeed events={events} expanded />
            </div>
        </div>
    );
}
