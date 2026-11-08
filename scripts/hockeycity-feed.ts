// HockeyCity feed (decision log 2026-11-03): downloads the TradeTracker product
// feed of HockeyCity, matches its sticks with our catalog by name (its stick
// GTINs are HockeyCity's own numbers, not EANs) and its shoes by EAN, and
// writes a Dutch report. Lengths, shoe sizes and stock per length or size come
// from the public product data of each page (`?format=json`), read slowly: one
// request a second (owner's choice, phase 2). With --write it writes
//   src/catalog/offers/hockeyCity.ts       buttons and prices for sticks and shoes we have,
//   src/catalog/imported/hockeycity.ts     sticks only HockeyCity sells (noindex),
//   src/catalog/shoes/importedHockeyCity.ts shoes only HockeyCity sells (noindex).
// The weekly PassaHockey sync runs it after the Plutosport and shoe imports,
// so nothing those already show is imported twice.
// Usage: npm run hockeycity:feed -- [report.md] [feed.xml] [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { getDiscipline } from '../src/catalog/discipline';
import type { ImportSkip } from '../src/catalog/feedImport';
import {
  HOCKEYCITY_FEED_URL,
  asImportModel,
  hockeyCityShoeModel,
  hockeyCityStickMatches,
  hockeyCitySticks,
  isHockeyCityShoe,
  parseHockeyCityFeed,
  parseHockeyCityPage,
  stickStock,
  type HockeyCityRecord,
  type HockeyCityStickModel,
  type HockeyCityVariant,
} from '../src/catalog/hockeyCityFeed';
import { getCatalogProducts, getHockeyCityImportedProducts, getImportedProducts, getPlutosportImportedProducts } from '../src/catalog/index';
import { getModelYear } from '../src/catalog/modelYear';
import type { HockeyCityOffers } from '../src/catalog/offers/index';
import { HOCKEYCITY_OFFERS } from '../src/catalog/offers/hockeyCity';
import { HOCKEYCITY_CONFIRMED } from '../src/catalog/offers/hockeyCityConfirmed';
import { isJunior } from '../src/catalog/passaFeed';
import { matchStick, type StickMatch } from '../src/catalog/plutosportFeed';
import { HOCKEYCITY_IMPORT, modelNameKey, toFeedProduct } from '../src/catalog/plutosportImport';
import { buildShoeImport, modelKey } from '../src/catalog/shoes/feedImport';
import { IMPORTED_SHOES } from '../src/catalog/shoes/imported';
import { HOCKEYCITY_SHOES } from '../src/catalog/shoes/importedHockeyCity';
import { CURATED_SHOES } from '../src/catalog/shoes/products';
import type { Shoe, ShoeListing } from '../src/catalog/shoes/types';
import { isJuniorStick } from '../src/catalog/similar';
import type { Product } from '../src/catalog/types';

/** HockeyCity's feed held 622 products on 2026-11-03; far fewer means a broken download. */
const MIN_RECORDS = 200;
/** It held some 260 sticks; fewer than this means the feed or its categories changed. */
const MIN_STICKS = 50;
const DOUBT_LIMIT = 40;
/** One request a second, and never more than this many a run. */
const PAGE_DELAY_MS = 1000;
const MAX_PAGES = 500;
/** More failed page reads than this share: something is wrong, nothing is written. */
const MAX_FAILED_SHARE = 0.2;
const USER_AGENT = 'jouwhockeystick.nl wekelijkse sync (+https://jouwhockeystick.nl)';

const OFFERS_PATH = 'src/catalog/offers/hockeyCity.ts';
const STICKS_PATH = 'src/catalog/imported/hockeycity.ts';
const SHOES_PATH = 'src/catalog/shoes/importedHockeyCity.ts';

async function readFeed(localPath: string | undefined): Promise<string> {
  if (localPath) return readFileSync(localPath, 'utf8');
  const response = await fetch(HOCKEYCITY_FEED_URL, { signal: AbortSignal.timeout(300_000) });
  if (!response.ok) throw new Error(`HockeyCity-feed niet opgehaald (HTTP ${response.status}).`);
  return response.text();
}

/** Reads product pages one by one, each once. */
class PageReader {
  private readonly cache = new Map<string, HockeyCityVariant[] | null>();
  requests = 0;
  failed = 0;

