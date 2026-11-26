// Decathlon feed (decision log 2026-11-26): downloads the Odyssey Partnerships product feed of
// Decathlon NL, joins its rows (one per length or size) into products, matches the sticks with our
// catalog (first on EAN through the PassaHockey feed, then on name) and writes a Dutch report.
// With --write it writes
//   src/catalog/offers/decathlon.ts   buttons and prices for sticks we already have,
//   src/catalog/imported/decathlon.ts sticks only Decathlon sells (noindex).
// Shoes follow in a later step. The weekly PassaHockey sync runs it after the Daka step, so
// nothing those already show is imported twice.
// The feed URL comes from ODYSSEY_FEED_URL (a GitHub secret). It holds a signature: it is never
// printed, logged or written to a file or the report.
// Usage: npm run decathlon:feed -- [report.md] [feed.xml] [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { getDiscipline } from '../src/catalog/discipline';
import type { ImportSkip } from '../src/catalog/feedImport';
import {
  decathlonImportModel,
  decathlonStickMatches,
  decathlonSticks,
  parseDecathlonFeed,
  type DecathlonRow,
  type DecathlonStickModel,
} from '../src/catalog/decathlonFeed';
import {
  getCatalogProducts,
  getDakaImportedProducts,
  getDecathlonImportedProducts,
  getHockeyCityImportedProducts,
  getImportedProducts,
  getPlutosportImportedProducts,
} from '../src/catalog/index';
import { getModelYear } from '../src/catalog/modelYear';
import type { DecathlonOffers } from '../src/catalog/offers/index';
import { DECATHLON_OFFERS } from '../src/catalog/offers/decathlon';
import { DECATHLON_CONFIRMED, DECATHLON_REJECTED } from '../src/catalog/offers/decathlonConfirmed';
import { PASSAHOCKEY_FEED_URL, isJunior, parsePassaFeed, type PassaStickModel } from '../src/catalog/passaFeed';
import { matchStick, type StickMatch } from '../src/catalog/plutosportFeed';
import { DECATHLON_IMPORT, modelNameKey, toFeedProduct } from '../src/catalog/plutosportImport';
import { isJuniorStick } from '../src/catalog/similar';
import type { Product } from '../src/catalog/types';

/** Decathlon's feed held 63.212 rows on 2026-11-26; far fewer means a broken download. */
const MIN_ROWS = 10_000;
/** A handful of stick pages at least; fewer means the feed or its categories changed. */
const MIN_STICKS = 5;
const DOUBT_LIMIT = 40;

const OFFERS_PATH = 'src/catalog/offers/decathlon.ts';
const STICKS_PATH = 'src/catalog/imported/decathlon.ts';

async function readFeed(localPath: string | undefined): Promise<string> {
  if (localPath) return readFileSync(localPath, 'utf8');
  const url = process.env.ODYSSEY_FEED_URL;
  if (!url) throw new Error('ODYSSEY_FEED_URL ontbreekt (GitHub Secrets).');
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(600_000) });
  } catch {
    throw new Error('De Decathlon-feed kon niet worden gelezen (geen verbinding).');
  }
  // Only the status: the URL holds a signature and is never part of a message.
  if (!response.ok) throw new Error(`Decathlon-feed niet opgehaald (HTTP ${response.status}).`);
  return response.text();
}

/** The PassaHockey feed gives our curated sticks their EANs; without it only names are compared. */
async function readPassa(): Promise<PassaStickModel[] | null> {
  try {
    const response = await fetch(PASSAHOCKEY_FEED_URL, { signal: AbortSignal.timeout(300_000) });
    if (!response.ok) return null;
    const models = parsePassaFeed(await response.text());
    return models.length ? models : null;
  } catch {
    return null;
  }
}

type ProductMatch = { product: Product; match: StickMatch<DecathlonStickModel> };

function matchAll(products: readonly Product[], sticks: readonly DecathlonStickModel[], passaByUrl: ReadonlyMap<string, PassaStickModel>): ProductMatch[] {
  return products.map((product) => {
    const passa = product.passaSportsProductUrl ? passaByUrl.get(product.passaSportsProductUrl.split('?')[0] ?? '') : undefined;
    const bow = product.bowProfile?.value;
    const modelYear = getModelYear(product);
    return {
      product,
      match: matchStick(
        {
          slug: product.slug,
          brand: product.brand,
          name: product.name,
          discipline: getDiscipline(product),
          ...(bow && { bow }),
          ...(modelYear && { modelYear }),
          eans: passa?.eans ?? [],
          junior: isJunior(product.name) || isJuniorStick(product),
        },
        sticks,
        'Decathlon',
      ),
    };
  });
}

/**
 * The sticks only Decathlon sells: with a length that is not out of stock, matched to nothing we
 * have (not 'zeker', not 'twijfel', not an older collection of ours), one per model name, the
 * page with the most lengths.
 */
