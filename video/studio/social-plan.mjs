// CLI for the Publiceerder (docs/marketing/publiceerder.md): from one Social-studio
// document to the workflow input and the urls its files will have.
//   node video/studio/social-plan.mjs <doc.json> [--test]
// doc.json: {"collection": "posts"|"videos", "id": "<doc_id>", "data": {...the document}}
// Prints JSON: {item_b64, test, media, urls}. Exit 1 with a Dutch message when the
// document cannot be rendered; nothing is changed anywhere.

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { itemFromStudio, mediaFor, mediaUrls } from './social-items.mjs';

export function plan(doc, { test = false } = {}) {
  const item = itemFromStudio(doc);
  const media = mediaFor(item, { test });
  return { item_b64: Buffer.from(JSON.stringify(item)).toString('base64'), test, media, urls: mediaUrls(media) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [file, ...flags] = process.argv.slice(2);
  try {
    if (!file) throw new Error('Gebruik: node video/studio/social-plan.mjs <doc.json> [--test]');
    console.log(JSON.stringify(plan(JSON.parse(fs.readFileSync(file, 'utf8')), { test: flags.includes('--test') }), null, 2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
