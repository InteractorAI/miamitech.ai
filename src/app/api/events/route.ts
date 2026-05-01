import { NextResponse } from 'next/server';
import { getUpcomingEvents } from '../../../lib/events/query';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || 10);
    const events = await getUpcomingEvents(Number.isFinite(limit) ? limit : 10);
    return NextResponse.json({ events });
}
