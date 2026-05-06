import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseAdminClient } from '../../../../lib/supabaseServer';

export const runtime = 'nodejs';

type EmailReceivedPayload = {
    type?: unknown;
    created_at?: unknown;
    data?: {
        email_id?: unknown;
        created_at?: unknown;
        from?: unknown;
        to?: unknown;
        cc?: unknown;
        bcc?: unknown;
        message_id?: unknown;
        subject?: unknown;
        attachments?: unknown;
    };
};

function toStringValue(value: unknown) {
    return typeof value === 'string' ? value : null;
}

function toStringArray(value: unknown) {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === 'string');
}

function toDateString(value: unknown) {
    if (typeof value !== 'string') return new Date().toISOString();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function POST(request: NextRequest) {
    const apiKey = process.env.RESEND_API_KEY;
    const webhookSecret = process.env.EMAIL_WEBHOOK_SECRET || process.env.RESEND_WEBHOOK_SECRET;

    if (!apiKey || !webhookSecret) {
        return NextResponse.json({ error: 'Email webhook is not configured.' }, { status: 503 });
    }

    const providerEventId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    if (!providerEventId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: 'Missing webhook signature.' }, { status: 400 });
    }

    const payload = await request.text();
    const resend = new Resend(apiKey);
    let event: EmailReceivedPayload;

    try {
        event = resend.webhooks.verify({
            payload,
            headers: {
                id: providerEventId,
                timestamp: svixTimestamp,
                signature: svixSignature,
            },
            webhookSecret,
        }) as EmailReceivedPayload;
    } catch {
        return NextResponse.json({ error: 'Invalid webhook.' }, { status: 400 });
    }

    if (event.type !== 'email.received') {
        return NextResponse.json({ ok: true, ignored: true });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
        return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }

    const attachments = Array.isArray(event.data?.attachments) ? event.data.attachments : [];
    const { error } = await supabase
        .from('email_inbox_messages')
        .upsert({
            provider: 'resend',
            provider_event_id: providerEventId,
            provider_email_id: toStringValue(event.data?.email_id),
            message_id: toStringValue(event.data?.message_id),
            from_text: toStringValue(event.data?.from),
            to_addresses: toStringArray(event.data?.to),
            cc_addresses: toStringArray(event.data?.cc),
            bcc_addresses: toStringArray(event.data?.bcc),
            subject: toStringValue(event.data?.subject),
            attachment_count: attachments.length,
            raw_payload: event,
            received_at: toDateString(event.data?.created_at || event.created_at),
        }, { onConflict: 'provider,provider_event_id' });

    if (error) {
        console.error('Failed to log inbound email', error);
        return NextResponse.json({ error: 'Could not log inbound email.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
