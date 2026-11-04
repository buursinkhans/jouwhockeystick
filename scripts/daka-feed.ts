// Daka feed (decision log 2026-11-04): downloads the Daisycon product feed of
// Daka, joins its rows (one per length or size) into products, matches the
// sticks with our catalog by name (the feed has almost no EANs) and the shoes
// by EAN, and writes a Dutch report. With --write it writes
//   src/catalog/offers/daka.ts        buttons and prices for sticks and shoes we have,
//   src/catalog/imported/daka.ts      sticks only Daka sells (noindex),
//   src/catalog/shoes/importedDaka.ts shoes only Daka sells (noindex).
// The weekly PassaHockey sync runs it after the HockeyCity step, so nothing
// those already show is imported twice.
// Usage: npm run daka:feed -- [report.md] [feed.xml] [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { getDiscipline } from '../src/catalog/discipline';
import type { ImportSkip } from '../src/catalog/feedImport';
import { DAKA_FEED_URL, dakaImportModel, dakaShoes, dakaStickMatches, dakaSticks, parseDakaFeed, type DakaStickModel } from '../src/catalog/dakaFeed';
import {
  getCatalogProducts,
  getDakaImportedProducts,
  getHockeyCityImportedProducts,
  getImportedProducts,
  getPlutosportImportedProducts,
} from '../src/catalog/index';
import { getModelYear } from '../src/catalog/modelYear';
import type { DakaOffers } from '../src/catalog/offers/index';
import { DAKA_OFFERS } from '../src/catalog/offers/daka';
import { DAKA_CONFIRMED } from '../src/catalog/offers/dakaConfirmed';
import { isJunior } from '../src/catalog/passaFeed';
import { matchStick, type StickMatch } from '../src/catalog/plutosportFeed';
import { DAKA_IMPORT, modelNameKey, toFeedProduct } from '../src/catalog/plutosportImport';
import { buildShoeImport, modelKey } from '../src/catalog/shoes/feedImport';
import { IMPORTED_SHOES } from '../src/catalog/shoes/imported';
import { DAKA_SHOES } from '../src/catalog/shoes/importedDaka';
import { HOCKEYCITY_SHOES } from '../src/catalog/shoes/importedHockeyCity';
import { CURATED_SHOES } from '../src/catalog/shoes/products';
import type { Shoe, ShoeListing } from '../src/catalog/shoes/types';
import { isJuniorStick } from '../src/catalog/similar';
import type { Product } from '../src/catalog/types';

/** Daka's feed held 48.674 rows on 2026-11-04; far fewer means a broken download. */
const MIN_ROWS = 10_000;
/** It held some 300 stick pages; fewer than this means the feed or its texts changed. */
const MIN_STICKS = 50;
const DOUBT_LIMIT = 40;

const OFFERS_PATH = 'src/catalog/offers/daka.ts';
const STICKS_PATH = 'src/catalog/imported/daka.ts';
const SHOES_PATH = 'src/catalog/shoes/importedDaka.ts';

async function readFeed(localPath: string | undefined): Promise<string> {
  if (localPath) return readFileSync(localPath, 'utf8');
  const response = await fetch(DAKA_FEED_URL, { signal: AbortSignal.timeout(600_000) });
  if (!response.ok) throw new Error(`Daka-feed niet opgehaald (HTTP ${response.status}).`);
  return response.text();
}

type ProductMatch = { product: Product; match: StickMatch<DakaStickModel> };

function matchAll(products: readonly Product[], sticks: readonly DakaStickModel[]): ProductMatch[] {
  return products.map((product) => {
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
          eans: [],
          junior: isJunior(product.name) || isJuniorStick(product),
        },
        sticks,
        'Daka',
      ),
    };
  });
}

/**
 * The sticks only Daka sells: in stock, matched to nothing we have (not
 * 'zeker', not 'twijfel', not an older collection of ours), one per model
 * name, the page with the most lengths in stock.
 */
function importSticks(
  sticks: readonly DakaStickModel[],
  matches: readonly ProductMatch[],
  date: string,
  taken: Set<string>,
): { products: Product[]; skips: ImportSkip[] } {
  const matchedKeys = new Set(
    matches.flatMap(({ match }) => [...(match.model && match.level !== 'geen' ? [match.model.key] : []), ...(match.olderCollectionKeys ?? [])]),
  );
  const asModel = (stick: DakaStickModel) => dakaImportModel(stick);
  const matchedNames = new Set(sticks.filter((s) => matchedKeys.has(s.key)).map((s) => modelNameKey(asModel(s))));
  const byName = new Map<string, DakaStickModel>();
  for (const stick of sticks) {
    const name = modelNameKey(asModel(stick));
    if (!stick.inStock || matchedKeys.has(stick.key) || matchedNames.has(name)) continue;
    const best = byName.get(name);
    if (!best || stick.lengths.length > best.lengths.length) byName.set(name, stick);
  }
  const products: Product[] = [];
  const skips: ImportSkip[] = [];
  for (const stick of [...byName.values()].sort((a, b) => a.url.localeCompare(b.url))) {
    const result = toFeedProduct(asModel(stick), date, DAKA_IMPORT);
    if ('skip' in result) skips.push(result.skip);
    else if (taken.has(result.product.slug)) skips.push({ url: stick.url, name: stick.name, reason: 'slug bestaat al' });
    else {
      taken.add(result.product.slug);
      products.push(result.product);
    }
  }
  return { products: products.sort((a, b) => a.slug.localeCompare(b.slug)), skips };
}

