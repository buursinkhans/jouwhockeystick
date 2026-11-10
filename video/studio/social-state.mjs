// The Publiceerder's own record (docs/marketing/publiceerder.md): what it rendered,
// what it put in Metricool (id, uuid) and what went wrong, per studio item. It lives
// in the repo, on the branch "social-state" (video/studio/state/publiceerder.json),
// so the routine never writes to the Social-studio database: such a write asks for
// permission in every cloud run (decision log 2026-11-10). No dependencies: it runs
// in a claude.ai cloud session, where npm is not reachable; GitHub through `gh api`.
//
//   node video/studio/social-state.mjs get            → {"sha": ..., "state": {...}}
//   node video/studio/social-state.mjs put <file> <sha>
//     exit 0 written, exit 4 when the file changed since <sha> (read again and redo).
//   node video/studio/social-state.mjs budget <YYYY-MM> → [{uuid, moment}] of that month, for marketing:budget

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const STATE_BRANCH = 'social-state';
export const STATE_PATH = 'video/studio/state/publiceerder.json';
const REPO = process.env.GITHUB_REPOSITORY || 'buursinkhans/jouwhockeystick';

export const emptyState = () => ({ versie: 1, items: {}, laatsteRun: null, tegoed: null });

/** The key of a studio item in the record: "posts/<id>" or "videos/<id>". */
export const itemKey = (collection, id) => `${collection}/${id}`;

/** Every Metricool post in the record, as {uuid, moment}: what the allowance counts (also published ones). */
export function plannedPosts(state) {
  return Object.values(state.items ?? {}).flatMap((item) =>
    Object.values(item.kanalen ?? {}).filter((k) => k && k.uuid && k.moment).map((k) => ({ uuid: k.uuid, moment: k.moment })),
  );
}

/** A record read from GitHub, or a new one; anything that is not a record is refused. */
export function parseState(text) {
  const s = JSON.parse(text);
  if (!s || typeof s !== 'object' || s.versie !== 1 || typeof s.items !== 'object' || s.items === null) throw new Error('Het bestand is geen geldige stand van de Publiceerder.');
  return s;
}

function gh(args, input) {
  return spawnSync('gh', args, { encoding: 'utf8', input, maxBuffer: 32 * 1024 * 1024 });
}

function ensureBranch() {
  if (gh(['api', `repos/${REPO}/git/ref/heads/${STATE_BRANCH}`]).status === 0) return;
  const main = gh(['api', `repos/${REPO}/git/ref/heads/main`, '--jq', '.object.sha']);
  if (main.status !== 0) throw new Error('Kan main niet lezen: ' + main.stderr.slice(-300));
  const r = gh(['api', '-X', 'POST', `repos/${REPO}/git/refs`, '-f', `ref=refs/heads/${STATE_BRANCH}`, '-f', `sha=${main.stdout.trim()}`]);
  if (r.status !== 0 && !/Reference already exists/.test(r.stderr)) throw new Error('Kan de branch niet maken: ' + r.stderr.slice(-300));
}

export function getState() {
  ensureBranch();
  const r = gh(['api', `repos/${REPO}/contents/${STATE_PATH}?ref=${STATE_BRANCH}`]);
  if (r.status !== 0) {
    if (/Not Found|404/.test(r.stderr + r.stdout)) return { sha: null, state: emptyState() };
    throw new Error('Kan de stand niet lezen: ' + r.stderr.slice(-300));
  }
  const file = JSON.parse(r.stdout);
  return { sha: file.sha, state: parseState(Buffer.from(file.content, 'base64').toString('utf8')) };
}

/** Writes the record; returns false when it changed since `sha` (GitHub answers 409). */
export function putState(state, sha) {
  parseState(JSON.stringify(state));
  const body = {
    message: 'Publiceerder: stand bijgewerkt',
    content: Buffer.from(JSON.stringify(state, null, 2) + '\n').toString('base64'),
    branch: STATE_BRANCH,
    ...(sha ? { sha } : {}),
  };
  const r = gh(['api', '-X', 'PUT', `repos/${REPO}/contents/${STATE_PATH}`, '--input', '-'], JSON.stringify(body));
  if (r.status === 0) return true;
  if (/409|does not match|sha/.test(r.stderr + r.stdout)) return false;
  throw new Error('Kan de stand niet schrijven: ' + (r.stderr || r.stdout).slice(-300));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, a, b] = process.argv.slice(2);
  try {
    if (cmd === 'get') console.log(JSON.stringify(getState()));
    else if (cmd === 'put') {
      if (!a) throw new Error('Gebruik: put <bestand> <sha>');
      const ok = putState(parseState(fs.readFileSync(a, 'utf8')), b && b !== 'null' ? b : null);
      if (!ok) { console.error('De stand is intussen veranderd: lees opnieuw en doe het opnieuw.'); process.exit(4); }
      console.log('ok');
    } else if (cmd === 'budget') {
      if (!/^\d{4}-\d{2}$/.test(a ?? '')) throw new Error('Gebruik: budget <JJJJ-MM>');
      console.log(JSON.stringify(plannedPosts(getState().state).filter((p) => p.moment.startsWith(a))));
    } else throw new Error('Gebruik: get | put <bestand> <sha> | budget <JJJJ-MM>');
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
