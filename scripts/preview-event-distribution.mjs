#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const TARGETS = {
  local: 'http://localhost:3000',
  staging: 'https://staging.miamitech.ai',
  production: 'https://miamitech.ai',
  prod: 'https://miamitech.ai',
};

function loadEnvFile(path) {
  if (!existsSync(path)) return {};

  const values = {};
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    values[key] = rawValue
      .replace(/^['"]|['"]$/g, '')
      .replace(/\\n/g, '\n');
  }

  return values;
}

function getArg(name) {
  const arg = process.argv.find((value) => value.startsWith(`${name}=`));
  return arg ? arg.slice(name.length + 1) : '';
}

function getFlag(name) {
  return process.argv.includes(name);
}

const requestedTarget = process.argv[2] || 'local';
const explicitUrl = getArg('--url') || process.env.EVENT_DISTRIBUTION_PREVIEW_URL;
const baseUrl = explicitUrl || TARGETS[requestedTarget];

if (!baseUrl) {
  console.error(`Unknown target "${requestedTarget}". Use local, staging, production, or --url=https://...`);
  process.exit(1);
}

const envFile = loadEnvFile(resolve(process.cwd(), '.env.local'));
const normalizedTarget = requestedTarget === 'prod' ? 'production' : requestedTarget;
const targetSuffix = normalizedTarget.toUpperCase().replace(/[^A-Z0-9]/g, '_');
const secret =
  process.env[`EVENT_DISTRIBUTION_SECRET_${targetSuffix}`] ||
  process.env[`EVENT_INGEST_SECRET_${targetSuffix}`] ||
  process.env[`CRON_SECRET_${targetSuffix}`] ||
  process.env.EVENT_DISTRIBUTION_SECRET ||
  process.env.EVENT_INGEST_SECRET ||
  process.env.CRON_SECRET ||
  envFile[`EVENT_DISTRIBUTION_SECRET_${targetSuffix}`] ||
  envFile[`EVENT_INGEST_SECRET_${targetSuffix}`] ||
  envFile[`CRON_SECRET_${targetSuffix}`] ||
  envFile.EVENT_DISTRIBUTION_SECRET ||
  envFile.EVENT_INGEST_SECRET ||
  envFile.CRON_SECRET;

if (!secret) {
  console.error('Missing CRON_SECRET, EVENT_INGEST_SECRET, or EVENT_DISTRIBUTION_SECRET. Add it to your environment or .env.local.');
  process.exit(1);
}

const url = new URL('/api/jobs/event-distribution-preview', baseUrl);
const windowDays = getArg('--window-days');
const limit = getArg('--limit');

if (windowDays) url.searchParams.set('windowDays', windowDays);
if (limit) url.searchParams.set('limit', limit);
if (getFlag('--no-enqueue')) url.searchParams.set('enqueue', 'false');
if (getFlag('--no-digest')) url.searchParams.set('includeDigest', 'false');

console.log(`Previewing event distribution for ${normalizedTarget}: ${url.origin}`);

const response = await fetch(url, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${secret}`,
    accept: 'application/json',
  },
});

const text = await response.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = text;
}

if (!response.ok) {
  console.error(`Event distribution preview failed: ${response.status} ${response.statusText}`);
  console.error(typeof body === 'string' ? body : JSON.stringify(body, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(body, null, 2));