function importSticks(
  sticks: readonly DecathlonStickModel[],
  matches: readonly ProductMatch[],
  date: string,
  taken: Set<string>,
): { products: Product[]; skips: ImportSkip[] } {
  const matchedKeys = new Set(
    matches.flatMap(({ match }) => [...(match.model && match.level !== 'geen' ? [match.model.key] : []), ...(match.olderCollectionKeys ?? [])]),
  );
  const asModel = (stick: DecathlonStickModel) => decathlonImportModel(stick);
  const matchedNames = new Set(sticks.filter((s) => matchedKeys.has(s.key)).map((s) => modelNameKey(asModel(s))));
  const byName = new Map<string, DecathlonStickModel>();
  for (const stick of sticks) {
    const name = modelNameKey(asModel(stick));
    if (!stick.inStock || matchedKeys.has(stick.key) || matchedNames.has(name)) continue;
    const best = byName.get(name);
    if (!best || stick.lengths.length > best.lengths.length) byName.set(name, stick);
  }
  const products: Product[] = [];
  const skips: ImportSkip[] = [];
  for (const stick of [...byName.values()].sort((a, b) => a.url.localeCompare(b.url))) {
    const result = toFeedProduct(asModel(stick), date, DECATHLON_IMPORT);
    if ('skip' in result) skips.push(result.skip);
    else if (taken.has(result.product.slug)) skips.push({ url: stick.url, name: stick.name, reason: 'slug bestaat al' });
    else {
      taken.add(result.product.slug);
      products.push(result.product);
    }
  }
  return { products: products.sort((a, b) => a.slug.localeCompare(b.slug)), skips };
}

const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;
const json = (value: unknown) => JSON.stringify(value);

type Run = { data: DecathlonOffers; products: Product[]; skips: ImportSkip[]; usedEan: boolean };

/** What the feed's stock field holds, so the owner and I can see what it means (it is not documented). */
function stockProfile(rows: readonly DecathlonRow[]): string {
  const sticks = rows.filter((row) => /^Hockey>Hockeysticks/i.test(row.categoryPath));
  const counts = new Map<string, number>();
  for (const row of sticks) {
    const text = row.stockText.trim().slice(0, 40) || '(leeg)';
    counts.set(text, (counts.get(text) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  return `Voorraadveld bij ${sticks.length} stickregels: ${top.map(([text, count]) => `"${text}" ${count}x`).join(', ') || 'geen'}.`;
}

function report(run: Run, rows: readonly DecathlonRow[], sticks: readonly DecathlonStickModel[], matches: readonly ProductMatch[]): string {
  const { data } = run;
  const slugs = Object.keys(data.sticks);
  const method = (name: string) => slugs.filter((s) => data.sticks[s]?.method === name).length;
  const added = slugs.filter((slug) => !DECATHLON_OFFERS.sticks[slug]);
  const removed = Object.keys(DECATHLON_OFFERS.sticks).filter((slug) => !data.sticks[slug]);
  const lostConfirmed = Object.keys(DECATHLON_CONFIRMED).filter((slug) => !data.sticks[slug]);
  const doubts = matches.filter(
    ({ product, match }) => match.level === 'twijfel' && match.model?.inStock && !DECATHLON_CONFIRMED[product.slug] && !DECATHLON_REJECTED.has(product.slug),
  );
  const before = new Set(getDecathlonImportedProducts().map((p) => p.slug));
  const newSticks = run.products.filter((p) => !before.has(p.slug));
  const goneSticks = [...before].filter((slug) => !run.products.some((p) => p.slug === slug));
  const reasons = new Map<string, number>();
  for (const s of run.skips) {
    const reason = s.reason.replace(/"[^"]*"/, '"…"');
    reasons.set(reason, (reasons.get(reason) ?? 0) + 1);
  }
  return [
    '## Decathlon',
    '',
    `${rows.length} regels in de feed (één per maat of lengte), waarvan ${sticks.length} stickpagina's (${sticks.filter((s) => s.inStock).length} met een lengte die niet is uitverkocht).`,
    stockProfile(rows),
    run.usedEan ? '' : '**De PassaHockey-feed was niet bereikbaar: deze keer alleen op naam gekoppeld, zonder EAN.**',
    '',
    '### Knoppen bij sticks die we al hadden',
    '',
    `- **Sticks met een Decathlon-knop:** ${slugs.length} (${method('ean')} op EAN, ${method('naam')} op naam, ${method('handmatig')} met de hand bevestigd).`,
    `- **Nieuw:** ${added.length ? added.map((s) => `\`${s}\``).join(', ') : 'geen'}`,
    `- **Vervallen** (niet meer zeker of niet meer leverbaar): ${removed.length ? removed.map((s) => `\`${s}\``).join(', ') : 'geen'}`,
    ...(lostConfirmed.length ? [`- **Bevestigd, maar nu niet leverbaar of niet meer in de feed:** ${lostConfirmed.map((s) => `\`${s}\``).join(', ')}`] : []),
    '',
    '### Alleen bij Decathlon (noindex)',
    '',
    `- **Sticks:** ${run.products.length} (nieuw: ${newSticks.length ? newSticks.map((p) => `${p.name} (\`${p.slug}\`)`).join(', ') : 'geen'}; verdwenen: ${goneSticks.length ? goneSticks.map((s) => `\`${s}\``).join(', ') : 'geen'})`,
    `- **Overgeslagen sticks:** ${reasons.size ? [...reasons.entries()].map(([reason, count]) => `${reason}: ${count}`).join(', ') : 'geen'}`,
    '',
    '### Twijfel: met de hand bevestigen',
    '',
    doubts.length
      ? 'Deze sticks krijgen géén Decathlon-knop en worden ook niet apart geïmporteerd. Bevestig een koppeling in `src/catalog/offers/decathlonConfirmed.ts` (slug → productpagina), of wijs hem af in dezelfde lijst.'
      : 'Geen.',
    '',
    ...doubts
      .slice(0, DOUBT_LIMIT)
      .map(
        ({ product, match }) =>
          `- \`${product.slug}\` (${product.name}) → **${match.model?.name ?? '?'}** (${euro(match.model?.inStockPriceMin ?? match.model?.priceMin ?? 0)}) — ${match.model?.url ?? ''}\n  - ${match.note}`,
      ),
    '',
  ].join('\n');
}

