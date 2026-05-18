import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/index.js';

test('GET /health returns the documented health payload', async () => {
  const response = await worker.fetch(new Request('https://notify.mugeon.kim/health'));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.deepEqual(await response.json(), {
    ok: true,
    service: 'notification-gateway',
    version: '1.0.0',
  });
});

test('GET /health can use SERVICE_NAME from Worker vars', async () => {
  const response = await worker.fetch(new Request('https://notify.mugeon.kim/health'), {
    SERVICE_NAME: 'custom-notify',
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    service: 'custom-notify',
    version: '1.0.0',
  });
});

test('unknown routes return a JSON 404', async () => {
  const response = await worker.fetch(new Request('https://notify.mugeon.kim/telegram'));

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'not_found',
  });
});
