import { NextResponse } from 'next/server';
import { ingestEventSources } from '../../../../lib/events/ingest';
import { syncSheetEntities } from '../../../../lib/events/sync';
import { getSupabaseAdminClient } from '../../../../lib/supabaseServer';

export async function POST(request: Request) {
    const expectedSecret = process.env.CRON_SECRET || process.env.EVENT_INGEST_SECRET;
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

    const sync = await syncSheetEntities(supabase);
    const ingest = await ingestEventSources(supabase);

    return NextResponse.json({ ok: true, sync, ingest });
}

export async function GET(request: Request) {
    return POST(request);
}
