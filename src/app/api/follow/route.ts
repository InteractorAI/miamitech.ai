import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../lib/supabaseServer';

export const runtime = 'nodejs';

type FollowPayload = {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    smsOptIn?: unknown;
};

type UnfollowPayload = {
    email?: unknown;
};

function normalizeEmail(value: unknown) {
    if (typeof value !== 'string') return '';
    return value.trim().toLowerCase();
}

function normalizeName(value: unknown) {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ');
}

function normalizePhone(value: unknown) {
    if (typeof value !== 'string') return '';

    const raw = value.trim();
    if (!raw) return '';

    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    if (raw.startsWith('+') && digits.length >= 10 && digits.length <= 15) return `+${digits}`;

    return '';
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function splitName(displayName: string) {
    const [firstName, ...rest] = displayName.split(' ');
    return {
        firstName,
        lastName: rest.join(' ') || undefined,
    };
}

async function syncResendContact({
    email,
    displayName,
    phone,
    smsOptIn,
}: {
    email: string;
    displayName: string;
    phone: string;
    smsOptIn: boolean;
}) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { status: 'skipped' as const };

    const { firstName, lastName } = splitName(displayName);
    const segmentId = process.env.RESEND_FOLLOW_SEGMENT_ID;
    const body = {
        email,
        firstName,
        lastName,
        unsubscribed: false,
        properties: {
            display_name: displayName,
            phone,
            sms_opt_in: String(smsOptIn),
            source: 'miamitech.ai',
        },
        ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
    };

    const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    };

    const createResponse = await fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (createResponse.ok) {
        const json = await createResponse.json().catch(() => null);
        return { status: 'synced' as const, contactId: json?.id as string | undefined };
    }

    if (createResponse.status !== 409 && createResponse.status !== 422) {
        return { status: 'failed' as const };
    }

    const updateResponse = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            unsubscribed: false,
            properties: body.properties,
        }),
    });

    if (!updateResponse.ok) return { status: 'failed' as const };

    const json = await updateResponse.json().catch(() => null);
    return { status: 'synced' as const, contactId: json?.id as string | undefined };
}

async function unsubscribeResendContact(email: string) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { status: 'skipped' as const };

    const response = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unsubscribed: true }),
    });

    if (!response.ok) return { status: 'failed' as const };
    return { status: 'synced' as const };
}

export async function POST(request: NextRequest) {
    let payload: FollowPayload;

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const displayName = normalizeName(payload.name);
    const email = normalizeEmail(payload.email);
    const phone = normalizePhone(payload.phone);
    const smsOptIn = payload.smsOptIn === true;

    if (!displayName) {
        return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
        return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    if (smsOptIn && !phone) {
        return NextResponse.json({ error: 'Enter a valid phone number.' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
        return NextResponse.json({ error: 'Follow signup is not configured.' }, { status: 503 });
    }

    const now = new Date().toISOString();
    const resend = await syncResendContact({ email, displayName, phone, smsOptIn }).catch(() => ({ status: 'failed' as const }));
    const followerRow: Record<string, unknown> = {
        email_normalized: email,
        display_name: displayName,
        phone_e164: phone || null,
        email_opt_in: true,
        sms_opt_in: smsOptIn,
        source: 'site_follow_modal',
        last_seen_at: now,
        updated_at: now,
        metadata: {
            resend_status: resend.status,
            user_agent: request.headers.get('user-agent'),
            referrer: request.headers.get('referer'),
        },
    };

    if ('contactId' in resend && resend.contactId) {
        followerRow.resend_contact_id = resend.contactId;
    }

    const { data, error } = await supabase
        .from('followers')
        .upsert(followerRow, { onConflict: 'email_normalized' })
        .select('display_name, email_normalized, phone_e164, email_opt_in, sms_opt_in, last_seen_at')
        .single();

    if (error) {
        console.error('Failed to save follower', error);
        return NextResponse.json({ error: 'Could not save your follow yet.' }, { status: 500 });
    }

    return NextResponse.json({
        follower: {
            displayName: data.display_name,
            email: data.email_normalized,
            phone: data.phone_e164,
            emailOptIn: data.email_opt_in,
            smsOptIn: data.sms_opt_in,
            followedAt: data.last_seen_at,
        },
        integrations: {
            resend: resend.status,
        },
    });
}

export async function DELETE(request: NextRequest) {
    let payload: UnfollowPayload;

    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const email = normalizeEmail(payload.email);

    if (!isValidEmail(email)) {
        return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
        return NextResponse.json({ error: 'Follow signup is not configured.' }, { status: 503 });
    }

    const resend = await unsubscribeResendContact(email).catch(() => ({ status: 'failed' as const }));
    const { error } = await supabase
        .from('followers')
        .delete()
        .eq('email_normalized', email);

    if (error) {
        console.error('Failed to remove follower', error);
        return NextResponse.json({ error: 'Could not remove your follow yet.' }, { status: 500 });
    }

    return NextResponse.json({
        unfollowed: true,
        integrations: {
            resend: resend.status,
        },
    });
}
