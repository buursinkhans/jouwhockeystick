// File names, urls and media for a Social-studio item, without any dependency, so the
// Publiceerder can run it in a claude.ai cloud session where npm is not reachable
// (docs/marketing/publiceerder.md). The full check with Zod runs in the workflow
// social-render.yml (social-items.mjs), on the same item.

export const REPO = 'buursinkhans/jouwhockeystick';
export const RELEASE_TAG = 'social-media';
/** Test runs get this prefix, so they never touch the files of a real item. */
export const TEST_PREFIX = 'test-';

const VIDEO_CHANNELS = ['reels', 'shorts', 'tiktok', 'youtube'];

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

// Fields of a studio video that videoart.js and the YouTube texts read; the rest
// of the document (status, Metricool ids, approval) stays out of the render.
const VIDEO_FIELDS = ['titel', 'datum', 'tijden', 'kanalen', 'scenes', 'short', 'youtube', 'reel', 'tiktok', 'thumbnail', 'soort', 'hook', 'pagina'];

/**
 * The render item for a Social-studio document ({collection: 'posts'|'videos', id, data}),
 * with a first check of what the names depend on. Throws with a Dutch message.
 */
export function studioItem({ collection, id, data }) {
  const d = data && typeof data === 'object' ? data : {};
  if (typeof id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(id)) throw new Error('id: alleen a-z, 0-9 en -, hooguit 80 tekens');
  if (collection === 'posts') {
    if (!Array.isArray(d.slides) || d.slides.length < 1 || d.slides.length > 10) throw new Error('slides: 1 tot 10 slides nodig');
    return { kind: 'post', id, slides: d.slides };
  }
  if (collection === 'videos') {
    if (!Array.isArray(d.scenes) || d.scenes.length < 1 || d.scenes.length > 20) throw new Error('scenes: 1 tot 20 scènes nodig');
    return { kind: 'video', id, ...Object.fromEntries(VIDEO_FIELDS.filter((k) => d[k] !== undefined).map((k) => [k, d[k]])) };
  }
  throw new Error(`Onbekende collectie: ${collection}`);
}

/**
 * What the Publiceerder writes in metricoolAkkoord.media once every url answers:
 * a post's slides in order; per video format the file and its cover
 * (uitleg = the YouTube video).
 */
export function mediaFor(item, { test = false } = {}) {
  const files = fileNames(item, { test }).map((f) => ({ ...f, url: releaseUrl(f.name) }));
  if (item.kind === 'post') return { slides: files.map(({ name, url }) => ({ name, url })) };
  const media = {};
  for (const f of files) media[f.part === 'cover' ? `${f.format}Cover` : f.format] = { name: f.name, url: f.url };
  return media;
}

/** Every url in a media object, in order. */
export const mediaUrls = (media) => Object.values(media).flatMap((v) => (Array.isArray(v) ? v.map((x) => x.url) : [v.url]));
