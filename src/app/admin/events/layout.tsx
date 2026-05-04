import { notFound } from 'next/navigation';
import { areEventsEnabled } from '../../../lib/featureFlags';

export default function EventsAdminLayout({ children }: { children: React.ReactNode }) {
    if (!areEventsEnabled()) notFound();

    return children;
}