/** The shoe key of a model we show: its brand and model name, as the shoe import compares names. */
const shoeKey = (shoe: Shoe) => modelKey({ name: `${shoe.brand} ${shoe.model}`, brand: shoe.brand });

const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;
const json = (value: unknown) => JSON.stringify(value);

type Run = {
  data: DakaOffers;
  products: Product[];
  shoes: Shoe[];
  skips: ImportSkip[];
  nameOnlyShoes: { name: string; url: string }[];
};

function report(run: Run, rowCount: number, sticks: readonly DakaStickModel[], shoeCount: number, matches: readonly ProductMatch[]): string {
  const { data } = run;
  const slugs = Object.keys(data.sticks);
  const added = slugs.filter((slug) => !DAKA_OFFERS.sticks[slug]);
  const removed = Object.keys(DAKA_OFFERS.sticks).filter((slug) => !data.sticks[slug]);
  const lostConfirmed = Object.keys(DAKA_CONFIRMED).filter((slug) => !data.sticks[slug]);
  const doubts = matches.filter(({ product, match }) => match.level === 'twijfel' && match.model?.inStock && !DAKA_CONFIRMED[product.slug]);
  const before = new Set(getDakaImportedProducts().map((p) => p.slug));
  const newSticks = run.products.filter((p) => !before.has(p.slug));
  const goneSticks = [...before].filter((slug) => !run.products.some((p) => p.slug === slug));
  const shoesBefore = new Set(DAKA_SHOES.map((s) => s.slug));
  const reasons = new Map<string, number>();
  for (const s of run.skips) {
    const reason = s.reason.replace(/"[^"]*"/, '"…"');
    reasons.set(reason, (reasons.get(reason) ?? 0) + 1);
  }
  return [
    '## Daka',
    '',
    `${rowCount} regels in de feed (één per maat of lengte), waarvan ${sticks.length} stickpagina's (${sticks.filter((s) => s.inStock).length} op voorraad) en ${shoeCount} schoenpagina's.`,
    '',
    '### Knoppen bij sticks en schoenen die we al hadden',
    '',
    `- **Sticks met een Daka-knop:** ${slugs.length} (${slugs.filter((s) => data.sticks[s]?.method === 'handmatig').length} met de hand bevestigd)`,
    `- **Nieuw:** ${added.length ? added.map((s) => `\`${s}\``).join(', ') : 'geen'}`,
    `- **Vervallen** (niet meer zeker of niet meer leverbaar): ${removed.length ? removed.map((s) => `\`${s}\``).join(', ') : 'geen'}`,
    ...(lostConfirmed.length ? [`- **Bevestigd, maar nu niet leverbaar of niet meer in de feed:** ${lostConfirmed.map((s) => `\`${s}\``).join(', ')}`] : []),
    `- **Schoenmodellen met een Daka-pagina (zelfde EAN):** ${Object.keys(data.shoes).length - run.shoes.length}`,
    '',
    '### Alleen bij Daka (noindex)',
    '',
    `- **Sticks:** ${run.products.length} (nieuw: ${newSticks.length ? newSticks.map((p) => `${p.name} (\`${p.slug}\`)`).join(', ') : 'geen'}; verdwenen: ${goneSticks.length ? goneSticks.map((s) => `\`${s}\``).join(', ') : 'geen'})`,
    `- **Schoenen:** ${run.shoes.length} (nieuw: ${run.shoes.filter((s) => !shoesBefore.has(s.slug)).map((s) => `\`${s.slug}\``).join(', ') || 'geen'})`,
    `- **Overgeslagen sticks:** ${reasons.size ? [...reasons.entries()].map(([reason, count]) => `${reason}: ${count}`).join(', ') : 'geen'}`,
    `- **Schoenen met dezelfde naam als een model dat we al tonen, maar zonder gedeelde EAN (niet geïmporteerd):** ${run.nameOnlyShoes.length ? [...new Set(run.nameOnlyShoes.map((s) => s.name))].join(', ') : 'geen'}`,
    '',
    '### Twijfel: met de hand bevestigen',
    '',
    doubts.length
      ? `Deze sticks krijgen géén Daka-knop en worden ook niet apart geïmporteerd. Daka zet zelden een modeljaar of EAN in de feed. Klopt een koppeling (zelfde model én modeljaar), zet hem dan in \`src/catalog/offers/dakaConfirmed.ts\`. De eerste ${Math.min(DOUBT_LIMIT, doubts.length)} van ${doubts.length}:`
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

