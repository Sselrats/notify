import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/index.js';

const env = {
  NOTIFY_API_KEY: 'test-notify-key',
};

test('POST /v1/notify rejects requests without a bearer token', async () => {
  const response = await worker.fetch(
    new Request('https://notify.mugeon.kim/v1/notify', { method: 'POST' }),
    env,
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'unauthorized',
  });
});

test('POST /v1/notify rejects requests with an invalid bearer token', async () => {
  const response = await worker.fetch(
    new Request('https://notify.mugeon.kim/v1/notify', {
      method: 'POST',
      headers: {
        authorization: 'Bearer wrong-key',
      },
    }),
    env,
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'unauthorized',
  });
});

test('POST /v1/notify accepts the configured bearer token before payload validation', async () => {
  const response = await worker.fetch(
    new Request('https://notify.mugeon.kim/v1/notify', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-notify-key',
      },
    }),
    env,
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'invalid_json',
  });
});
