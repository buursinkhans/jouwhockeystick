// Editor check for social content items (docs/marketing/merkstem.md).
// Read-only: validates one item or a list against the content schema and the
// writing rules, prints the findings and exits 1 if any item is not ready.
// The Social-planner runs it on its proposals before they reach the owner.
// Usage: npm run --silent marketing:check -- <items.json> [live-pages.json]
// live-pages.json: a JSON array of live page paths (or state/paginas from the studio);
// with it, an item whose page is not live fails (docs/marketing/merkplatform.md).
import { readFileSync } from 'node:fs';
import { contentItemSchema } from '../src/marketing/content';
import { checkItem, MANUAL_CHECKS } from '../src/marketing/editorCheck';

const [file, pagesFile] = process.argv.slice(2);
if (!file) {
  console.error('Gebruik: npm run --silent marketing:check -- <items.json>');
  process.exit(2);
}
const raw: unknown = JSON.parse(readFileSync(file, 'utf8'));
const pagesRaw: unknown = pagesFile ? JSON.parse(readFileSync(pagesFile, 'utf8')) : undefined;
// Either a plain list of paths, or state/paginas ({paginas: [{pad}]}).
const livePages = Array.isArray(pagesRaw)
  ? pagesRaw.filter((p): p is string => typeof p === 'string')
  : pagesRaw && typeof pagesRaw === 'object' && Array.isArray((pagesRaw as { paginas?: unknown }).paginas)
    ? ((pagesRaw as { paginas: { pad?: unknown }[] }).paginas.map((p) => p.pad).filter((p): p is string => typeof p === 'string'))
    : undefined;
const list = Array.isArray(raw) ? raw : [raw];
let failed = 0;
for (const entry of list) {
  const parsed = contentItemSchema.safeParse(entry);
  if (!parsed.success) {
    failed += 1;
    console.log(`✗ ${String((entry as { id?: unknown }).id ?? '?')}: schema: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    continue;
  }
  const findings = checkItem(parsed.data, { livePages });
  if (findings.length === 0) {
    console.log(`✓ ${parsed.data.id}`);
  } else {
    failed += 1;
    console.log(`✗ ${parsed.data.id}`);
    for (const f of findings) console.log(`  ${f.level} ${f.rule}: ${f.detail}`);
  }
}
console.log(`${list.length - failed} van ${list.length} klaar voor goedkeuring.`);
console.log('Zelf nagaan per item (geen automatische controle):');
for (const q of MANUAL_CHECKS) console.log(`  - ${q}`);
process.exit(failed > 0 ? 1 : 0);
