import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/index.js';

const originalFetch = globalThis.fetch;

test('POST /admin/telegram/test rejects requests without authorization', async () => {
  const response = await worker.fetch(
    new Request('https://notify.mugeon.kim/admin/telegram/test', { method: 'POST' }),
    {
      NOTIFY_API_KEY: 'test-notify-key',
    },
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'unauthorized',
  });
});

test('POST /admin/telegram/test sends a deterministic Telegram test message', async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return Response.json({ ok: true, result: { message_id: 9 } });
  };

  try {
    const response = await worker.fetch(
      new Request('https://notify.mugeon.kim/admin/telegram/test', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-notify-key',
        },
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
      text: [
        '[notification-gateway] INFO',
        'Telegram test',
        '',
        'message: Notification Gateway Telegram connectivity test.',
      ].join('\n'),
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

