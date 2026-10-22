// Run with: node --test video/studio/*.test.mjs
import assert from 'node:assert/strict';
import test from 'node:test';
import { ffmpegArgs } from './render.mjs';
import { metadata, publishMoment, targets, timeFor, validate } from './youtube.mjs';

const base = {
  id: '20261030-carbon-mythe',
  datum: '2026-10-30',
  scenes: [{ soort: 'opening', kop: 'Meer carbon is niet altijd beter' }, { soort: 'slot', kop: 'Twijfel je?' }],
  short: { titel: 'Is meer carbon altijd beter? #shorts', beschrijving: 'Kort antwoord.' },
  youtube: { titel: 'Meer carbon: beter of niet?', beschrijving: 'Lang antwoord.', tags: ['hockeystick', 'carbon'] },
  kanalen: {},
};

test('publishMoment: Dutch summer time (UTC+2) and winter time (UTC+1)', () => {
  assert.equal(publishMoment('2026-10-24', '19:30').toISOString(), '2026-10-24T17:30:00.000Z');
  assert.equal(publishMoment('2026-10-26', '19:30').toISOString(), '2026-10-26T18:30:00.000Z');
  // The day the clocks go back (25 October 2026): after 03:00 it is already winter time.
  assert.equal(publishMoment('2026-10-25', '19:30').toISOString(), '2026-10-25T18:30:00.000Z');
  assert.equal(publishMoment('2027-03-28', '17:00').toISOString(), '2027-03-28T15:00:00.000Z');
});

test('publishMoment refuses malformed input', () => {
  assert.throws(() => publishMoment('30-10-2026', '19:30'));
  assert.throws(() => publishMoment('2026-10-30', '7:30'));
});

test('targets: skipped, scheduled or placed channels are never uploaded again', () => {
  assert.deepEqual(targets(base), ['shorts', 'youtube']);
  assert.deepEqual(targets({ ...base, kanalen: { youtube: 'overslaan' } }), ['shorts']);
  assert.deepEqual(targets({ ...base, kanalen: { shorts: 'ingepland', youtube: 'geplaatst' } }), []);
});

test('timeFor: per-channel time from the script, else the defaults', () => {
  assert.equal(timeFor(base, 'shorts'), '19:30');
  assert.equal(timeFor(base, 'youtube'), '17:00');
  assert.equal(timeFor({ ...base, tijden: { shorts: '20:15' } }, 'shorts'), '20:15');
  assert.equal(timeFor({ ...base, tijden: { shorts: 'later' } }, 'shorts'), '19:30');
});

test('validate catches what would break an upload', () => {
  assert.deepEqual(validate(base), []);
  assert.ok(validate({ ...base, id: '../etc' }).length);
  assert.ok(validate({ ...base, datum: null }).length);
  assert.ok(validate({ ...base, scenes: [] }).length);
  assert.ok(validate({ ...base, extern: true }).length);
});

test('metadata: private until publishAt, not for kids, Dutch, sports', () => {
  const at = new Date('2026-10-30T18:30:00Z');
  const m = metadata(base, 'shorts', at);
  assert.equal(m.snippet.title, 'Is meer carbon altijd beter? #shorts');
  assert.equal(m.snippet.categoryId, '17');
  assert.equal(m.snippet.defaultLanguage, 'nl');
  assert.equal(m.status.privacyStatus, 'private');
  assert.equal(m.status.publishAt, '2026-10-30T18:30:00.000Z');
  assert.equal(m.status.selfDeclaredMadeForKids, false);
  assert.equal(metadata(base, 'youtube', at).snippet.title, 'Meer carbon: beter of niet?');
});

test('metadata: #shorts added, < and > removed, long titles cut', () => {
  const at = new Date('2026-10-30T18:30:00Z');
  const m = metadata({ ...base, short: { titel: 'Te <lang> ' + 'x'.repeat(120), beschrijving: 'a > b' } }, 'shorts', at);
  assert.ok(m.snippet.title.length <= 100);
  assert.ok(!/[<>]/.test(m.snippet.title + m.snippet.description));
  const n = metadata({ ...base, short: { titel: 'Zonder tag' } }, 'shorts', at);
  assert.equal(n.snippet.title, 'Zonder tag #shorts');
  assert.throws(() => metadata({ ...base, short: {}, youtube: {}, titel: '' }, 'shorts', at));
});

test('ffmpegArgs: music, one input per sound cue, length capped', () => {
  const args = ffmpegArgs({
    framesPattern: 'f%05d.jpg', fps: 30, total: 15,
    cues: [{ name: 'pop', at: 1.2 }, { name: 'whoosh', at: 3 }, { name: 'onbekend', at: 4 }],
    volume: { music: 0.7, pop: 0.35, whoosh: 0.22 },
    soundFiles: { music: 'm.mp3', pop: 'p.mp3', whoosh: 'w.mp3' },
    out: 'o.mp4',
  });
  assert.equal(args.filter((a) => a === '-i').length, 4); // frames, music, pop, whoosh
  const graph = args[args.indexOf('-filter_complex') + 1];
  assert.match(graph, /adelay=1200\|1200/);
  assert.match(graph, /amix=inputs=3/);
  assert.equal(args[args.indexOf('-t') + 1], '15.000');
  assert.equal(args.at(-1), 'o.mp4');
});
