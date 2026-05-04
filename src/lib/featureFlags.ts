export function areEventsEnabled() {
    if (process.env.NEXT_PUBLIC_SHOW_EVENTS === 'true') return true;
    if (process.env.SHOW_EVENTS === 'true') return true;
    return process.env.VERCEL_ENV !== 'production';
}
