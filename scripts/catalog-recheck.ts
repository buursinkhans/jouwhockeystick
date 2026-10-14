// Writes this week's re-check list (see src/catalog/recheck.ts) as Markdown.
// Run with: npm run catalog:recheck -- [recheck.md]
// In GitHub Actions it also sets the step output `count`.
import { appendFileSync, writeFileSync } from 'node:fs';
import { getCatalogProducts } from '../src/catalog/index';
import { formatRecheckList, selectRecheckBatch } from '../src/catalog/recheck';

const [mdPath = 'recheck.md'] = process.argv.slice(2);
const batch = selectRecheckBatch(getCatalogProducts());
writeFileSync(mdPath, formatRecheckList(batch));
console.log(`${batch.length} sticks voor hercontrole → ${mdPath}`);
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `count=${batch.length}\n`);
}
