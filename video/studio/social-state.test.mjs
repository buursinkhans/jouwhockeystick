import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyPatch, emptyState, itemKey, parseState, plannedPosts, validatePatch } from './social-state.mjs';

const id = 'a1b2c3d4-patch';

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

test('a patch replaces whole items, removes one with null, and records its id', () => {
  const start = { ...emptyState(), items: { 'posts/a': { fout: 'x' }, 'posts/b': { media: {} } } };
  const next = applyPatch(start, { id, items: { 'posts/a': { fout: null, render: { klaar: 't' } }, 'posts/b': null }, tegoed: { maand: '2026-11', gebruikt: 1, grens: 20 } });
  assert.deepEqual(next.items, { 'posts/a': { fout: null, render: { klaar: 't' } } });
  assert.equal(next.wijziging, id);
  assert.deepEqual(next.tegoed, { maand: '2026-11', gebruikt: 1, grens: 20 });
  assert.equal(next.laatsteRun, null);
  // The input is not changed.
  assert.equal(start.items['posts/a'].fout, 'x');
});

test('applying the same patch twice gives the same record', () => {
  const p = { id, items: { 'videos/v': { kanalen: { reels: { uuid: 'u', moment: '2026-11-18T19:30:00' } } } } };
  const once = applyPatch(emptyState(), p);
  assert.deepEqual(applyPatch(once, p), once);
});

test('a patch with a bad key, value or field is refused', () => {
  assert.throws(() => validatePatch({ id, items: { 'plan/kwartaal': {} } }), /Ongeldige sleutel/);
  assert.throws(() => validatePatch({ id, items: { 'posts/../x': {} } }), /Ongeldige sleutel/);
  assert.throws(() => validatePatch({ id, items: { 'posts/a': [] } }), /Ongeldige stand/);
  assert.throws(() => validatePatch({ id, versie: 2 }), /Onbekend veld/);
  assert.throws(() => validatePatch({ items: {} }), /geldige id/);
  assert.throws(() => validatePatch({ id, items: { 'posts/a': { x: 'y'.repeat(41_000) } } }), /te groot/);
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
