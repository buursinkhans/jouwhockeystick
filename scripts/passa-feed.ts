// PassaHockey feed (read-only): downloads the TradeTracker product feed of
// PassaHockey and compares it with the catalog: are our PassaHockey links
// still live and in stock, which of our sticks could get a link, and which
// sticks does PassaHockey sell that we do not have yet. Writes JSON for the
// catalog agent and a Dutch report. Never changes the catalog itself.
// Usage: npm run passa:feed -- [passa.json] [passa.md] [feed.xml]
// With a third argument it reads that file instead of downloading.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { getDiscipline } from '../src/catalog/discipline';
import { getCatalogProducts } from '../src/catalog/index';
import {
  PASSAHOCKEY_FEED_URL,
  comparePassaFeed,
  parsePassaFeed,
  type PassaFeedResult,
  type PassaStickModel,
} from '../src/catalog/passaFeed';

/** Gaps listed in the report; the catalog agent adds at most 2 sticks a week anyway. */
const GAP_LIMIT = 15;

const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;
const price = (m: PassaStickModel) => (m.priceMin === m.priceMax ? euro(m.priceMin) : `${euro(m.priceMin)}–${euro(m.priceMax)}`);
const sizes = (m: PassaStickModel) => (m.sizesInches.length ? `${m.sizesInches.join(', ')} inch` : 'maten onbekend');

function modelLine(m: PassaStickModel): string {
  return `${m.name} (${m.brand}; ${m.discipline}; ${m.gender || 'leeftijd onbekend'}; ${sizes(m)}; ${price(m)}${m.inStock ? '' : '; uitverkocht'}) — ${m.url}`;
}

function report(date: string, total: number, result: PassaFeedResult): string {
  const problems = result.linked.filter((l) => l.kind !== 'ok');
  const lines = [
    `# PassaHockey-feed (${date})`,
    '',
    `${total} hockeysticks in de feed van PassaHockey (TradeTracker). Alleen lezen: dit rapport verandert niets aan de catalogus. Prijzen zijn PassaHockey-prijzen op het moment van meten; zet ze nooit als korting op de site.`,
    '',
    '## Onze PassaHockey-links',
    '',
    `${result.linked.length - problems.length} van ${result.linked.length} links staan in de feed en zijn leverbaar.`,
    '',
    ...problems.map((p) =>
      p.kind === 'uitverkocht'
        ? `- **Uitverkocht:** \`${p.slug}\` — ${p.url}`
        : `- **Niet meer in de feed** (pagina weg of nieuwe URL): \`${p.slug}\` — ${p.url}`,
    ),
    ...(problems.length ? [''] : []),
    '## Voorstellen om te koppelen',
    '',
    'Sticks uit onze catalogus zonder PassaHockey-link, waarvoor de feed een leverbare stick met dezelfde naam heeft. Automatisch gematcht: controleer per stick dat het hetzelfde model, dezelfde bow en dezelfde jaargang is.',
    '',
  ];
  if (result.suggestions.length === 0) lines.push('Geen.', '');
  for (const s of result.suggestions) {
    lines.push(`### \`${s.slug}\` — ${s.name}`, '', ...s.candidates.map((c) => `- ${modelLine(c)}`), '');
  }
  lines.push(
    '## Bij PassaHockey, nog niet in onze catalogus',
    '',
    `Leverbare sticks die niets in onze catalogus matchen (${result.gaps.length} in totaal). De feed kent geen populariteit: merken die we al voeren eerst, daarna het grootste aantal maten. Top ${GAP_LIMIT}:`,
    '',
  );
  for (const [i, m] of result.gaps.slice(0, GAP_LIMIT).entries()) {
    lines.push(`${i + 1}. ${modelLine(m)}`, `   - Feed: ${m.description.slice(0, 280).replace(/\s+/g, ' ')}${m.eans.length ? ` (EAN ${m.eans.slice(0, 3).join(', ')})` : ''}`);
  }
  lines.push('', '_Automatisch gegenereerd uit de productfeed van PassaHockey (TradeTracker)._');
  return lines.join('\n');
}

async function main() {
  const [jsonPath = 'passa.json', mdPath = 'passa.md', feedPath] = process.argv.slice(2);
  let xml: string;
  if (feedPath) {
    xml = readFileSync(feedPath, 'utf8');
  } else {
    const response = await fetch(PASSAHOCKEY_FEED_URL, { signal: AbortSignal.timeout(300_000) });
    if (!response.ok) throw new Error(`PassaHockey-feed niet opgehaald (HTTP ${response.status})`);
    xml = await response.text();
  }
  const models = parsePassaFeed(xml);
  if (models.length === 0) throw new Error('Geen sticks in de PassaHockey-feed; is het formaat veranderd?');
  const catalog = getCatalogProducts().map((p) => ({
    slug: p.slug,
    brand: p.brand,
    name: p.name,
    discipline: getDiscipline(p),
    ...(p.passaSportsProductUrl && { passaSportsProductUrl: p.passaSportsProductUrl }),
  }));
  const result = comparePassaFeed(models, catalog);
  const date = new Date().toISOString().slice(0, 10);
  writeFileSync(jsonPath, JSON.stringify({ date, ...result, gaps: result.gaps.slice(0, GAP_LIMIT) }, null, 1));
  writeFileSync(mdPath, report(date, models.length, result));
  const problems = result.linked.filter((l) => l.kind !== 'ok').length;
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `suggestions=${result.suggestions.length}\ngaps=${result.gaps.length}\nproblems=${problems}\n`,
    );
  }
  console.log(
    `${models.length} sticks in de feed; ${problems} linkproblemen, ${result.suggestions.length} koppelvoorstellen, ${result.gaps.length} ontbrekende sticks.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
