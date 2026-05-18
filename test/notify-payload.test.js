import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/index.js';

const env = {
  NOTIFY_API_KEY: 'test-notify-key',
};

function notifyRequest(body, headers = {}) {
  return new Request('https://notify.mugeon.kim/v1/notify', {
    method: 'POST',
    headers: {
      authorization: 'Bearer test-notify-key',
      'content-type': 'application/json',
      ...headers,
    },
    body,
  });
}

test('POST /v1/notify rejects malformed JSON', async () => {
  const response = await worker.fetch(notifyRequest('{'), env);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'invalid_json',
  });
});

test('POST /v1/notify rejects payloads missing required fields', async () => {
  const response = await worker.fetch(
    notifyRequest(JSON.stringify({ source: 'distill', level: 'warning' })),
    env,
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'invalid_payload',
    details: ['title is required', 'message is required'],
  });
});

test('POST /v1/notify rejects invalid levels', async () => {
  const response = await worker.fetch(
    notifyRequest(
      JSON.stringify({
        source: 'distill',
        level: 'notice',
        title: 'Cluster count low',
        message: 'selected_briefs=2, minimum_required=3',
      }),
    ),
    env,
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'invalid_payload',
    details: ['level is invalid'],
  });
});

test('POST /v1/notify accepts a minimally valid payload before Telegram config validation', async () => {
  const response = await worker.fetch(
    notifyRequest(
      JSON.stringify({
        source: 'distill',
        level: 'warning',
        title: 'Cluster count low',
        message: 'selected_briefs=2, minimum_required=3',
      }),
    ),
    env,
  );

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'telegram_not_configured',
  });
});
