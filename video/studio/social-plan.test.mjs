import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decodeItem, itemFromStudio } from './social-items.mjs';
import { plan } from './social-plan.mjs';

const postDoc = {
  collection: 'posts',
  id: '20261113-veld-of-zaalstick',
  data: { titel: 'X', status: 'concept', metricoolAkkoord: { op: '2026-11-10T10:00:00Z', v: 2 }, slides: [{ soort: 'opening', kop: 'A' }, { soort: 'slot', kop: 'B', knop: 'C' }] },
};
const videoDoc = {
  collection: 'videos',
  id: '20261118-zaal-carbon',
  data: { titel: 'Carbon', status: 'concept', kanalen: { youtube: 'overslaan' }, metricoolPosts: { reels: { uuid: '1' } }, scenes: [{ soort: 'opening', kop: 'A' }], short: { titel: 'T' }, thumbnail: { kop: 'K' } },
};

test('a post: the slides only, and one url per slide', () => {
  const p = plan(postDoc);
  const item = decodeItem(p.item_b64);
  assert.deepEqual(Object.keys(item).sort(), ['id', 'kind', 'slides']);
  assert.deepEqual(p.media, {
    slides: [
      { name: '20261113-veld-of-zaalstick-1.png', url: 'https://github.com/buursinkhans/jouwhockeystick/releases/download/social-media/20261113-veld-of-zaalstick-1.png' },
      { name: '20261113-veld-of-zaalstick-2.png', url: 'https://github.com/buursinkhans/jouwhockeystick/releases/download/social-media/20261113-veld-of-zaalstick-2.png' },
    ],
  });
  assert.equal(p.urls.length, 2);
});

test('a video: render fields only, never the status or the Metricool ids', () => {
  const p = plan(videoDoc);
  const item = decodeItem(p.item_b64);
  assert.equal(item.metricoolPosts, undefined);
  assert.equal(item.status, undefined);
  assert.deepEqual(Object.keys(p.media), ['reel', 'reelCover', 'short', 'shortCover']);
  assert.equal(p.media.reel.name, '20261118-zaal-carbon-reel.mp4');
  assert.equal(p.media.shortCover.name, '20261118-zaal-carbon-short-cover.png');
});

test('a test run gets the test- names', () => {
  assert.equal(plan(postDoc, { test: true }).media.slides[0].name, 'test-20261113-veld-of-zaalstick-1.png');
});

test('a document that cannot be rendered is refused', () => {
  assert.throws(() => plan({ ...postDoc, data: { slides: [] } }), /slides/);
  assert.throws(() => plan({ ...postDoc, collection: 'plan' }), /Onbekende collectie/);
  assert.throws(() => plan({ ...postDoc, id: 'Fout ID' }), /id/);
});

test('the item from the plan passes the full check of the workflow', () => {
  assert.equal(decodeItem(plan(postDoc).item_b64).kind, 'post');
  assert.equal(itemFromStudio(videoDoc).kind, 'video');
});

test('a post keeps its series, and only a known series', () => {
  assert.equal(decodeItem(plan({ ...postDoc, data: { ...postDoc.data, serie: 'maatje' } }).item_b64).serie, 'maatje');
  assert.equal(decodeItem(plan({ ...postDoc, data: { ...postDoc.data, serie: 'onbekend' } }).item_b64).serie, undefined);
});
