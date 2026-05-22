import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/index.js';

const originalFetch = globalThis.fetch;

test('POST /v1/notify delivers a valid notification through Telegram', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return Response.json({ ok: true, result: { message_id: 7 } });
  };

  try {
    const response = await worker.fetch(
      new Request('https://notify.mugeon.kim/v1/notify', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-notify-key',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          source: 'distill',
          level: 'warning',
          title: 'Cluster count low',
          message: 'selected_briefs=2, minimum_required=3',
        }),
      }),
      {
        NOTIFY_API_KEY: 'test-notify-key',
        TELEGRAM_BOT_TOKEN: 'telegram-token',
        TELEGRAM_CHAT_ID: 'telegram-chat',
      },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      ok: true,
      channel: 'telegram',
    });
    assert.equal(calls.length, 1);
    assert.deepEqual(JSON.parse(calls[0].init.body), {
      chat_id: 'telegram-chat',
      text: '[distill] WARNING\nCluster count low\n\nselected_briefs=2, minimum_required=3',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('POST /v1/notify delivers an image notification through Telegram', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return Response.json({ ok: true, result: { message_id: 8 } });
  };

  try {
    const response = await worker.fetch(
      new Request('https://notify.mugeon.kim/v1/notify', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-notify-key',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          source: 'distill',
          level: 'warning',
          title: 'Cluster count low',
          message: 'selected_briefs=2, minimum_required=3',
          image_url: 'https://example.com/chart.png',
        }),
      }),
      {
        NOTIFY_API_KEY: 'test-notify-key',
        TELEGRAM_BOT_TOKEN: 'telegram-token',
        TELEGRAM_CHAT_ID: 'telegram-chat',
      },
    );

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      ok: true,
      channel: 'telegram',
      media: 'photo',
    });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.telegram.org/bottelegram-token/sendPhoto');
    assert.deepEqual(JSON.parse(calls[0].init.body), {
      chat_id: 'telegram-chat',
      photo: 'https://example.com/chart.png',
      caption: '[distill] WARNING\nCluster count low\n\nselected_briefs=2, minimum_required=3',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
