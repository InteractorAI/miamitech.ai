import { NextRequest } from 'next/server';

export const runtime = 'edge';

// 1x1 transparent GIF
const TRANSPARENT_GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return new Response(TRANSPARENT_GIF, {
            status: 200,
            headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'public, max-age=86400' }
        });
    }

    const targetUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    try {
        const response = await fetch(targetUrl, {
            redirect: 'follow',
        });

        if (!response.ok) {
            return new Response(TRANSPARENT_GIF, {
                status: 200,
                headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'public, max-age=86400' }
            });
        }

        return new Response(response.body, {
            status: 200,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/png',
                'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
            }
        });
    } catch {
        return new Response(TRANSPARENT_GIF, {
            status: 200,
            headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'public, max-age=86400' }
        });
    }
}
