// Checks that the daily figures and the sales on social-state are sealed
// before the branch history is removed (social-state-opschonen.yml). Exits
// with code 1, and the workflow changes nothing, when a file still holds
// readable figures. Usage: node social-state-check.mjs <folder with the files>
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ALG = 'PBKDF2-SHA256/AES-256-GCM';
const sealed = (value) =>
  value && typeof value === 'object' && value.alg === ALG && typeof value.data === 'string' && typeof value.iter === 'number';

/** Problems with one file; an empty list means it is fine. */
export function problems(name, json) {
  if (name === 'dagcijfers.json') {
    const plain = ['posthog', 'google', 'bing', 'detail'].filter((key) => key in json);
    return [
      ...(json.versie === 3 ? [] : [`versie is ${json.versie}, verwacht 3`]),
      ...(sealed(json.versleuteld) ? [] : ['geen versleuteld deel']),
      ...plain.map((key) => `leesbaar veld "${key}"`),
    ];
  }
  // verkoop.json and an old dagcijfers-detail.json are sealed as a whole.
  return sealed(json) ? [] : ['niet versleuteld'];
}

export function check(folder) {
  const found = [];
  if (!existsSync(join(folder, 'dagcijfers.json'))) found.push('dagcijfers.json: ontbreekt');
  for (const name of ['dagcijfers.json', 'dagcijfers-detail.json', 'verkoop.json']) {
    const path = join(folder, name);
    if (!existsSync(path)) continue;
    let json;
    try {
      json = JSON.parse(readFileSync(path, 'utf8'));
    } catch {
      found.push(`${name}: geen geldige JSON`);
      continue;
    }
    for (const problem of problems(name, json)) found.push(`${name}: ${problem}`);
  }
  return found;
}

if (process.argv[2]) {
  const found = check(process.argv[2]);
  if (found.length) {
    for (const line of found) console.log(`::error::${line}`);
    console.log('Niet alles is versleuteld. De geschiedenis is niet aangeraakt.');
    process.exit(1);
  }
  console.log('Dagcijfers en verkoop zijn versleuteld.');
}
