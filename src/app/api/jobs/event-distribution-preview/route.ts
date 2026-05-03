import { NextResponse } from 'next/server';
import {
    enqueueEventDistributionJobs,
    ensureWeeklyDigestJobs,
    previewEventDistributionJobs,
} from '../../../../lib/events/distribution';
import { getSupabaseAdminClient } from '../../../../lib/supabaseServer';

export async function POST(request: Request) {
    const expectedSecret = process.env.EVENT_DISTRIBUTION_SECRET || process.env.CRON_SECRET || process.env.EVENT_INGEST_SECRET;
    if (expectedSecret) {
        const receivedSecret = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
        if (receivedSecret !== expectedSecret) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
        return NextResponse.json({
            error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        }, { status: 500 });
    }

    const url = new URL(request.url);
    const windowDays = Number(url.searchParams.get('windowDays') || 14);
    const limit = Number(url.searchParams.get('limit') || 50);
    const shouldEnqueue = url.searchParams.get('enqueue') !== 'false';
    const includeDigest = url.searchParams.get('includeDigest') !== 'false';

    const enqueue = shouldEnqueue
        ? {
            reminders: await enqueueEventDistributionJobs(supabase),
            digest: includeDigest ? await ensureWeeklyDigestJobs(supabase) : null,
        }
        : null;

    const previews = await previewEventDistributionJobs(supabase, {
        windowDays: Number.isFinite(windowDays) ? windowDays : 14,
        limit: Number.isFinite(limit) ? limit : 50,
        includeDigest,
    });

    return NextResponse.json({
        ok: true,
        enqueue,
        previews,
    });
}

export async function GET(request: Request) {
    return POST(request);
}
