import { NextResponse } from 'next/server';
import { getUpcomingEvents } from '../../../lib/events/query';
import { areEventsEnabled } from '../../../lib/featureFlags';

export async function GET(request: Request) {
    if (!areEventsEnabled()) {
        return NextResponse.json({ error: 'Events are disabled.' }, { status: 404 });
    }

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || 10);
    const events = await getUpcomingEvents(Number.isFinite(limit) ? limit : 10);
    return NextResponse.json({ events });
}
