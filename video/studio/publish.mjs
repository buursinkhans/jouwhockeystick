// Entry point of the workflow "Video publiceren" (docs/video.md §10).
// Input: VIDEO_B64, a base64 JSON video script from the Social-studio, approved by
// the owner. Renders the Short (and the 16:9 video when it is not skipped),
// schedules them on YouTube at their date and time, and reports the result as a
// comment on the issue with label `video-publicatie`, where the scheduled task
// "Video-publicatie" picks it up and writes it back to the Social-studio.
//
// DRY_RUN=true renders without uploading (a test run).

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './render.mjs';
import { MIN_LEAD_MINUTES, accessToken, metadata, publishMoment, setThumbnail, targets, timeFor, upload, validate, watchUrl } from './youtube.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const LABEL = 'video-publicatie';
const dryRun = process.env.DRY_RUN === 'true';

function gh(args, input) {
  const r = spawnSync('gh', args, { input, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`gh ${args[0]} ${args[1] || ''}: ${r.stderr}`);
  return r.stdout;
}

/** The issue that collects results; created the first time. */
function resultIssue(repo) {
  const found = JSON.parse(gh(['api', `repos/${repo}/issues?state=open&labels=${LABEL}&per_page=1`]));
  if (found.length) return found[0].number;
  try { gh(['api', '-X', 'POST', `repos/${repo}/labels`, '-f', `name=${LABEL}`, '-f', 'color=7B3FC4', '-f', 'description=Resultaten van de workflow Video publiceren']); } catch { /* exists */ }
  const issue = JSON.parse(gh(['api', '-X', 'POST', `repos/${repo}/issues`, '-f', 'title=Video publiceren: resultaten',
    '-f', 'body=Hier zet de workflow *Video publiceren* per run het resultaat neer. De geplande taak *Video-publicatie* leest het en zet het terug in de Social-studio. Zie docs/video.md §10.', '-f', `labels[]=${LABEL}`]));
  return issue.number;
}

function report(result) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(result, null, 2));
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) { console.log(JSON.stringify(result, null, 2)); return; }
  const nr = resultIssue(repo);
  const body = `<!-- video-publicatie id=${result.id} run=${result.run} -->\n**${result.id}** · run ${result.run}${result.dryRun ? ' · test zonder upload' : ''}\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
  gh(['api', '-X', 'POST', `repos/${repo}/issues/${nr}/comments`, '-F', 'body=@-'], body);
}

async function main() {
  const result = { id: null, run: process.env.GITHUB_RUN_ID || 'lokaal', dryRun, tijd: new Date().toISOString(), kanalen: {}, fout: null };
  let video;
  try {
    video = JSON.parse(Buffer.from(process.env.VIDEO_B64 || '', 'base64').toString('utf8'));
  } catch {
    result.fout = 'De video-gegevens zijn geen geldige JSON.';
    report(result);
    return 1;
  }
  result.id = typeof video.id === 'string' && /^[a-z0-9-]{1,80}$/.test(video.id) ? video.id : 'onbekend';
  const errors = validate(video);
  if (errors.length) { result.fout = errors.join(' '); report(result); return 1; }

  // Which parts, and when. A moment in the past (or too close) is refused, never published at once.
  const plan = [];
  for (const target of targets(video)) {
    const at = publishMoment(video.datum, timeFor(video, target));
    if (at.getTime() < Date.now() + MIN_LEAD_MINUTES * 60000) {
      result.kanalen[target] = { status: 'mislukt', fout: `Het publicatiemoment (${video.datum} ${timeFor(video, target)}) ligt in het verleden of binnen ${MIN_LEAD_MINUTES} minuten. Kies een latere datum en keur opnieuw goed.` };
    } else plan.push({ target, at });
  }
  if (!plan.length) {
    if (!Object.keys(result.kanalen).length) result.fout = 'Niets te doen: Short en YouTube-video zijn overgeslagen of al ingepland.';
    report(result);
    return result.fout || Object.values(result.kanalen).some((k) => k.status === 'mislukt') ? 1 : 0;
  }

  let files;
  try {
    const formats = plan.map((p) => (p.target === 'shorts' ? 'short' : 'uitleg'));
    files = await render(video, { formats, outDir: OUT, log: console.log });
  } catch (e) {
    result.fout = 'Renderen lukte niet: ' + e.message;
    report(result);
    return 1;
  }

  let token = null;
  if (!dryRun) {
    try {
      token = await accessToken({ clientId: process.env.YOUTUBE_CLIENT_ID, clientSecret: process.env.YOUTUBE_CLIENT_SECRET, refreshToken: process.env.YOUTUBE_REFRESH_TOKEN });
    } catch (e) {
      result.fout = e.message;
      report(result);
      return 1;
    }
  }
  for (const { target, at } of plan) {
    const file = target === 'shorts' ? files.short.mp4 : files.uitleg.mp4;
    const entry = { publishAt: at.toISOString(), seconden: Math.round(target === 'shorts' ? files.short.seconds : files.uitleg.seconds) };
    try {
      const meta = metadata(video, target, at);
      entry.titel = meta.snippet.title;
      if (dryRun) {
        entry.status = 'test';
      } else {
        const id = await upload(token, meta, file);
        entry.status = 'ingepland';
        entry.videoId = id;
        entry.url = watchUrl(target, id);
        if (target === 'youtube') {
          try { await setThumbnail(token, id, files.thumbnail); } catch (e) { entry.waarschuwing = e.message + ' De video staat er wel; zet de thumbnail zelf in YouTube Studio.'; }
        }
      }
    } catch (e) {
      entry.status = 'mislukt';
      entry.fout = e.message;
    }
    result.kanalen[target] = entry;
  }
  report(result);
  return Object.values(result.kanalen).some((k) => k.status === 'mislukt') ? 1 : 0;
}

process.exitCode = await main();
