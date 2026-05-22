import assert from 'node:assert/strict';
import test from 'node:test';

import { deliverTelegram } from '../src/index.js';

test('deliverTelegram returns a JSON error when Telegram secrets are missing', async () => {
  const response = await deliverTelegram('hello', {});

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'telegram_not_configured',
  });
});

test('deliverTelegram sends the formatted message to Telegram Bot API', async () => {
  const calls = [];
  const response = await deliverTelegram(
    '[distill] WARNING\nCluster count low\n\nselected_briefs=2',
    {
      TELEGRAM_BOT_TOKEN: 'telegram-token',
      TELEGRAM_CHAT_ID: 'telegram-chat',
    },
    async (url, init) => {
      calls.push({ url, init });
      return Response.json({ ok: true, result: { message_id: 1 } });
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    channel: 'telegram',
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.telegram.org/bottelegram-token/sendMessage');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['content-type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    chat_id: 'telegram-chat',
    text: '[distill] WARNING\nCluster count low\n\nselected_briefs=2',
  });
});

test('deliverTelegram sends an image URL through Telegram sendPhoto', async () => {
  const calls = [];
  const response = await deliverTelegram(
    '[distill] WARNING\nCluster count low\n\nselected_briefs=2',
    {
      TELEGRAM_BOT_TOKEN: 'telegram-token',
      TELEGRAM_CHAT_ID: 'telegram-chat',
    },
    async (url, init) => {
      calls.push({ url, init });
      return Response.json({ ok: true, result: { message_id: 2 } });
    },
    {
      imageUrl: 'https://example.com/chart.png',
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
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['content-type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    chat_id: 'telegram-chat',
    photo: 'https://example.com/chart.png',
    caption: '[distill] WARNING\nCluster count low\n\nselected_briefs=2',
  });
});

test('deliverTelegram truncates photo captions to Telegram limits', async () => {
  const calls = [];
  const response = await deliverTelegram(
    'x'.repeat(1100),
    {
      TELEGRAM_BOT_TOKEN: 'telegram-token',
      TELEGRAM_CHAT_ID: 'telegram-chat',
    },
    async (url, init) => {
      calls.push({ url, init });
      return Response.json({ ok: true, result: { message_id: 3 } });
    },
    {
      imageUrl: 'https://example.com/chart.png',
    },
  );

  assert.equal(response.status, 200);
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.caption.length, 1024);
  assert.equal(body.caption.endsWith('...'), true);
});

test('deliverTelegram returns a JSON error when Telegram rejects delivery', async () => {
  const response = await deliverTelegram(
    'hello',
    {
      TELEGRAM_BOT_TOKEN: 'telegram-token',
      TELEGRAM_CHAT_ID: 'telegram-chat',
    },
    async () => Response.json({ ok: false, description: 'Bad Request' }, { status: 400 }),
  );

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'telegram_delivery_failed',
  });
});
