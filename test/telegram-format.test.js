import assert from 'node:assert/strict';
import test from 'node:test';

import { formatTelegramMessage } from '../src/index.js';

test('formatTelegramMessage formats the basic documented Telegram shape', () => {
  assert.equal(
    formatTelegramMessage({
      source: 'distill',
      level: 'warning',
      title: '선정 가능한 클러스터 부족',
      message: 'selected_briefs=2, minimum_required=3',
      tags: ['daily', 'pipeline', 'fallback'],
    }),
    [
      '[distill] WARNING',
      '선정 가능한 클러스터 부족',
      '',
      'selected_briefs=2, minimum_required=3',
      '',
      'tags: daily, pipeline, fallback',
    ].join('\n'),
  );
});

test('formatTelegramMessage includes AgentForge-style optional fields', () => {
  assert.equal(
    formatTelegramMessage({
      source: 'agentforge',
      project: 'distill',
      level: 'critical',
      event: 'worker_failed',
      title: 'Worker execution failed',
      message: 'distill project build failed after retry.',
      tags: ['build', 'worker', 'human_review_required'],
      url: 'https://github.com/example/repo/pull/1',
    }),
    [
      '[agentforge] CRITICAL',
      'Worker execution failed',
      '',
      'project: distill',
      'event: worker_failed',
      'message: distill project build failed after retry.',
      '',
      'tags: build, worker, human_review_required',
      '',
      'url: https://github.com/example/repo/pull/1',
    ].join('\n'),
  );
});

