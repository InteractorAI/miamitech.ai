import { NextResponse } from 'next/server';
import { importManualEvent } from '../../../../../lib/events/manual';
import { areEventsEnabled } from '../../../../../lib/featureFlags';
import { getSupabaseAdminClient } from '../../../../../lib/supabaseServer';
import type { EntityType } from '../../../../../lib/events/types';

export async function POST(request: Request) {
    if (!areEventsEnabled()) {
        return NextResponse.json({ error: 'Events are disabled.' }, { status: 404 });
    }

    const expectedSecret = process.env.EVENT_DISTRIBUTION_SECRET || process.env.CRON_SECRET || process.env.EVENT_INGEST_SECRET;
    if (expectedSecret) {
        const receivedSecret =
            request.headers.get('x-admin-secret') ||
            request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
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

    let body: ManualEventRequestBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Request body must be JSON.' }, { status: 400 });
    }

    try {
        const result = await importManualEvent(supabase, {
            url: body.url || '',
            entityId: body.entityId,
            entityHandle: body.entityHandle,
            entityType: body.entityType,
        });

        return NextResponse.json({ ok: true, ...result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Manual event import failed.';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

interface ManualEventRequestBody {
    url?: string;
    entityId?: string;
    entityHandle?: string;
    entityType?: EntityType;
}