function offersFile(data: DakaOffers): string {
  return [
    '// GENERATED by `npm run daka:feed -- --write` from the Daka product feed (Daisycon).',
    "// Sticks: 'zeker' name matches and hand-confirmed ones; shoes: same EAN, and the shoes only Daka sells.",
    "import type { DakaOffers } from './index';",
    '',
    `export const DAKA_OFFERS: DakaOffers = ${json(data)};`,
    '',
  ].join('\n');
}

function sticksFile(date: string, products: readonly Product[]): string {
  return [
    '// GENERATED by `npm run daka:feed -- --write` from the Daka product feed (Daisycon).',
    '// Do not edit by hand: the weekly sync overwrites this file. To curate a stick, copy it',
    '// to src/catalog/products/, remove `feedImport` and register it in src/catalog/index.ts.',
    "import type { Product } from '../types';",
    '',
    `export const DAKA_IMPORT_DATE = '${date}';`,
    '',
    'export const DAKA_PRODUCTS: readonly Product[] = [',
    ...products.map((p) => `  ${json(p)},`),
    '];',
    '',
  ].join('\n');
}

function shoesFile(date: string, shoes: readonly Shoe[]): string {
  return [
    '// GENERATED by `npm run daka:feed -- --write` from the Daka product feed (Daisycon).',
    '// Shoe models only Daka sells; their listings are in src/catalog/offers/daka.ts.',
    "import type { Shoe } from './types';",
    '',
    `export const DAKA_SHOE_IMPORT_DATE = '${date}';`,
    '',
    'export const DAKA_SHOES: Shoe[] = [',
    ...shoes.map((s) => `  ${json(s)},`),
    '];',
    '',
  ].join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const [mdPath = 'daka.md', feedPath] = args.filter((arg) => !arg.startsWith('--'));
  const rows = parseDakaFeed(await readFeed(feedPath));
  const sticks = dakaSticks(rows);
  if (rows.length < MIN_ROWS || sticks.length < MIN_STICKS) {
    throw new Error(`Maar ${rows.length} regels en ${sticks.length} stickpagina's in de Daka-feed; niets bijgewerkt.`);
  }

  const date = new Date().toISOString().slice(0, 10);
  // Our own Daka imports are left out: they would match their own page.
  const products = [...getCatalogProducts(), ...getImportedProducts(), ...getPlutosportImportedProducts(), ...getHockeyCityImportedProducts()];
  const matches = matchAll(products, sticks);
  const stickOffers = dakaStickMatches(
    matches.map(({ product, match }) => ({ slug: product.slug, match })),
    sticks,
    DAKA_CONFIRMED,
  );

  const taken = new Set(products.map((p) => p.slug));
  const imported = importSticks(sticks, matches, date, taken);

  // Shoes: linked on EAN to what we show; the rest imported unless a model we show has the same name.
  const shoeModels = dakaShoes(rows);
  const known = [...CURATED_SHOES, ...IMPORTED_SHOES, ...HOCKEYCITY_SHOES];
  const shoeResult = buildShoeImport({ passa: [], pluto: [], daka: shoeModels }, known, date, new Set(known.map(shoeKey)));
  const shoeListings: Record<string, ShoeListing> = {};
  for (const [slug, listings] of Object.entries(shoeResult.listings).sort(([a], [b]) => a.localeCompare(b))) {
    const listing = listings.find((l) => l.shop === 'daka');
    if (listing) shoeListings[slug] = listing;
  }

  const run: Run = {
    data: { date, sticks: stickOffers, shoes: shoeListings },
    products: imported.products,
    shoes: shoeResult.shoes,
    skips: imported.skips,
    nameOnlyShoes: shoeResult.dakaNameOnly,
  };
  if (write) {
    writeFileSync(OFFERS_PATH, offersFile(run.data));
    writeFileSync(STICKS_PATH, sticksFile(date, run.products));
    writeFileSync(SHOES_PATH, shoesFile(date, run.shoes));
  }
  writeFileSync(mdPath, report(run, rows.length, sticks, shoeModels.length, matches));
  console.log(
    `${rows.length} regels; knoppen: ${Object.keys(stickOffers).length} sticks en ${Object.keys(shoeListings).length - run.shoes.length} schoenen; alleen bij Daka: ${run.products.length} sticks en ${run.shoes.length} schoenen.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
