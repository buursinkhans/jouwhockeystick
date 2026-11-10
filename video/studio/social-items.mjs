// Pure helpers for the workflow social-render.yml (docs/marketing/bouwplan-2.0.md,
// fase 0): read and check a Social-studio item, name its files, give their public
// url in the GitHub Release "social-media", and decide what needs an upload.
// No I/O here, so the tests (node --test) cover all of it.

import { createHash } from 'node:crypto';
import { z } from 'zod';

export const REPO = 'buursinkhans/jouwhockeystick';
export const RELEASE_TAG = 'social-media';
/** Test runs get this prefix, so they never touch the files of a real item. */
export const TEST_PREFIX = 'test-';

const text = (max) => z.string().max(max);
const id = z.string().regex(/^[a-z0-9-]{1,80}$/, 'id: alleen a-z, 0-9 en -, hooguit 80 tekens');

// The slide fields of docs/marketing/social-planner.md ("POSTS MAKEN"), with room to spare.
const slide = z
  .object({
    soort: z.enum(['opening', 'tekst', 'lijst', 'tabel', 'slot']),
    boven: text(80).optional(),
    kop: text(200).optional(),
    tekst: text(600).optional(),
    punten: z.array(text(200)).max(8).optional(),
    kolommen: z.array(text(80)).max(3).optional(),
    rijen: z.array(z.array(text(120)).max(3)).max(14).optional(),
    voetnoot: text(240).optional(),
    knop: text(60).optional(),
  })
  .strict();

const post = z
  .object({
    kind: z.literal('post'),
    id,
    slides: z.array(slide).min(1).max(10),
  })
  .loose();

// Video scenes are drawn by videoart.js, which reads more fields per kind; it gets
// the item as is. Checked here: the kinds and the channels.
const scene = z
  .object({ soort: z.enum(['opening', 'tekst', 'lijst', 'tabel', 'item', 'slot']) })
  .loose();
const VIDEO_CHANNELS = ['reels', 'shorts', 'tiktok', 'youtube'];
const video = z
  .object({
    kind: z.literal('video'),
    id,
    scenes: z.array(scene).min(1).max(20),
    kanalen: z.record(z.string(), z.string()).optional(),
  })
  .loose();

export const itemSchema = z.discriminatedUnion('kind', [post, video]);

/** The workflow input: base64 of the item's JSON. Throws with a Dutch message on anything else. */
export function decodeItem(b64) {
  if (typeof b64 !== 'string' || !b64.trim()) throw new Error('Geen item meegegeven.');
  if (b64.length > 60_000) throw new Error('Het item is te groot.');
  let json;
  try {
    json = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } catch {
    throw new Error('Het item is geen geldige JSON in base64.');
  }
  const parsed = itemSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new Error(`Het item klopt niet: ${first ? `${first.path.join('.') || 'item'}: ${first.message}` : 'onbekende fout'}`);
  }
  return parsed.data;
}

/** The video formats an item needs: reels → reel; shorts and tiktok → short; youtube → uitleg. A channel on "overslaan" is skipped. */
export function videoFormats(item) {
  const skip = new Set(Object.entries(item.kanalen ?? {}).filter(([, v]) => v === 'overslaan').map(([k]) => k));
  const channels = VIDEO_CHANNELS.filter((c) => !skip.has(c));
  const formats = [];
  if (channels.includes('reels')) formats.push('reel');
  if (channels.includes('shorts') || channels.includes('tiktok')) formats.push('short');
  if (channels.includes('youtube')) formats.push('uitleg');
  return formats;
}

/** The published name of a video format: uitleg is the YouTube video. */
export const formatName = (format) => (format === 'uitleg' ? 'youtube' : format);

/**
 * The files of an item, in a fixed order, with predictable names so the url is
 * known before the upload: <id>-<n>.png per slide; per video format
 * <id>-<format>.mp4 and <id>-<format>-cover.png.
 */
export function fileNames(item, { test = false } = {}) {
  const p = test ? TEST_PREFIX : '';
  if (item.kind === 'post') return item.slides.map((_, i) => ({ name: `${p}${item.id}-${i + 1}.png`, slide: i }));
  return videoFormats(item).flatMap((format) => [
    { name: `${p}${item.id}-${formatName(format)}.mp4`, format, part: 'video' },
    { name: `${p}${item.id}-${formatName(format)}-cover.png`, format, part: 'cover' },
  ]);
}

/** The public url of a file in the release. */
export const releaseUrl = (name) => `https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${encodeURIComponent(name)}`;

export const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

/**
 * What to do with one rendered file, given the assets already in the release
 * ([{name, digest, id}], digest as "sha256:<hex>" or null): 'skip' when the same
 * name has the same content, 'replace' when the name exists with other content
 * (or an unknown digest), else 'upload'. Running twice never adds a second file.
 */
export function uploadAction(name, localSha, assets) {
  const existing = assets.find((a) => a.name === name);
  if (!existing) return { kind: 'upload' };
  if (existing.digest && existing.digest === `sha256:${localSha}`) return { kind: 'skip' };
  return { kind: 'replace', assetId: existing.id };
}
