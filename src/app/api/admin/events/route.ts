import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../lib/supabaseServer';
import { areEventsEnabled } from '../../../../lib/featureFlags';

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

    const url = new URL(request.url);
    const windowDays = Number(url.searchParams.get('windowDays') || 45);
    const showHidden = url.searchParams.get('showHidden') === 'true';
    const now = new Date();
    const windowEnd = new Date(now);
    windowEnd.setDate(windowEnd.getDate() + (Number.isFinite(windowDays) ? windowDays : 45));

    let query = supabase
        .from('events')
        .select(`
            id,
            title,
            starts_at,
            canonical_url,
            source_name,
            location_text,
            status,
            hidden,
            pinned,
            promote_outbound,
            event_entities (
                relationship,
                entities (
                    type,
                    handle,
                    name
                )
            )
        `)
        .in('status', ['active', 'postponed'])
        .gte('starts_at', now.toISOString())
        .lt('starts_at', windowEnd.toISOString())
        .order('starts_at', { ascending: true });

    if (!showHidden) {
        query = query.eq('hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ ok: true, events: data || [] });
}

export async function POST(request: Request) {
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

    const body = await request.json().catch(() => null) as {
        id?: string;
        promoteOutbound?: boolean;
        hidden?: boolean;
        pinned?: boolean;
    } | null;

    if (!body?.id) {
        return NextResponse.json({ error: 'Missing event id.' }, { status: 400 });
    }

    const updates: Record<string, boolean | string> = {
        updated_at: new Date().toISOString(),
    };

    if (typeof body.promoteOutbound === 'boolean') updates.promote_outbound = body.promoteOutbound;
    if (typeof body.hidden === 'boolean') updates.hidden = body.hidden;
    if (typeof body.pinned === 'boolean') updates.pinned = body.pinned;

    if (Object.keys(updates).length === 1) {
        return NextResponse.json({ error: 'No supported updates provided.' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', body.id)
        .select('id, hidden, pinned, promote_outbound')
        .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, event: data });
}
