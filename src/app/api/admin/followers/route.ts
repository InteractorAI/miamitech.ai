import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../lib/supabaseServer';

function isAuthorized(request: Request) {
    const expectedSecret = process.env.ADMIN_SECRET || process.env.EVENT_DISTRIBUTION_SECRET || process.env.CRON_SECRET || process.env.EVENT_INGEST_SECRET;
    if (!expectedSecret) return true;

    const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const adminSecret = request.headers.get('x-admin-secret');
    return bearer === expectedSecret || adminSecret === expectedSecret;
}

export async function GET(request: Request) {
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
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 500), 1), 1000);

    const { data, error } = await supabase
        .from('followers')
        .select(`
            id,
            display_name,
            email_normalized,
            phone_e164,
            email_opt_in,
            sms_opt_in,
            source,
            resend_contact_id,
            first_seen_at,
            last_seen_at,
            created_at,
            updated_at
        `)
        .order('updated_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to load followers', error);
        return NextResponse.json({ error: 'Failed to load followers.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, followers: data || [] });
}
