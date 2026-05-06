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
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 100), 1), 500);

    const { data, error } = await supabase
        .from('email_inbox_messages')
        .select(`
            id,
            provider,
            provider_event_id,
            provider_email_id,
            message_id,
            from_text,
            to_addresses,
            cc_addresses,
            bcc_addresses,
            subject,
            attachment_count,
            received_at
        `)
        .order('received_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to load inbox messages', error);
        return NextResponse.json({ error: 'Failed to load inbox messages.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, messages: data || [] });
}
