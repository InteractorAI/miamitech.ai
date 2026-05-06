#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Resend } from 'resend';

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

const envFile = loadEnvFile(resolve(process.cwd(), '.env.local'));
const apiKey = process.env.RESEND_API_KEY || envFile.RESEND_API_KEY;
const from = getArg('--from') || process.env.RESEND_FROM_EMAIL || envFile.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const to = getArg('--to') || process.env.RESEND_TEST_TO || envFile.RESEND_TEST_TO || 'dave@interactor.ai';

if (!apiKey) {
    console.error('Missing RESEND_API_KEY. Add your real key to .env.local, not to source code.');
    process.exit(1);
}

const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
    from,
    to,
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
});

if (error) {
    console.error('Resend test email failed:');
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
}

console.log(JSON.stringify({
    ok: true,
    id: data?.id,
    from,
    to,
}, null, 2));
