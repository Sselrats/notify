import assert from 'node:assert/strict';
import test from 'node:test';

import { formatTelegramMessage, redactSensitiveText } from '../src/index.js';

test('redactSensitiveText leaves normal notification text unchanged', () => {
  assert.equal(
    redactSensitiveText('selected_briefs=2, minimum_required=3'),
    'selected_briefs=2, minimum_required=3',
  );
});

test('redactSensitiveText masks common sensitive key value fields', () => {
  assert.equal(
    redactSensitiveText(
      [
        'api_key: sk-test-secret-9f3a',
        'token=telegram-token-value',
        'private_key: abcdefghijklmnop',
        'seed_phrase: alpha beta gamma delta',
      ].join('\n'),
    ),
    [
      'api_key: sk-t...9f3a',
      'token=tele...alue',
      'private_key: abcd...mnop',
      'seed_phrase: alph...elta',
    ].join('\n'),
  );
});

test('redactSensitiveText masks wallet-like addresses and emails', () => {
  assert.equal(
    redactSensitiveText('wallet: 0x1234567890abcdef email: alice@example.com'),
    'wallet: 0x12...cdef email: a***@example.com',
  );
});

test('formatTelegramMessage redacts sensitive values before delivery', () => {
  assert.equal(
    formatTelegramMessage({
      source: 'airdrop',
      level: 'warning',
      title: 'Manual interaction may be required',
      message: 'wallet: 0x1234567890abcdef api_key: sk-test-secret-9f3a',
    }),
    [
      '[airdrop] WARNING',
      'Manual interaction may be required',
      '',
      'wallet: 0x12...cdef api_key: sk-t...9f3a',
    ].join('\n'),
  );
});

