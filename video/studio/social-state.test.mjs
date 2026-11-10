import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emptyState, itemKey, parseState, plannedPosts } from './social-state.mjs';

test('a new record is empty and valid', () => {
  assert.deepEqual(parseState(JSON.stringify(emptyState())), emptyState());
});

test('anything that is not a record is refused', () => {
  assert.throws(() => parseState('{"items": {}}'), /geen geldige stand/);
  assert.throws(() => parseState('[]'), /geen geldige stand/);
  assert.throws(() => parseState('{"versie": 1, "items": null}'), /geen geldige stand/);
});

test('item keys follow the studio collections', () => {
  assert.equal(itemKey('posts', '20261128-proef'), 'posts/20261128-proef');
});

test('plannedPosts lists every Metricool post once per channel, never a channel still "bezig"', () => {
  const state = {
    ...emptyState(),
    items: {
      'posts/a': { kanalen: { insta: { id: '1', uuid: 'u1', moment: '2026-11-13T19:30:00' } } },
      'videos/b': { kanalen: { reels: { uuid: 'u2', moment: '2026-11-18T19:30:00' }, shorts: { bezig: '2026-11-10T10:00:00Z' } } },
    },
  };
  assert.deepEqual(plannedPosts(state), [
    { uuid: 'u1', moment: '2026-11-13T19:30:00' },
    { uuid: 'u2', moment: '2026-11-18T19:30:00' },
  ]);
});