  async variants(url: string): Promise<HockeyCityVariant[] | null> {
    if (this.cache.has(url)) return this.cache.get(url) ?? null;
    if (this.requests >= MAX_PAGES) return null;
    if (this.requests > 0) await new Promise((resolve) => setTimeout(resolve, PAGE_DELAY_MS));
    this.requests++;
    let result: HockeyCityVariant[] | null = null;
    try {
      const response = await fetch(`${url}?format=json`, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      });
      if (response.ok) result = parseHockeyCityPage(await response.json());
    } catch {
      result = null;
    }
    if (result === null) this.failed++;
    this.cache.set(url, result);
    return result;
  }
}

type ProductMatch = { product: Product; match: StickMatch<HockeyCityStickModel> };

function matchAll(products: readonly Product[], sticks: readonly HockeyCityStickModel[]): ProductMatch[] {
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
          // HockeyCity's stick GTINs are its own numbers: nothing to compare.
          eans: [],
          junior: isJunior(product.name) || isJuniorStick(product),
        },
        sticks,
        'HockeyCity',
      ),
    };
  });
}

/**
 * The sticks only HockeyCity sells: in stock, matched to nothing we have
 * (not 'zeker', not 'twijfel', not an older collection of ours), one per
 * model name, the colour with the most lengths in stock.
 */
