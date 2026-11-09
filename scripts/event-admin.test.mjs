import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs, canonicalLumaUrl, loadSecret, run } from './lib/event-admin-client.mjs';

test('canonical URLs are deduplicated across Luma host aliases', () => {
  assert.deepEqual(parseArgs(['import', 'prod', 'https://lu.ma/example/', 'https://luma.com/example']).urls, ['https://luma.com/example']);
});
test('rejects private links, arbitrary hosts, credentials and unsupported options', () => {
  for (const value of ['http://luma.com/a', 'https://luma.com.evil.com/a', 'https://user:secret@luma.com/a', 'https://luma.com/a?invite=private', 'https://luma.com/a#secret', 'https://luma.com:444/a', 'https://luma.com/a/b']) assert.throws(() => canonicalLumaUrl(value));
  assert.throws(() => parseArgs(['list', 'production', '--send']));
  assert.throws(() => parseArgs(['list', 'production', '--window-days=NaN']));
  assert.throws(() => parseArgs(['list', 'production', '--apply']));
});
test('import defaults to no network and needs no secret', async () => {
  const result = await run(parseArgs(['import', 'production', 'https://luma.com/example']), {fetchImpl: () => assert.fail('network called')});
  assert.equal(result.dryRun, true);
});
test('credentials follow server precedence', () => {
  assert.equal(loadSecret('production', '/nonexistent', {EVENT_DISTRIBUTION_SECRET_PRODUCTION:'target', CRON_SECRET:'fallback'}), 'target');
  assert.equal(loadSecret('production', '/nonexistent', {EVENT_DISTRIBUTION_SECRET:'first', CRON_SECRET:'second'}), 'first');
  assert.throws(() => loadSecret('production', '/nonexistent', {}));
});
test('list includes hidden entries and does not mutate', async () => {
  await run(parseArgs(['list','production','--window-days=7']), {secret:'test-only',fetchImpl: async (url, init) => {
    assert.equal(String(url), 'https://miamitech.ai/api/admin/events?windowDays=7&showHidden=true');
    assert.equal(init.method, 'GET'); assert.equal(init.redirect,'error');
    assert.equal(init.headers.authorization,'Bearer test-only');
    return Response.json({ok:true,events:[]});
  }});
});
test('explicit import posts URL only, without ingest or curation changes', async () => {
  const result = await run(parseArgs(['import','local','https://luma.com/example','--apply']), {secret:'test-only',fetchImpl: async (url, init) => {
    assert.equal(String(url),'http://localhost:3000/api/admin/events/manual');
    assert.deepEqual(JSON.parse(init.body),{url:'https://luma.com/example'});
    return Response.json({ok:true,eventId:'event-1'});
  }});
  assert.equal(result.ok,true);
});
test('partial failure is not retried or falsely reported as success', async () => {
  let count=0;
  const result=await run(parseArgs(['import','production','https://luma.com/a','https://luma.com/b','https://luma.com/c','--apply']), {secret:'test-only',fetchImpl:async()=> {
    if (++count===1) return Response.json({ok:true,eventId:'a'});
    throw new TypeError('network');
  }});
  assert.equal(count,2); assert.equal(result.completed.length,1);
  assert.equal(result.uncertain,'https://luma.com/b'); assert.deepEqual(result.notAttempted,['https://luma.com/c']);
});
test('does not expose server response errors or secrets', async () => {
  await assert.rejects(run(parseArgs(['list','local']), {secret:'test-only',fetchImpl:async()=>Response.json({error:'private detail'},{status:401})}), error => !error.message.includes('private detail') && !error.message.includes('test-only'));
});