function offersFile(data: DecathlonOffers): string {
  return [
    '// GENERATED by `npm run decathlon:feed -- --write` from the Decathlon product feed (Odyssey Partnerships).',
    "// Sticks: 'zeker' matches (same EAN, or brand, model, bow and year) and hand-confirmed ones; shoes follow in a later step.",
    "import type { DecathlonOffers } from './index';",
    '',
    `export const DECATHLON_OFFERS: DecathlonOffers = ${json(data)};`,
    '',
  ].join('\n');
}

function sticksFile(date: string, products: readonly Product[]): string {
  return [
    '// GENERATED by `npm run decathlon:feed -- --write` from the Decathlon product feed (Odyssey Partnerships).',
    '// Do not edit by hand: the weekly sync overwrites this file. To curate a stick, copy it',
    '// to src/catalog/products/, remove `feedImport` and register it in src/catalog/index.ts.',
    "import type { Product } from '../types';",
    '',
    `export const DECATHLON_IMPORT_DATE = '${date}';`,
    '',
    'export const DECATHLON_PRODUCTS: readonly Product[] = [',
    ...products.map((p) => `  ${json(p)},`),
    '];',
    '',
  ].join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const [mdPath = 'decathlon.md', feedPath] = args.filter((arg) => !arg.startsWith('--'));
  const [feed, passaModels] = await Promise.all([readFeed(feedPath), feedPath ? Promise.resolve(null) : readPassa()]);
  const rows = parseDecathlonFeed(feed);
  const sticks = decathlonSticks(rows);
  if (rows.length < MIN_ROWS || sticks.length < MIN_STICKS) {
    throw new Error(`Maar ${rows.length} regels en ${sticks.length} stickpagina's in de Decathlon-feed; niets bijgewerkt.`);
  }

  const date = new Date().toISOString().slice(0, 10);
  // Our own Decathlon imports are left out: they would match their own page.
  const products = [
    ...getCatalogProducts(),
    ...getImportedProducts(),
    ...getPlutosportImportedProducts(),
    ...getHockeyCityImportedProducts(),
    ...getDakaImportedProducts(),
  ];
  const passaByUrl = new Map((passaModels ?? []).map((m) => [m.url, m]));
  const matches = matchAll(products, sticks, passaByUrl);
  const stickOffers = decathlonStickMatches(
    matches.map(({ product, match }) => ({ slug: product.slug, match })),
    sticks,
    DECATHLON_CONFIRMED,
    DECATHLON_REJECTED,
  );
  const taken = new Set(products.map((p) => p.slug));
  const imported = importSticks(sticks, matches, date, taken);

  const run: Run = { data: { date, sticks: stickOffers, shoes: {} }, products: imported.products, skips: imported.skips, usedEan: passaModels !== null };
  if (write) {
    writeFileSync(OFFERS_PATH, offersFile(run.data));
    writeFileSync(STICKS_PATH, sticksFile(date, run.products));
  }
  writeFileSync(mdPath, report(run, rows, sticks, matches));
  console.log(`${rows.length} regels; knoppen: ${Object.keys(stickOffers).length} sticks; alleen bij Decathlon: ${run.products.length} sticks.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