async function importSticks(
  sticks: readonly HockeyCityStickModel[],
  matches: readonly ProductMatch[],
  pages: PageReader,
  date: string,
  taken: Set<string>,
): Promise<{ products: Product[]; skips: ImportSkip[] }> {
  const matchedKeys = new Set(
    matches.flatMap(({ match }) => [...(match.model && match.level !== 'geen' ? [match.model.key] : []), ...(match.olderCollectionKeys ?? [])]),
  );
  const matchedNames = new Set(sticks.filter((s) => matchedKeys.has(s.key)).map(modelNameKey));
  const byName = new Map<string, { model: HockeyCityStickModel; lengths: number[]; priceEur: number | null }>();
  const skips: ImportSkip[] = [];
  for (const model of sticks) {
    const name = modelNameKey(model);
    if (!model.inStock || matchedKeys.has(model.key) || matchedNames.has(name)) continue;
    const variants = await pages.variants(model.url);
    if (!variants) {
      skips.push({ url: model.url, name: model.name, reason: 'productpagina niet te lezen' });
      continue;
    }
    const stock = stickStock(variants);
    const best = byName.get(name);
    if (!best || stock.lengths.length > best.lengths.length) byName.set(name, { model, ...stock });
  }
  const products: Product[] = [];
  for (const { model, lengths, priceEur } of [...byName.values()].sort((a, b) => a.model.url.localeCompare(b.model.url))) {
    const result = toFeedProduct(asImportModel(model, { lengths, priceEur }), date, HOCKEYCITY_IMPORT);
    if ('skip' in result) skips.push(result.skip);
    else if (taken.has(result.product.slug)) skips.push({ url: model.url, name: model.name, reason: 'slug bestaat al' });
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

type Run = {
  data: HockeyCityOffers;
  products: Product[];
  shoes: Shoe[];
  skips: ImportSkip[];
  nameOnlyShoes: { name: string; url: string }[];
};

function report(run: Run, records: readonly HockeyCityRecord[], sticks: readonly HockeyCityStickModel[], matches: readonly ProductMatch[], pages: PageReader): string {
  const { data, confirmed } = { data: run.data, confirmed: HOCKEYCITY_CONFIRMED };
  const slugs = Object.keys(data.sticks);
  const added = slugs.filter((slug) => !HOCKEYCITY_OFFERS.sticks[slug]);
  const removed = Object.keys(HOCKEYCITY_OFFERS.sticks).filter((slug) => !data.sticks[slug]);
  const lostConfirmed = Object.keys(confirmed).filter((slug) => !data.sticks[slug]);
  const doubts = matches.filter(({ product, match }) => match.level === 'twijfel' && match.model?.inStock && !confirmed[product.slug]);
  const before = new Set(getHockeyCityImportedProducts().map((p) => p.slug));
  const newSticks = run.products.filter((p) => !before.has(p.slug));
  const goneSticks = [...before].filter((slug) => !run.products.some((p) => p.slug === slug));
  const shoesBefore = new Set(HOCKEYCITY_SHOES.map((s) => s.slug));
  const reasons = new Map<string, number>();
  for (const s of run.skips) reasons.set(s.reason.replace(/"[^"]*"/, '"…"'), (reasons.get(s.reason.replace(/"[^"]*"/, '"…"')) ?? 0) + 1);
  return [
    '## HockeyCity',
    '',
    `${records.length} producten in de feed, waarvan ${sticks.length} sticks (${sticks.filter((s) => s.inStock).length} op voorraad) en ${records.filter(isHockeyCityShoe).length} schoenen. ${pages.requests} productpagina's gelezen voor lengtes en maten (${pages.failed} niet te lezen).`,
    '',
    '### Knoppen bij sticks en schoenen die we al hadden',
    '',
    `- **Sticks met een HockeyCity-knop:** ${slugs.length} (${slugs.filter((s) => data.sticks[s]?.method === 'handmatig').length} met de hand bevestigd)`,
    `- **Nieuw:** ${added.length ? added.map((s) => `\`${s}\``).join(', ') : 'geen'}`,
    `- **Vervallen** (niet meer zeker of niet meer leverbaar): ${removed.length ? removed.map((s) => `\`${s}\``).join(', ') : 'geen'}`,
    ...(lostConfirmed.length ? [`- **Bevestigd, maar nu niet leverbaar of niet meer in de feed:** ${lostConfirmed.map((s) => `\`${s}\``).join(', ')}`] : []),
    `- **Schoenmodellen met een HockeyCity-pagina (zelfde EAN):** ${Object.keys(data.shoes).length - run.shoes.length}`,
    '',
    '### Alleen bij HockeyCity (noindex)',
    '',
    `- **Sticks:** ${run.products.length} (nieuw: ${newSticks.length ? newSticks.map((p) => `${p.name} (\`${p.slug}\`)`).join(', ') : 'geen'}; verdwenen: ${goneSticks.length ? goneSticks.map((s) => `\`${s}\``).join(', ') : 'geen'})`,
    `- **Schoenen:** ${run.shoes.length} (nieuw: ${run.shoes.filter((s) => !shoesBefore.has(s.slug)).map((s) => `\`${s.slug}\``).join(', ') || 'geen'})`,
    `- **Overgeslagen sticks:** ${reasons.size ? [...reasons.entries()].map(([reason, count]) => `${reason}: ${count}`).join(', ') : 'geen'}`,
    `- **Schoenen met dezelfde naam als een model dat we al tonen, maar zonder gedeelde EAN (niet geïmporteerd):** ${run.nameOnlyShoes.length ? run.nameOnlyShoes.map((s) => s.name).join(', ') : 'geen'}`,
    '',
    '### Twijfel: met de hand bevestigen',
    '',
    doubts.length
      ? `Deze sticks krijgen géén HockeyCity-knop en worden ook niet apart geïmporteerd. HockeyCity zet zelden een modeljaar in de naam. Klopt een koppeling (zelfde model én modeljaar), zet hem dan in \`src/catalog/offers/hockeyCityConfirmed.ts\`. De eerste ${Math.min(DOUBT_LIMIT, doubts.length)} van ${doubts.length}:`
      : 'Geen.',
    '',
    ...doubts
      .slice(0, DOUBT_LIMIT)
      .map(
        ({ product, match }) =>
          `- \`${product.slug}\` (${product.name}) → **${match.model?.name ?? '?'}** (${euro(match.model?.priceMin ?? 0)}) — ${match.model?.url ?? ''}\n  - ${match.note}`,
      ),
    '',
  ].join('\n');
}

const json = (value: unknown) => JSON.stringify(value);

function offersFile(data: HockeyCityOffers): string {
  return [
    '// GENERATED by `npm run hockeycity:feed -- --write` from the HockeyCity product feed (TradeTracker) and its product pages.',
    "// Sticks: 'zeker' name matches and hand-confirmed ones; shoes: same EAN, and the shoes only HockeyCity sells.",
    "import type { HockeyCityOffers } from './index';",
    '',
    `export const HOCKEYCITY_OFFERS: HockeyCityOffers = ${json(data)};`,
    '',
  ].join('\n');
}

function sticksFile(date: string, products: readonly Product[]): string {
  return [
    '// GENERATED by `npm run hockeycity:feed -- --write` from the HockeyCity product feed (TradeTracker) and its product pages.',
    '// Do not edit by hand: the weekly sync overwrites this file. To curate a stick, copy it',
    '// to src/catalog/products/, remove `feedImport` and register it in src/catalog/index.ts.',
    "import type { Product } from '../types';",
    '',
    `export const HOCKEYCITY_IMPORT_DATE = '${date}';`,
    '',
    'export const HOCKEYCITY_PRODUCTS: Product[] = [',
    ...products.map((p) => `  ${json(p)},`),
    '];',
    '',
  ].join('\n');
}

