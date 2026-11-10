// Pure helpers for the workflow social-render.yml (docs/marketing/bouwplan-2.0.md,
// fase 0): read and check a Social-studio item, name its files, give their public
// url in the GitHub Release "social-media", and decide what needs an upload.
// No I/O here, so the tests (node --test) cover all of it.

import { createHash } from 'node:crypto';
import { z } from 'zod';

import { studioItem } from './social-names.mjs';

export { REPO, RELEASE_TAG, TEST_PREFIX, fileNames, formatName, mediaFor, mediaUrls, releaseUrl, studioItem, videoFormats } from './social-names.mjs';

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

/** The render item for a Social-studio document, checked like the workflow does (Zod). */
export const itemFromStudio = (doc) => decodeItem(Buffer.from(JSON.stringify(studioItem(doc))).toString('base64'));
