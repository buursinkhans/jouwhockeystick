import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decodeItem, fileNames, releaseUrl, sha256, uploadAction, videoFormats } from './social-items.mjs';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64');
const post = {
  kind: 'post',
  id: '20261112-zaalstick-kiezen',
  titel: 'Zaalstick kiezen',
  slides: [
    { soort: 'opening', kop: 'Welke zaalstick?' },
    { soort: 'lijst', kop: 'Let op', punten: ['Lengte', 'Gewicht'] },
    { soort: 'slot', kop: 'Doe de check', knop: 'Naar de site' },
  ],
};
const video = { kind: 'video', id: '20261113-bow', scenes: [{ soort: 'opening', kop: 'Low of mid?' }, { soort: 'slot', kop: 'Kies' }], kanalen: { youtube: 'overslaan' } };

test('decodeItem accepts a post and a video', () => {
  assert.equal(decodeItem(b64(post)).id, post.id);
  assert.equal(decodeItem(b64(video)).kind, 'video');
});

test('decodeItem refuses bad input with a Dutch message', () => {
  assert.throws(() => decodeItem(''), /Geen item/);
  assert.throws(() => decodeItem('%%%'), /geen geldige JSON|klopt niet/);
  assert.throws(() => decodeItem(b64({ ...post, id: '../etc/passwd' })), /id/);
  assert.throws(() => decodeItem(b64({ ...post, slides: [] })), /slides/);
  assert.throws(() => decodeItem(b64({ ...post, slides: [{ soort: 'raar' }] })), /slides\.0\.soort/);
  assert.throws(() => decodeItem(b64({ ...post, slides: [{ soort: 'tekst', script: '<script>' }] })), /klopt niet/);
  assert.throws(() => decodeItem(b64({ kind: 'reel', id: 'x' })), /klopt niet/);
  assert.throws(() => decodeItem('a'.repeat(60_001)), /te groot/);
});

test('file names of a post: one PNG per slide, in order', () => {
  assert.deepEqual(fileNames(post).map((f) => f.name), [
    '20261112-zaalstick-kiezen-1.png',
    '20261112-zaalstick-kiezen-2.png',
    '20261112-zaalstick-kiezen-3.png',
  ]);
  assert.equal(fileNames(post, { test: true })[0].name, 'test-20261112-zaalstick-kiezen-1.png');
});

test('file names of a video follow its channels', () => {
  assert.deepEqual(videoFormats(video), ['reel', 'short']);
  assert.deepEqual(fileNames(video).map((f) => f.name), [
    '20261113-bow-reel.mp4',
    '20261113-bow-reel-cover.png',
    '20261113-bow-short.mp4',
    '20261113-bow-short-cover.png',
  ]);
  assert.deepEqual(videoFormats({ ...video, kanalen: {} }), ['reel', 'short', 'uitleg']);
  assert.equal(fileNames({ ...video, kanalen: {} }).at(-2).name, '20261113-bow-youtube.mp4');
  assert.deepEqual(videoFormats({ ...video, kanalen: { reels: 'overslaan', shorts: 'overslaan', youtube: 'overslaan' } }), ['short']);
});

test('the url is fixed before the upload', () => {
  assert.equal(releaseUrl('20261112-zaalstick-kiezen-1.png'), 'https://github.com/buursinkhans/jouwhockeystick/releases/download/social-media/20261112-zaalstick-kiezen-1.png');
});

test('uploadAction: same content is skipped, other content replaced, new uploaded', () => {
  const sha = sha256(Buffer.from('png'));
  const assets = [{ id: 7, name: 'a-1.png', digest: `sha256:${sha}` }, { id: 8, name: 'a-2.png', digest: 'sha256:other' }, { id: 9, name: 'a-3.png', digest: null }];
  assert.deepEqual(uploadAction('a-1.png', sha, assets), { kind: 'skip' });
  assert.deepEqual(uploadAction('a-2.png', sha, assets), { kind: 'replace', assetId: 8 });
  assert.deepEqual(uploadAction('a-3.png', sha, assets), { kind: 'replace', assetId: 9 });
  assert.deepEqual(uploadAction('a-4.png', sha, assets), { kind: 'upload' });
});

test('running twice gives the same decision: nothing is added twice', () => {
  const sha = sha256(Buffer.from('png'));
  const first = uploadAction('b-1.png', sha, []);
  assert.equal(first.kind, 'upload');
  // After the upload GitHub lists the asset with its digest; the second run skips it.
  assert.deepEqual(uploadAction('b-1.png', sha, [{ id: 1, name: 'b-1.png', digest: `sha256:${sha}` }]), { kind: 'skip' });
});