function shoesFile(date: string, shoes: readonly Shoe[]): string {
  return [
    '// GENERATED by `npm run hockeycity:feed -- --write` from the HockeyCity product feed (TradeTracker)',
    '// and its product pages. Shoe models only HockeyCity sells; their listings are in src/catalog/offers/hockeyCity.ts.',
    "import type { Shoe } from './types';",
    '',
    `export const HOCKEYCITY_SHOE_IMPORT_DATE = '${date}';`,
    '',
    'export const HOCKEYCITY_SHOES: Shoe[] = [',
    ...shoes.map((s) => `  ${json(s)},`),
    '];',
    '',
  ].join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const [mdPath = 'hockeycity.md', feedPath] = args.filter((arg) => !arg.startsWith('--'));
  const records = parseHockeyCityFeed(await readFeed(feedPath));
  const sticks = hockeyCitySticks(records);
  if (records.length < MIN_RECORDS || sticks.length < MIN_STICKS) {
    throw new Error(`Maar ${records.length} producten en ${sticks.length} sticks in de HockeyCity-feed; niets bijgewerkt.`);
  }

  const date = new Date().toISOString().slice(0, 10);
  const pages = new PageReader();
  // Our own HockeyCity imports are left out: they would match their own page.
  const products = [...getCatalogProducts(), ...getImportedProducts(), ...getPlutosportImportedProducts()];
  const matches = matchAll(products, sticks);

  // Sticks we have: the feed's in-stock pages, then lengths and price per length from the page.
  const stickOffers = hockeyCityStickMatches(
    matches.map(({ product, match }) => ({ slug: product.slug, match })),
    records,
    HOCKEYCITY_CONFIRMED,
  );
  for (const [slug, offer] of Object.entries(stickOffers)) {
    const variants = await pages.variants(offer.productUrl);
    if (!variants) continue;
    const stock = stickStock(variants);
    if (stock.lengths.length === 0 || stock.priceEur === null) delete stickOffers[slug];
    else stickOffers[slug] = { ...offer, priceEur: stock.priceEur, lengths: stock.lengths };
  }

  // Sticks only HockeyCity sells.
  const taken = new Set(products.map((p) => p.slug));
  const imported = await importSticks(sticks, matches, pages, date, taken);

  // Shoes: linked on EAN to what we show; the rest imported unless another model has the same name.
  const shoeModels = [];
  for (const record of records.filter(isHockeyCityShoe)) shoeModels.push(hockeyCityShoeModel(record, await pages.variants(record.url)));
  const known = [...CURATED_SHOES, ...IMPORTED_SHOES];
  const shoeResult = buildShoeImport({ passa: [], pluto: [], hockeyCity: shoeModels }, known, date, new Set(known.map(shoeKey)));
  const shoeListings: Record<string, ShoeListing> = {};
  for (const [slug, listings] of Object.entries(shoeResult.listings).sort(([a], [b]) => a.localeCompare(b))) {
    const listing = listings.find((l) => l.shop === 'hockeycity');
    if (listing) shoeListings[slug] = listing;
  }

  if (pages.requests > 0 && pages.failed / pages.requests > MAX_FAILED_SHARE) {
    throw new Error(`${pages.failed} van ${pages.requests} productpagina's van HockeyCity niet te lezen; niets bijgewerkt.`);
  }

  const run: Run = {
    data: { date, sticks: stickOffers, shoes: shoeListings },
    products: imported.products,
    shoes: shoeResult.shoes,
    skips: imported.skips,
    nameOnlyShoes: shoeResult.hockeyCityNameOnly,
  };
  if (write) {
    writeFileSync(OFFERS_PATH, offersFile(run.data));
    writeFileSync(STICKS_PATH, sticksFile(date, run.products));
    writeFileSync(SHOES_PATH, shoesFile(date, run.shoes));
  }
  writeFileSync(mdPath, report(run, records, sticks, matches, pages));
  console.log(
    `${records.length} producten, ${pages.requests} pagina's gelezen; knoppen: ${Object.keys(stickOffers).length} sticks en ${Object.keys(shoeListings).length - run.shoes.length} schoenen; alleen bij HockeyCity: ${run.products.length} sticks en ${run.shoes.length} schoenen.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
