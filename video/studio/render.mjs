// Renders a Social-studio video script to MP4 files and thumbnails, with the
// same drawing code as the Social-studio page (videoart.js), our own music and
// sound effects (assets/video). Used by publish.mjs in the workflow
// "Video publiceren" (docs/video.md §10).
//
// Needs Playwright (Chromium) and ffmpeg. Chromium comes from Playwright, or
// from CHROMIUM_PATH when set.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const FONTS = path.join(ROOT, 'assets', 'fonts');
const SOUNDS = path.join(ROOT, 'assets', 'video');
const FRAMES_PER_CALL = 15;

/** The page in which the renderer runs: our own fonts, then videoart.js. */
function harness(dir) {
  for (const f of ['BricolageGrotesque-Medium-opsz96.ttf', 'BricolageGrotesque-ExtraBold-opsz96.ttf', 'InstrumentSans-Regular.ttf']) {
    fs.copyFileSync(path.join(FONTS, f), path.join(dir, f));
  }
  fs.copyFileSync(path.join(HERE, 'videoart.js'), path.join(dir, 'videoart.js'));
  // Instrument Sans only exists as Regular in the repo; it also serves 500/600.
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Bricolage Grotesque"; src: url("BricolageGrotesque-Medium-opsz96.ttf"); font-weight: 400 600; }
@font-face { font-family: "Bricolage Grotesque"; src: url("BricolageGrotesque-ExtraBold-opsz96.ttf"); font-weight: 700 900; }
@font-face { font-family: "Instrument Sans"; src: url("InstrumentSans-Regular.ttf"); font-weight: 400 700; }
</style></head><body><script src="videoart.js"></script></body></html>`;
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, html);
  return file;
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`${cmd} faalde: ${String(r.stderr || r.error || '').slice(-1500)}`);
  return r;
}

/**
 * ffmpeg arguments for one video: the frames, the music (fade in 0.2 s, fade out
 * over the last 1.3 s, as in the studio) and one input per sound cue.
 * Exported for the tests.
 */
export function ffmpegArgs({ framesPattern, fps, total, cues, volume, soundFiles, out }) {
  const args = ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', framesPattern];
  const filters = [];
  const mix = [];
  let input = 1;
  if (soundFiles.music) {
    args.push('-i', soundFiles.music);
    const fadeAt = Math.max(0.3, total - 1.3).toFixed(3);
    filters.push(`[${input}:a]atrim=0:${total.toFixed(3)},asetpts=PTS-STARTPTS,volume=${volume.music},afade=t=in:d=0.2,afade=t=out:st=${fadeAt}:d=1.3[m]`);
    mix.push('[m]');
    input++;
  }
  cues.forEach((q, i) => {
    const file = soundFiles[q.name];
    if (!file) return;
    args.push('-i', file);
    const ms = Math.max(0, Math.round(q.at * 1000));
    filters.push(`[${input}:a]adelay=${ms}|${ms},volume=${volume[q.name] ?? 0.3}[c${i}]`);
    mix.push(`[c${i}]`);
    input++;
  });
  if (mix.length) {
    filters.push(`${mix.join('')}amix=inputs=${mix.length}:normalize=0:duration=longest,atrim=0:${total.toFixed(3)}[a]`);
    args.push('-filter_complex', filters.join(';'), '-map', '0:v', '-map', '[a]', '-c:a', 'aac', '-b:a', '160k');
  } else {
    args.push('-map', '0:v');
  }
  args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-r', String(fps), '-t', total.toFixed(3), '-movflags', '+faststart', out);
  return args;
}

/**
 * Renders the requested formats ('short' = 9:16, 'uitleg' = 16:9) and both thumbnails.
 * Returns { short?: {mp4, seconds}, uitleg?: {mp4, seconds}, thumbnail, thumbnailShort }.
 */
export async function render(video, { formats = ['short'], outDir, log = () => {} } = {}) {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
  fs.mkdirSync(outDir, { recursive: true });
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'videoart-'));
  const page0 = harness(work);
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const result = {};
  try {
    const page = await browser.newPage();
    await page.goto('file://' + page0);
    await page.evaluate(async (v) => {
      window.__v = v;
      await Promise.all(['500 40px "Bricolage Grotesque"', '800 40px "Bricolage Grotesque"', '400 40px "Instrument Sans"'].map((f) => document.fonts.load(f)));
      await window.VideoArt.fontsReady;
    }, video);

    for (const fmt of formats) {
      const info = await page.evaluate((f) => {
        const VA = window.VideoArt;
        const tl = VA.timeline(window.__v, f);
        const F = VA.FORMATS[f];
        const c = document.createElement('canvas'); c.width = F.W; c.height = F.H;
        window.__tl = tl; window.__c = c; window.__ctx = c.getContext('2d');
        return { total: tl.total, fps: VA.FPS, cues: VA.cues(window.__v, f, tl), volume: VA.VOLUME, sounds: VA.SOUNDS };
      }, fmt);
      if (!(info.total > 0)) throw new Error('Het script heeft geen scènes.');
      const frames = Math.round(info.total * info.fps);
      const dir = fs.mkdtempSync(path.join(work, fmt + '-'));
      log(`${fmt}: ${frames} beelden (${info.total.toFixed(1)} s)`);
      for (let a = 0; a < frames; a += FRAMES_PER_CALL) {
        const b = Math.min(frames, a + FRAMES_PER_CALL);
        const batch = await page.evaluate(([from, to, f]) => {
          const VA = window.VideoArt, out = [];
          for (let i = from; i < to; i++) {
            VA.drawFrame(window.__ctx, window.__v, f, window.__tl, Math.min(i / VA.FPS, window.__tl.total - 0.001));
            out.push(window.__c.toDataURL('image/jpeg', 0.94).slice('data:image/jpeg;base64,'.length));
          }
          return out;
        }, [a, b, fmt]);
        batch.forEach((b64, k) => fs.writeFileSync(path.join(dir, `f${String(a + k).padStart(5, '0')}.jpg`), Buffer.from(b64, 'base64')));
      }
      const soundFiles = {};
      for (const [name, file] of Object.entries(info.sounds)) {
        const p = path.join(SOUNDS, file);
        if (fs.existsSync(p)) soundFiles[name] = p;
      }
      const mp4 = path.join(outDir, `${video.id || 'video'}-${fmt === 'short' ? 'short' : 'youtube'}.mp4`);
      run('ffmpeg', ffmpegArgs({ framesPattern: path.join(dir, 'f%05d.jpg'), fps: info.fps, total: info.total, cues: info.cues, volume: info.volume, soundFiles, out: mp4 }));
      result[fmt] = { mp4, seconds: info.total };
      fs.rmSync(dir, { recursive: true, force: true });
    }

    const thumbs = await page.evaluate(() => {
      const VA = window.VideoArt;
      const a = document.createElement('canvas'); VA.thumbnail(a, window.__v);
      const b = document.createElement('canvas'); VA.thumbnailShort(b, window.__v);
      const strip = (u) => u.slice('data:image/png;base64,'.length);
      return [strip(a.toDataURL('image/png')), strip(b.toDataURL('image/png'))];
    });
    result.thumbnail = path.join(outDir, `${video.id || 'video'}-thumbnail.png`);
    result.thumbnailShort = path.join(outDir, `${video.id || 'video'}-thumbnail-short.png`);
    fs.writeFileSync(result.thumbnail, Buffer.from(thumbs[0], 'base64'));
    fs.writeFileSync(result.thumbnailShort, Buffer.from(thumbs[1], 'base64'));
  } finally {
    await browser.close();
    fs.rmSync(work, { recursive: true, force: true });
  }
  return result;
}

// CLI for a local check: node render.mjs <video.json> [outDir]
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [file, out = path.join(HERE, 'out')] = process.argv.slice(2);
  if (!file) { console.error('Gebruik: node render.mjs <video.json> [map]'); process.exit(2); }
  const video = JSON.parse(fs.readFileSync(file, 'utf8'));
  const r = await render(video, { formats: ['short', 'uitleg'], outDir: out, log: console.log });
  console.log(JSON.stringify(r, null, 2));
}
