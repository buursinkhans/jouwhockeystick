// The Publiceerder's own record (docs/marketing/publiceerder.md): what it rendered,
// what it put in Metricool (id, uuid) and what went wrong, per studio item. It lives
// in the repo, on the branch "social-state" (video/studio/state/publiceerder.json).
// The routine never writes to the Social-studio database (a write there asks for
// permission in every cloud run), and the proxy of a cloud session does not allow
// writing files through the GitHub API. So the routine reads the record through the
// API and sends each change as a patch to the workflow social-state.yml, which writes
// it with its own token, one change at a time (decision log 2026-11-10).
// No dependencies: it runs in a claude.ai cloud session, where npm is not reachable.
//
//   node video/studio/social-state.mjs get                → {"sha", "state"}
//   node video/studio/social-state.mjs patch <file> [--wait]
//       sends {items: {"posts/<id>": <whole record> | null}, laatsteRun?, tegoed?};
//       with --wait it waits (max. 3 minutes) until the record shows it; exit 5 if not.
//   node video/studio/social-state.mjs budget <YYYY-MM>   → [{uuid, moment}] of that month
//   node video/studio/social-state.mjs apply <state-file>  (the workflow: patch from $PATCH_B64)

import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const STATE_BRANCH = 'social-state';
export const STATE_PATH = 'video/studio/state/publiceerder.json';
const REPO = process.env.GITHUB_REPOSITORY || 'buursinkhans/jouwhockeystick';
const KEY = /^(posts|videos)\/[a-z0-9-]{1,80}$/;

export const emptyState = () => ({ versie: 1, items: {}, laatsteRun: null, tegoed: null, wijziging: null });

/** The key of a studio item in the record: "posts/<id>" or "videos/<id>". */
export const itemKey = (collection, id) => `${collection}/${id}`;

/** Every Metricool post in the record, as {uuid, moment}: what the allowance counts (also published ones). */
export function plannedPosts(state) {
  return Object.values(state.items ?? {}).flatMap((item) =>
    Object.values(item?.kanalen ?? {}).filter((k) => k && k.uuid && k.moment).map((k) => ({ uuid: k.uuid, moment: k.moment })),
  );
}

/** A record read from GitHub; anything that is not a record is refused. */
export function parseState(text) {
  const s = JSON.parse(text);
  if (!s || typeof s !== 'object' || s.versie !== 1 || typeof s.items !== 'object' || s.items === null || Array.isArray(s.items)) {
    throw new Error('Het bestand is geen geldige stand van de Publiceerder.');
  }
  return s;
}

/** A patch: whole item records per key (null removes one), and optionally laatsteRun and tegoed. Throws on anything else. */
export function validatePatch(patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new Error('De wijziging is geen object.');
  const allowed = new Set(['id', 'items', 'laatsteRun', 'tegoed']);
  for (const k of Object.keys(patch)) if (!allowed.has(k)) throw new Error(`Onbekend veld in de wijziging: ${k}`);
  if (typeof patch.id !== 'string' || !/^[a-z0-9-]{8,64}$/.test(patch.id)) throw new Error('De wijziging heeft geen geldige id.');
  const items = patch.items ?? {};
  if (typeof items !== 'object' || Array.isArray(items)) throw new Error('items moet een object zijn.');
  for (const [key, value] of Object.entries(items)) {
    if (!KEY.test(key)) throw new Error(`Ongeldige sleutel: ${key}`);
    if (value !== null && (typeof value !== 'object' || Array.isArray(value))) throw new Error(`Ongeldige stand voor ${key}`);
  }
  if (JSON.stringify(patch).length > 40_000) throw new Error('De wijziging is te groot.');
  return patch;
}

/** The record after a patch: each item replaced as a whole (null removes it). Pure. */
export function applyPatch(state, patch) {
  validatePatch(patch);
  const items = { ...state.items };
  for (const [key, value] of Object.entries(patch.items ?? {})) {
    if (value === null) delete items[key];
    else items[key] = value;
  }
  return {
    ...state,
    items,
    ...(patch.laatsteRun !== undefined && { laatsteRun: patch.laatsteRun }),
    ...(patch.tegoed !== undefined && { tegoed: patch.tegoed }),
    wijziging: patch.id,
  };
}

function gh(args) {
  return spawnSync('gh', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

/** Reads the record through the API (reading is allowed from a cloud session). No branch or file yet: an empty record. */
export function getState() {
  const r = gh(['api', `repos/${REPO}/contents/${STATE_PATH}?ref=${STATE_BRANCH}`]);
  if (r.status !== 0) {
    if (/Not Found|404/.test(r.stderr + r.stdout)) return { sha: null, state: emptyState() };
    throw new Error('Kan de stand niet lezen: ' + r.stderr.slice(-300));
  }
  const file = JSON.parse(r.stdout);
  return { sha: file.sha, state: parseState(Buffer.from(file.content, 'base64').toString('utf8')) };
}

/** Starts social-state.yml with the patch; with wait, polls until the record carries its id. */
export function sendPatch(patch, { wait = false } = {}) {
  const withId = { ...patch, id: patch.id ?? randomUUID() };
  validatePatch(withId);
  const b64 = Buffer.from(JSON.stringify(withId)).toString('base64');
  const r = gh(['api', '-X', 'POST', `repos/${REPO}/actions/workflows/social-state.yml/dispatches`, '-f', `ref=${process.env.SOCIAL_REF || 'main'}`, '-f', `inputs[wijziging]=${b64}`]);
  if (r.status !== 0) throw new Error('Kan de stand niet bijwerken: ' + (r.stderr || r.stdout).slice(-300));
  if (!wait) return { id: withId.id, applied: null };
  const until = Date.now() + 180_000;
  while (Date.now() < until) {
    spawnSync('sleep', ['10']);
    try {
      const { state } = getState();
      // A later patch can follow quickly; its items include ours, so our own keys are checked too.
      const ours = Object.entries(withId.items ?? {}).every(([k, v]) => JSON.stringify(state.items[k] ?? null) === JSON.stringify(v));
      if (state.wijziging === withId.id || ours) return { id: withId.id, applied: true };
    } catch { /* read again */ }
  }
  return { id: withId.id, applied: false };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, a, b] = process.argv.slice(2);
  try {
    if (cmd === 'get') console.log(JSON.stringify(getState()));
    else if (cmd === 'patch') {
      if (!a) throw new Error('Gebruik: patch <bestand> [--wait]');
      const res = sendPatch(JSON.parse(fs.readFileSync(a, 'utf8')), { wait: b === '--wait' });
      console.log(JSON.stringify(res));
      if (res.applied === false) process.exit(5);
    } else if (cmd === 'budget') {
      if (!/^\d{4}-\d{2}$/.test(a ?? '')) throw new Error('Gebruik: budget <JJJJ-MM>');
      console.log(JSON.stringify(plannedPosts(getState().state).filter((p) => p.moment.startsWith(a))));
    } else if (cmd === 'apply') {
      // In the workflow: the checked-out branch, the patch from the environment.
      if (!a) throw new Error('Gebruik: apply <bestand>');
      const current = fs.existsSync(a) ? parseState(fs.readFileSync(a, 'utf8')) : emptyState();
      const patch = JSON.parse(Buffer.from(process.env.PATCH_B64 ?? '', 'base64').toString('utf8'));
      fs.writeFileSync(a, JSON.stringify(applyPatch(current, patch), null, 2) + '\n');
      console.log('ok');
    } else throw new Error('Gebruik: get | patch <bestand> [--wait] | budget <JJJJ-MM> | apply <bestand>');
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
