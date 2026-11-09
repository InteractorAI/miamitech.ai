import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

export const TARGETS = {
  local: 'http://localhost:3000',
  staging: 'https://staging.miamitech.ai',
  production: 'https://miamitech.ai',
};

export function parseArgs(args) {
  const [command, rawTarget = 'local', ...rest] = args;
  const target = rawTarget === 'prod' ? 'production' : rawTarget;
  if (!['list', 'import'].includes(command) || !TARGETS[target]) {
    throw new Error('Usage: events:admin <list|import> <local|staging|production> [event URLs] [--apply] [--window-days=45]');
  }
  let apply = false;
  let windowDays = 45;
  const urls = [];
  for (const arg of rest) {
    if (arg === '--apply') apply = true;
    else if (arg.startsWith('--window-days=')) windowDays = Number(arg.split('=')[1]);
    else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg.split('=')[0]}`);
    else urls.push(canonicalLumaUrl(arg));
  }
  if (!Number.isInteger(windowDays) || windowDays < 1 || windowDays > 365) {
    throw new Error('window-days must be an integer from 1 to 365.');
  }
  if (command === 'list' && (apply || urls.length)) throw new Error('list does not accept event URLs or --apply.');
  if (command === 'import' && !urls.length) throw new Error('import requires at least one public Luma event URL.');
  if (command === 'import' && rest.some(arg => arg.startsWith('--window-days='))) throw new Error('window-days is only supported by list.');
  return { command, target, apply, windowDays, urls: [...new Set(urls)] };
}

export function canonicalLumaUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Expected a public HTTPS Luma event URL.'); }
  if (url.protocol !== 'https:' || !['luma.com', 'lu.ma'].includes(url.hostname) || url.port || url.username || url.password || !/^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) {
    throw new Error('Expected a canonical https://luma.com/<event> or https://lu.ma/<event> URL.');
  }
  if (url.search || url.hash) throw new Error('Use the canonical public event URL without query parameters or fragments, never a personalized invitation link.');
  return `https://luma.com${url.pathname.replace(/\/$/, '')}`;
}

export function loadSecret(target, cwd = process.cwd(), env = process.env) {
  // Explicit file only, or target-specific file. Never fall back to a local credential in production.
  const path = env.EVENT_ADMIN_ENV_FILE
    ? resolve(cwd, env.EVENT_ADMIN_ENV_FILE)
    : resolve(cwd, target === 'local' ? '.env.local' : `.env.${target}.local`);
  const file = existsSync(path) ? parseEnv(readFileSync(path, 'utf8')) : {};
  const suffix = target.toUpperCase();
  const keys = ['EVENT_DISTRIBUTION_SECRET', 'CRON_SECRET', 'EVENT_INGEST_SECRET'];
  // The server uses the first configured secret, not any of the three interchangeably.
  const targetEnv = keys.map(key => env[`${key}_${suffix}`]).find(Boolean);
  const processSecret = keys.map(key => env[key]).find(Boolean);
  const fileSecret = keys.map(key => file[key]).find(Boolean);
  const secret = targetEnv || processSecret || fileSecret;
  if (!secret) throw new Error(`No existing ${target} admin credential configured. Set EVENT_ADMIN_ENV_FILE to a secure existing env file or supply the matching environment variables. Never paste credentials into chat.`);
  return secret;
}

export async function run(options, { secret, fetchImpl = fetch } = {}) {
  const base = TARGETS[options.target];
  if (!base) throw new Error('Unknown target.');
  if (options.command === 'import' && !options.apply) {
    return { dryRun: true, target: options.target, urls: options.urls, note: 'No request sent. Verify public eligibility, dates, Miami relevance and existing events before using --apply.' };
  }
  if (!secret) throw new Error('Missing admin credential.');
  const request = async (path, body) => {
    const response = await fetchImpl(new URL(path, base), {
      method: body ? 'POST' : 'GET',
      headers: { authorization: `Bearer ${secret}`, accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      // Never forward credentials across redirects, including a login/protection redirect.
      redirect: 'error',
      signal: AbortSignal.timeout(45_000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true) throw new Error(`Admin API request failed (HTTP ${response.status}). Check target credentials and server configuration. No automatic retry was made.`);
    return result;
  };
  if (options.command === 'list') return request(`/api/admin/events?windowDays=${options.windowDays}&showHidden=true`);
  const results = [];
  for (let i = 0; i < options.urls.length; i++) {
    const url = options.urls[i];
    try {
      results.push({ url, result: await request('/api/admin/events/manual', { url }) });
    } catch {
      // Keep confirmed results and distinguish an uncertain attempt from untouched URLs.
      return { ok: false, target: options.target, completed: results, uncertain: url, notAttempted: options.urls.slice(i + 1), error: 'Import did not return a confirmed success. Check the event list before retrying this URL; no later URLs were attempted.' };
    }
  }
  return { ok: true, target: options.target, imported: results };
}
