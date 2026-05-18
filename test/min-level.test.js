import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/index.js';

const originalFetch = globalThis.fetch;

function request(level) {
  return new Request('https://notify.mugeon.kim/v1/notify', {
    method: 'POST',
    headers: {
      authorization: 'Bearer test-notify-key',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      source: 'distill',
      level,
      title: 'Pipeline event',
      message: 'event details',
    }),
  });
}

test('POST /v1/notify delivers all valid levels when MIN_LEVEL is absent', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return Response.json({ ok: true, result: { message_id: 10 } });
  };

  try {
    const response = await worker.fetch(request('debug'), {
      NOTIFY_API_KEY: 'test-notify-key',
      TELEGRAM_BOT_TOKEN: 'telegram-token',
      TELEGRAM_CHAT_ID: 'telegram-chat',
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      ok: true,
      channel: 'telegram',
    });
    assert.equal(calls.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('POST /v1/notify skips messages below MIN_LEVEL without calling Telegram', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return Response.json({ ok: true });
  };

  try {
    const response = await worker.fetch(request('info'), {
      NOTIFY_API_KEY: 'test-notify-key',
      TELEGRAM_BOT_TOKEN: 'telegram-token',
      TELEGRAM_CHAT_ID: 'telegram-chat',
      MIN_LEVEL: 'warning',
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      ok: true,
      skipped: true,
      reason: 'below_min_level',
    });
    assert.equal(calls.length, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('POST /v1/notify reports invalid MIN_LEVEL configuration', async () => {
  const response = await worker.fetch(request('critical'), {
    NOTIFY_API_KEY: 'test-notify-key',
    TELEGRAM_BOT_TOKEN: 'telegram-token',
    TELEGRAM_CHAT_ID: 'telegram-chat',
    MIN_LEVEL: 'urgent',
  });

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'invalid_min_level',
  });
});

