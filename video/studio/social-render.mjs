// Renders one Social-studio item headless and puts its files in the GitHub Release
// "social-media", so Metricool can fetch them from a public url
// (docs/marketing/bouwplan-2.0.md, fase 0). Run by .github/workflows/social-render.yml.
//
// Input (environment, never the shell):
//   ITEM_B64   base64 of the item's JSON (a post with slides, or a video with scenes)
//   TEST       "true": file names get the prefix "test-"
//   GH_TOKEN   the workflow's GITHUB_TOKEN, for the gh CLI
// Output: social-render-result.json and a summary in $GITHUB_STEP_SUMMARY.
//
// Needs Playwright (Chromium); videos also ffmpeg (FFMPEG_PATH), as render.mjs.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeItem, fileNames, RELEASE_TAG, releaseUrl, sha256, uploadAction, videoFormats } from './social-items.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const FONTS = path.join(ROOT, 'assets', 'fonts');
const REPO = process.env.GITHUB_REPOSITORY || 'buursinkhans/jouwhockeystick';

function gh(args, { allowFail = false } = {}) {
  const r = spawnSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && !allowFail) throw new Error(`gh ${args[0]} ${args[1] ?? ''} faalde: ${(r.stderr || '').slice(-800)}`);
  return r;
}

/** The page for SlideArt: the house fonts from the repo, then slideart.js (as render.mjs does for videos). */
function slideHarness(dir) {
  for (const f of ['BricolageGrotesque-Medium-opsz96.ttf', 'BricolageGrotesque-ExtraBold-opsz96.ttf', 'InstrumentSans-Regular.ttf']) {
    fs.copyFileSync(path.join(FONTS, f), path.join(dir, f));
  }
  fs.copyFileSync(path.join(HERE, 'slideart.js'), path.join(dir, 'slideart.js'));
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Bricolage Grotesque"; src: url("BricolageGrotesque-Medium-opsz96.ttf"); font-weight: 400 600; }
@font-face { font-family: "Bricolage Grotesque"; src: url("BricolageGrotesque-ExtraBold-opsz96.ttf"); font-weight: 700 900; }
@font-face { font-family: "Instrument Sans"; src: url("InstrumentSans-Regular.ttf"); font-weight: 400 700; }
</style></head><body><script src="slideart.js"></script></body></html>`;
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, html);
  return file;
}

/** PNG per slide, in order. */
async function renderSlides(item, outDir) {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'slideart-'));
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  try {
    const page = await browser.newPage();
    await page.goto('file://' + slideHarness(work));
    const pngs = await page.evaluate(async ({ slides, serie }) => {
      await Promise.all(['800 80px "Bricolage Grotesque"', '400 40px "Instrument Sans"'].map((f) => document.fonts.load(f)));
      await window.SlideArt.fontsReady;
      return slides.map((s, i) => {
        const c = document.createElement('canvas');
        window.SlideArt.render(c, s, i, slides.length, { serie });
        return c.toDataURL('image/png').slice('data:image/png;base64,'.length);
      });
    }, { slides: item.slides, serie: item.serie ?? null });
    return pngs.map((b64, i) => {
      const file = path.join(outDir, `slide-${i + 1}.png`);
      fs.writeFileSync(file, Buffer.from(b64, 'base64'));
      return file;
    });
  } finally {
    await browser.close();
    fs.rmSync(work, { recursive: true, force: true });
  }
}

/** Local file per published name. */
async function renderItem(item, names, outDir) {
  const local = new Map();
  if (item.kind === 'post') {
    const files = await renderSlides(item, outDir);
    names.forEach((n) => local.set(n.name, files[n.slide]));
    return local;
  }
  const { render } = await import('./render.mjs');
  const r = await render(item, { formats: videoFormats(item), outDir, log: console.log });
  const cover = { reel: r.thumbnailReel, short: r.thumbnailShort, uitleg: r.thumbnail };
  for (const n of names) local.set(n.name, n.part === 'video' ? r[n.format].mp4 : cover[n.format]);
  return local;
}

function ensureRelease() {
  if (gh(['release', 'view', RELEASE_TAG, '--repo', REPO, '--json', 'tagName'], { allowFail: true }).status === 0) return;
  gh(['release', 'create', RELEASE_TAG, '--repo', REPO, '--latest=false', '--title', 'Social-media (beelden voor Metricool)',
    '--notes', 'Automatisch gevuld door de workflow social-render.yml. Metricool haalt de beelden en video\'s hier op. Niet verwijderen.']);
}

function releaseAssets() {
  const r = gh(['api', `repos/${REPO}/releases/tags/${RELEASE_TAG}`, '--jq', '[.assets[] | {id, name, digest}]']);
  return JSON.parse(r.stdout || '[]');
}

/** The public url answers (GitHub redirects to its file storage). */
async function reachable(url) {
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (res.ok) return true;
    } catch { /* try again */ }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
  return false;
}

async function main() {
  const item = decodeItem(process.env.ITEM_B64);
  const test = process.env.TEST === 'true';
  const names = fileNames(item, { test });
  console.log(`${item.kind} ${item.id}: ${names.length} bestanden${test ? ' (test)' : ''}`);
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'social-'));
  const local = await renderItem(item, names, outDir);

  ensureRelease();
  const assets = releaseAssets();
  const files = [];
  for (const n of names) {
    const file = local.get(n.name);
    if (!file || !fs.existsSync(file)) throw new Error(`Niet gemaakt: ${n.name}`);
    const action = uploadAction(n.name, sha256(fs.readFileSync(file)), assets);
    if (action.kind !== 'skip') {
      // Upload under the published name; --clobber replaces a file with other content.
      const named = path.join(outDir, n.name);
      if (file !== named) fs.copyFileSync(file, named);
      gh(['release', 'upload', RELEASE_TAG, named, '--repo', REPO, ...(action.kind === 'replace' ? ['--clobber'] : [])]);
    }
    const url = releaseUrl(n.name);
    files.push({ name: n.name, url, action: action.kind, reachable: await reachable(url) });
  }

  const result = { id: item.id, kind: item.kind, test, files };
  fs.writeFileSync(path.join(process.cwd(), 'social-render-result.json'), JSON.stringify(result, null, 2));
  const lines = [`### ${item.kind} ${item.id}${test ? ' (test)' : ''}`, '', '| Bestand | Actie | Bereikbaar |', '|---|---|---|',
    ...files.map((f) => `| [${f.name}](${f.url}) | ${f.action} | ${f.reachable ? 'ja' : 'nee'} |`)];
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  if (files.some((f) => !f.reachable)) throw new Error('Niet elk bestand is openbaar bereikbaar.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
