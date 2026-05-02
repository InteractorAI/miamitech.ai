import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const nextEnvPath = join(root, 'next-env.d.ts');

const canonicalNextEnv = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`;

function runNextBuild() {
    return new Promise((resolve) => {
        const child = spawn('next', ['build'], {
            cwd: root,
            env: process.env,
            shell: true,
            stdio: 'inherit',
        });

        child.on('close', (code, signal) => resolve({ code: code ?? 1, signal }));
        child.on('error', () => resolve({ code: 1, signal: null }));
    });
}

const result = await runNextBuild();

await writeFile(nextEnvPath, canonicalNextEnv);

if (result.signal) {
    process.kill(process.pid, result.signal);
}

process.exit(result.code);
