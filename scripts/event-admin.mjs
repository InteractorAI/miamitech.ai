#!/usr/bin/env node
import { parseArgs, loadSecret, run } from './lib/event-admin-client.mjs';

try {
  const options = parseArgs(process.argv.slice(2));
  const dryRun = options.command === 'import' && !options.apply;
  const result = await run(options, { secret: dryRun ? undefined : loadSecret(options.target) });
  console.log(JSON.stringify(result, null, 2));
  if (result.ok === false) process.exitCode = 1;
} catch (error) {
  // Do not print transport errors, request headers, environment values, or server response bodies.
  const safe = error instanceof Error && !['TypeError', 'TimeoutError'].includes(error.name)
    ? error.message : 'Request failed. Check connectivity and credentials; no automatic retry was made.';
  console.error(safe);
  process.exitCode = 1;
}
