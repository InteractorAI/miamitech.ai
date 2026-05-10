import { NextResponse } from 'next/server';
import { getWeeklyXDigestComposer } from '../../../../lib/events/distribution';
import { areEventsEnabled } from '../../../../lib/featureFlags';
import { getSupabaseAdminClient } from '../../../../lib/supabaseServer';

function isAuthorized(request: Request) {
    const expectedSecret = process.env.EVENT_DISTRIBUTION_SECRET || process.env.CRON_SECRET || process.env.EVENT_INGEST_SECRET;
    if (!expectedSecret) return true;

    const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const adminSecret = request.headers.get('x-admin-secret');
    return bearer === expectedSecret || adminSecret === expectedSecret;
}

export async function GET(request: Request) {
    if (!areEventsEnabled()) {
        return NextResponse.json({ error: 'Events are disabled.' }, { status: 404 });
    }

    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
        return NextResponse.json({
            error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        }, { status: 500 });
    }

    const digest = await getWeeklyXDigestComposer(supabase);

    return NextResponse.json({
        ok: true,
        digest,
    });
}

export async function POST(request: Request) {
    return GET(request);
}
