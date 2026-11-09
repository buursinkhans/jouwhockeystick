// Editor check for social content items (docs/marketing/merkstem.md).
// Read-only: validates one item or a list against the content schema and the
// writing rules, prints the findings and exits 1 if any item is not ready.
// The Social-planner runs it on its proposals before they reach the owner.
// Usage: npm run --silent marketing:check -- <items.json>
import { readFileSync } from 'node:fs';
import { contentItemSchema } from '../src/marketing/content';
import { checkItem } from '../src/marketing/editorCheck';

const [file] = process.argv.slice(2);
if (!file) {
  console.error('Gebruik: npm run --silent marketing:check -- <items.json>');
  process.exit(2);
}
const raw: unknown = JSON.parse(readFileSync(file, 'utf8'));
const list = Array.isArray(raw) ? raw : [raw];
let failed = 0;
for (const entry of list) {
  const parsed = contentItemSchema.safeParse(entry);
  if (!parsed.success) {
    failed += 1;
    console.log(`✗ ${String((entry as { id?: unknown }).id ?? '?')}: schema: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    continue;
  }
  const findings = checkItem(parsed.data);
  if (findings.length === 0) {
    console.log(`✓ ${parsed.data.id}`);
  } else {
    failed += 1;
    console.log(`✗ ${parsed.data.id}`);
    for (const f of findings) console.log(`  ${f.level} ${f.rule}: ${f.detail}`);
  }
}
console.log(`${list.length - failed} van ${list.length} klaar voor goedkeuring.`);
process.exit(failed > 0 ? 1 : 0);
