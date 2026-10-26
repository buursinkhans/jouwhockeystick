// Plutosport feed and overlap measurement (read-only, phase 0 of
// docs/spec/prijsvergelijking.md): downloads the Awin product feed of
// Plutosport, keeps the hockey sticks, matches them with our curated catalog
// and writes a Dutch Markdown report: per stick bol.com yes/no, the
// PassaHockey price, the Plutosport price plus shipping, stock and how sure
// the match is. Never changes the catalog or the site.
// Usage: npm run plutosport:feed -- [report.md] [feed.csv(.gz)] [passa.xml]
// The feed URL comes from AWIN_PLUTOSPORT_FEED_URL (a GitHub secret). It
// contains an API key: it is never printed, logged or written to the report.
import { createReadStream, readFileSync, writeFileSync } from 'node:fs';
import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { createGunzip } from 'node:zlib';
import { getDiscipline } from '../src/catalog/discipline';
import { getCatalogProducts, getImportedProducts, getPlutosportImportedProducts } from '../src/catalog/index';
import type { ImportSkip } from '../src/catalog/feedImport';
import { plutosportGaps, toPlutosportProduct } from '../src/catalog/plutosportImport';
import { PASSAHOCKEY_LIVE_PRICES } from '../src/catalog/imported/passaPrices';
import { livePricesFromFeed } from '../src/catalog/livePrice';
import { getModelYear } from '../src/catalog/modelYear';
import type { PlutosportMatch, PlutosportMatches } from '../src/catalog/offers/index';
import { PLUTOSPORT_MATCHES } from '../src/catalog/offers/matches';
import { PASSAHOCKEY_FEED_URL, parsePassaFeed, type PassaStickModel } from '../src/catalog/passaFeed';
import {
  PlutosportCollector,
  SIZE_COLUMNS,
  matchStick,
  overlapSummary,
  type OverlapRow,
  type PlutoStickModel,
  type StickMatch,
} from '../src/catalog/plutosportFeed';
import type { Product } from '../src/catalog/types';
import { CsvReader } from '../src/lib/csv';
import { PLUTOSPORT_SHIPPING, isPlutosportProductPage, shippingCostEur } from '../src/lib/retailers';

/**
 * The feed is filtered in Awin to hockey products (owner, 2026-10-26), so it is
 * small; fewer rows than this means a broken or truncated download.
 */
const MIN_FEED_ROWS = 50;
/** Plutosport sells dozens of hockey stick models; fewer means the filter or the feed changed. */
const MIN_STICK_MODELS = 15;
const UNMATCHED_LIMIT = 20;

const FEED_ENV = 'AWIN_PLUTOSPORT_FEED_URL';

/** Removes the feed URL (and its query, which holds the key) from any text that may be printed. */
function redact(text: string): string {
  const url = process.env[FEED_ENV]?.trim();
  let safe = text;
  if (url) {
    safe = safe.split(url).join('[feed-URL]');
    const query = url.split('?')[1];
    if (query) safe = safe.split(query).join('[…]');
  }
  return safe.replace(/https?:\/\/[^\s"']*awin[^\s"']*/gi, '[Awin-URL]');
}

async function* chunks(source: AsyncIterable<Buffer | Uint8Array>): AsyncGenerator<Buffer> {
  for await (const chunk of source) yield Buffer.from(chunk);
}

/** The feed as text chunks; gunzips when the data starts with the gzip magic bytes. */
async function* feedText(source: AsyncIterable<Buffer | Uint8Array>): AsyncGenerator<string> {
  const iterator = chunks(source)[Symbol.asyncIterator]();
  const first = await iterator.next();
  if (first.done) return;
  const rest = Readable.from(
    (async function* () {
      yield first.value;
      for (let next = await iterator.next(); !next.done; next = await iterator.next()) yield next.value;
    })(),
  );
  const gzip = first.value[0] === 0x1f && first.value[1] === 0x8b;
  const stream = gzip ? rest.pipe(createGunzip()) : rest;
  if (gzip) rest.on('error', (error) => stream.destroy(error));
  const decoder = new TextDecoder('utf-8');
  for await (const chunk of stream) yield decoder.decode(chunk as Buffer, { stream: true });
  const tail = decoder.decode();
  if (tail) yield tail;
}

async function openFeed(localPath: string | undefined): Promise<AsyncIterable<Buffer | Uint8Array>> {
  if (localPath) return createReadStream(localPath);
  const url = process.env[FEED_ENV]?.trim();
  if (!url) throw new Error(`${FEED_ENV} ontbreekt (GitHub-secret).`);
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(600_000) });
  } catch (error) {
    // Network errors can carry the URL in their cause; report only the kind.
    throw new Error(`Plutosport-feed niet opgehaald (${error instanceof Error ? error.name : 'netwerkfout'}).`);
  }
  if (!response.ok || !response.body) throw new Error(`Plutosport-feed niet opgehaald (HTTP ${response.status}).`);
  return Readable.fromWeb(response.body as WebReadableStream<Uint8Array>);
}

async function readPlutosport(localPath: string | undefined): Promise<PlutosportCollector> {
  const collector = new PlutosportCollector();
  const reader = new CsvReader();
  for await (const text of feedText(await openFeed(localPath))) {
    for (const row of reader.push(text)) collector.add(row);
  }
  for (const row of reader.end()) collector.add(row);
  return collector;
}

async function readPassa(localPath: string | undefined): Promise<PassaStickModel[] | null> {
  try {
    if (localPath) return parsePassaFeed(readFileSync(localPath, 'utf8'));
    const response = await fetch(PASSAHOCKEY_FEED_URL, { signal: AbortSignal.timeout(300_000) });
    if (!response.ok) return null;
    const models = parsePassaFeed(await response.text());
    return models.length ? models : null;
  } catch {
    return null;
  }
}

const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;
const percent = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : '–');
const cell = (text: string) => text.replace(/\|/g, '/').replace(/\s+/g, ' ');

function plutoCell(row: OverlapRow): string {
  if (row.plutoPrice === null) return row.match.model ? 'niet op voorraad' : '–';
  const shipping =
    row.plutoShipping === null ? ' + verzending onbekend' : row.plutoShipping === 0 ? ' (gratis verzending)' : ` + ${euro(row.plutoShipping)}`;
  return `${euro(row.plutoPrice)}${shipping}`;
}

function stockCell(model: PlutoStickModel | undefined): string {
  if (!model) return '–';
  if (!model.inStock) return 'uitverkocht';
  return model.sizesInStock.length ? `${model.sizesInStock.join(', ')}` : 'op voorraad (lengtes onbekend)';
}

function report(
  date: string,
  collector: PlutosportCollector,
  models: readonly PlutoStickModel[],
  rows: readonly OverlapRow[],
  passaSource: string,
): string {
  const summary = overlapSummary(rows);
  const sure = rows.filter((r) => r.match.level === 'zeker');
  const doubt = rows.filter((r) => r.match.level === 'twijfel');
  const none = rows.filter((r) => r.match.level === 'geen');
  const matchedKeys = new Set(rows.flatMap((r) => (r.match.model && r.match.level !== 'geen' ? [r.match.model.key] : [])));
  const unmatched = models.filter((m) => m.inStock && !matchedKeys.has(m.key));
  const s = PLUTOSPORT_SHIPPING;

  const lines = [
    `# Plutosport-feed en overlapmeting (${date})`,
    '',
    'Fase 0 van `docs/spec/prijsvergelijking.md`. Alleen lezen: dit rapport verandert niets aan de catalogus of de site. Prijzen zijn feedprijzen op de meetdatum; zet ze nooit als korting op de site.',
    '',
    '## Samenvatting',
    '',
    `- **Bij 2 of meer partnerwinkels te koop:** ${summary.multiShopSure} van ${summary.sticks} gecontroleerde sticks (**${percent(summary.multiShopSure, summary.sticks)}**), met alleen zekere Plutosport-koppelingen. Als alle twijfelgevallen kloppen: ${summary.multiShopIfDoubtsHold} (${percent(summary.multiShopIfDoubtsHold, summary.sticks)}).`,
    summary.medianDifference === null
      ? '- **Mediaan prijsverschil PassaHockey ↔ Plutosport:** niet te berekenen (geen stick met een zekere koppeling en een prijs bij allebei).'
      : `- **Mediaan prijsverschil PassaHockey ↔ Plutosport:** ${euro(summary.medianDifference)} op de stickprijs, ${euro(summary.medianDifferenceWithShipping ?? 0)} als je de Plutosport-verzending meetelt (${summary.priced} sticks met een prijs bij allebei; Plutosport is bij ${summary.plutoCheaper} daarvan goedkoper). De verzendkosten van PassaHockey staan nog niet in \`retailers.ts\` en tellen hier niet mee.`,
    `- **Koppelingen:** ${sure.length} zeker (${sure.filter((r) => r.match.method === 'ean').length} via EAN, ${sure.filter((r) => r.match.method === 'naam').length} via naam), ${doubt.length} twijfel, ${none.length} geen.`,
    `- **bol.com** telt mee als we een bol.com-productpagina koppelen (voorraad niet gecontroleerd); **PassaHockey** en **Plutosport** als de feed de stick op voorraad heeft.`,
    `- **Verzending Plutosport:** ${s.costEur === null ? 'onbekend' : euro(s.costEur)}${s.freeFromEur === null ? '' : `, gratis vanaf ${euro(s.freeFromEur)}`}. ${s.note} Bron: ${s.sourceUrl} (gelezen ${s.checkedAt}).`,
    `- **PassaHockey-prijzen en EAN's:** ${passaSource}`,
    '',
    ...feedProfile(collector, models),
    '## Per gecontroleerde stick',
    '',
    '| Stick | bol.com | PassaHockey | Plutosport | Voorraad Plutosport | Koppeling |',
    '|---|---|---|---|---|---|',
    ...rows.map(
      (r) =>
        `| \`${r.slug}\` | ${r.bol} | ${r.passaPrice === null ? '–' : euro(r.passaPrice)} | ${plutoCell(r)} | ${cell(stockCell(r.match.model))} | ${r.match.level}${r.match.method ? ` (${r.match.method})` : ''} |`,
    ),
    '',
    '## Twijfel: met de hand bevestigen',
    '',
    doubt.length ? 'Per stick de beste kandidaat bij Plutosport en waarom die niet zeker is.' : 'Geen.',
    '',
    ...doubt.map((r) => `- \`${r.slug}\` (${r.name}) → **${r.match.model?.name ?? '?'}** — ${r.match.model?.url ?? ''}\n  - ${r.match.note}`),
    '',
    '## Geen koppeling',
    '',
    none.length ? none.map((r) => `\`${r.slug}\` (${r.match.note})`).join(' · ') : 'Geen.',
    '',
    '## Hockeysticks bij Plutosport per merk',
    '',
    ...stickBrands(models).map(([brand, count, inStock]) => `- ${brand}: ${count} modellen, ${inStock} op voorraad`),
    '',
    `## Bij Plutosport op voorraad, niet gekoppeld (${unmatched.length})`,
    '',
    `Sticks die niets in onze catalogus matchen; de eerste ${Math.min(UNMATCHED_LIMIT, unmatched.length)} op merk en naam. De volledige lijst staat in het bestand \`plutosport-sticks\` bij de workflow-run.`,
    '',
    ...unmatched
      .sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name))
      .slice(0, UNMATCHED_LIMIT)
      .map((m) => `- ${m.name} (${m.brand || 'merk onbekend'}; ${m.discipline}; ${euro(m.inStockPriceMin ?? m.priceMin)}) — ${m.url}`),
    '',
    '_Automatisch gegenereerd uit de productfeed van Plutosport (Awin) en die van PassaHockey (TradeTracker)._',
  ];
  return lines.join('\n');
}

/** [brand, models, in stock], most models first. */
function stickBrands(models: readonly PlutoStickModel[]): [string, number, number][] {
  const brands = new Map<string, [number, number]>();
  for (const m of models) {
    const [count, inStock] = brands.get(m.brand || 'merk onbekend') ?? [0, 0];
    brands.set(m.brand || 'merk onbekend', [count + 1, inStock + Number(m.inStock)]);
  }
  return [...brands.entries()]
    .map(([brand, [count, inStock]]): [string, number, number] => [brand, count, inStock])
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** Every stick model in the feed, for checking the matcher by hand (workflow artifact, not the issue). */
function stickList(models: readonly PlutoStickModel[], rows: readonly OverlapRow[]): string {
  const matchedBy = new Map(rows.flatMap((r) => (r.match.model && r.match.level !== 'geen' ? [[r.match.model.key, `${r.match.level}: ${r.slug}`] as const] : [])));
  const lines = ['| Merk | Naam | Veld/zaal | Junior | Prijs | Voorraad | EAN | Koppeling | Pagina |', '|---|---|---|---|---|---|---|---|---|'];
  for (const m of [...models].sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name))) {
    lines.push(
      `| ${cell(m.brand)} | ${cell(m.name)} | ${m.discipline} | ${m.junior ? 'ja' : 'nee'} | ${euro(m.inStockPriceMin ?? m.priceMin)} | ${m.inStock ? 'ja' : 'nee'} | ${m.eans.length} | ${matchedBy.get(m.key) ?? '–'} | ${m.url} |`,
    );
  }
  return lines.join('\n');
}

/** What the feed holds: totals, what our filter kept, and the whole feed by category and brand. */
function feedProfile(collector: PlutosportCollector, models: readonly PlutoStickModel[]): string[] {
  const { tally, feedProfile: p } = collector;
  const top = (map: ReadonlyMap<string, number>, limit: number) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit)
      .map(([key, count]) => `- ${cell(key)} (${count})`);
  return [
    '## De feed',
    '',
    `- ${tally.rows} regels in de feed: ${p.pages.size} verschillende productpagina's, ${p.parents.size} verschillende parent_product_id's, ${p.rowsWithSize} regels met een maat (Fashion:size), ${p.rowsWithDimensions} met dimensions, ${p.rowsInStock} regels op voorraad.`,
    `- ${tally.stickRows} regels zijn hockeysticks volgens ons filter. Overgeslagen: ${tally.notForSale} niet te koop (is_for_sale), ${tally.invalid} ongeldig (Zod), ${tally.notEuro} niet in euro, ${tally.notDutchShop} met een productpagina buiten plutosport.nl.`,
    `- ${models.length} stickmodellen na het samenvoegen van lengtes (parent_product_id of productpagina); ${models.filter((m) => m.inStock).length} op voorraad.`,
    `- Kolommen in de feed (${p.columns.length}): ${p.columns.map((column) => `\`${column}\``).join(', ')}`,
    '',
    '### Categorieën die ons filter als hockeystick hield',
    '',
    'Controleer of hier geen ballen, tassen of grips tussen staan.',
    '',
    ...(collector.categoryCounts.size ? top(collector.categoryCounts, 20) : ['Geen.']),
    '',
    '### Maatkolommen bij de sticks',
    '',
    'De meest voorkomende waarden per kolom in de stickregels: hieraan is te zien waar Plutosport de lengte zet.',
    '',
    ...SIZE_COLUMNS.flatMap((column) => {
      const values = collector.sizeColumnValues.get(column);
      return values ? [`- \`${column}\`:`, ...top(values, 8).map((line) => `  ${line}`)] : [`- \`${column}\`: leeg of niet in de feed`];
    }),
    '',
    '### De hele feed per categorie',
    '',
    ...top(p.categories, 30),
    '',
    '### Domein van de productpagina',
    '',
    'We koppelen alleen naar plutosport.nl. Staan hier andere domeinen, dan haalt de taalinstelling in Awin ook andere Plutosport-sites binnen.',
    '',
    ...top(p.hosts, 10),
    '',
    '### De hele feed per merk',
    '',
    ...top(p.brands, 30),
    '',
  ];
}

const MATCHES_PATH = 'src/catalog/offers/matches.ts';

type ProductMatch = { product: Product; match: StickMatch };

/**
 * The 'zeker' matches to an in-stock Plutosport product page, as the
 * generated src/catalog/offers/matches.ts. 'Twijfel' never goes in: the
 * owner confirms those by hand (docs/spec/prijsvergelijking.md §3.1).
 */
function matchesFile(date: string, matches: readonly ProductMatch[]): { source: string; matches: PlutosportMatches } {
  const sure: Record<string, PlutosportMatch> = {};
  for (const { product, match } of [...matches].sort((a, b) => a.product.slug.localeCompare(b.product.slug))) {
    const model = match.model;
    if (match.level !== 'zeker' || !model?.inStock || !match.method) continue;
    if (!isPlutosportProductPage(new URL(model.url))) continue;
    sure[product.slug] = { productUrl: model.url, method: match.method };
  }
  const data: PlutosportMatches = { date, matches: sure };
  const source = [
    '// GENERATED by `npm run plutosport:feed -- --write-matches` from the Plutosport product feed (Awin).',
    "// Only 'zeker' matches; see src/catalog/plutosportFeed.ts and src/catalog/offers/index.ts.",
    "import type { PlutosportMatches } from './index';",
    '',
    `export const PLUTOSPORT_MATCHES: PlutosportMatches = ${JSON.stringify(data)};`,
    '',
  ].join('\n');
  return { source, matches: data };
}

/** Short Dutch summary for the weekly sync PR: what changed and which doubts to confirm by hand. */
function matchesReport(sure: PlutosportMatches, matches: readonly ProductMatch[]): string {
  const before = PLUTOSPORT_MATCHES.matches;
  const added = Object.keys(sure.matches).filter((slug) => !before[slug]);
  const removed = Object.keys(before).filter((slug) => !sure.matches[slug]);
  const doubts = matches.filter(({ match }) => match.level === 'twijfel' && match.model?.inStock);
  const curatedSlugs = new Set(getCatalogProducts().map((p) => p.slug));
  const label = (slug: string) => `\`${slug}\`${curatedSlugs.has(slug) ? '' : ' (geïmporteerd)'}`;
  return [
    '## Plutosport-koppelingen',
    '',
    `${Object.keys(sure.matches).length} sticks hebben een zekere koppeling met een leverbare stick bij Plutosport en krijgen een Plutosport-knop.`,
    '',
    `- **Nieuw:** ${added.length ? added.map(label).join(', ') : 'geen'}`,
    `- **Vervallen** (niet meer zeker of niet meer leverbaar): ${removed.length ? removed.map(label).join(', ') : 'geen'}`,
    '',
    '### Twijfel: met de hand bevestigen',
    '',
    doubts.length
      ? 'Deze sticks krijgen géén knop. Klopt een koppeling, laat het weten; dan komt hij er met de hand bij.'
      : 'Geen.',
    '',
    ...doubts.map(
      ({ product, match }) =>
        `- ${label(product.slug)} (${product.name}) → **${match.model?.name ?? '?'}** — ${match.model?.url ?? ''}\n  - ${match.note}`,
    ),
    '',
  ].join('\n');
}

const IMPORT_PATH = 'src/catalog/imported/plutosport.ts';

function importFile(date: string, products: readonly Product[]): string {
  return [
    '// GENERATED by `npm run plutosport:feed -- --write-import` from the Plutosport product feed (Awin).',
    '// Do not edit by hand: the weekly sync overwrites this file. To curate a stick, copy it',
    '// to src/catalog/products/, remove `feedImport` and register it in src/catalog/index.ts.',
    "import type { Product } from '../types';",
    '',
    `export const PLUTOSPORT_IMPORT_DATE = '${date}';`,
    '',
    'export const PLUTOSPORT_PRODUCTS: Product[] = [',
    ...products.map((p) => `  ${JSON.stringify(p)},`),
    '];',
    '',
  ].join('\n');
}

function importReport(products: readonly Product[], skips: readonly ImportSkip[]): string {
  const before = new Set(getPlutosportImportedProducts().map((p) => p.slug));
  const now = new Set(products.map((p) => p.slug));
  const added = products.filter((p) => !before.has(p.slug));
  const gone = [...before].filter((slug) => !now.has(slug));
  const reasons = new Map<string, number>();
  for (const s of skips) reasons.set(s.reason.replace(/"[^"]*"/, '"…"'), (reasons.get(s.reason.replace(/"[^"]*"/, '"…"')) ?? 0) + 1);
  return [
    '## Plutosport-import',
    '',
    `${products.length} sticks van Plutosport die PassaHockey niet verkoopt en die niet in onze catalogus staan, staan in de catalogus met alleen een Plutosport-knop (pagina op /aanbod, noindex).`,
    '',
    `- **Nieuw:** ${added.length ? added.map((p) => `${p.name} (\`${p.slug}\`)`).join(', ') : 'geen'}`,
    `- **Verdwenen** (niet meer leverbaar of nu gekoppeld): ${gone.length ? gone.map((slug) => `\`${slug}\``).join(', ') : 'geen'}`,
    `- **Overgeslagen:** ${reasons.size ? [...reasons.entries()].map(([reason, count]) => `${reason}: ${count}`).join(', ') : 'geen'}`,
    '',
  ].join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const writeMatches = args.includes('--write-matches');
  const writeImport = args.includes('--write-import');
  const [mdPath = 'plutosport.md', feedPath, passaPath] = args.filter((arg) => !arg.startsWith('--'));
  const [collector, passaModels] = await Promise.all([readPlutosport(feedPath), readPassa(passaPath)]);
  const models = collector.result();
  const tooSmall =
    collector.tally.rows < MIN_FEED_ROWS
      ? `Maar ${collector.tally.rows} regels in de Plutosport-feed (verwacht minstens ${MIN_FEED_ROWS}).`
      : models.length < MIN_STICK_MODELS
        ? `Maar ${models.length} hockeystickmodellen in de Plutosport-feed (verwacht minstens ${MIN_STICK_MODELS}); is het filter of de feed veranderd?`
        : null;
  if (tooSmall) {
    // Still show what the feed holds, so the owner can see whether the Awin filter or our filter is the cause.
    writeFileSync(
      mdPath,
      [`# Plutosport-feed: meting afgebroken`, '', `${tooSmall} Er is niet gekoppeld.`, '', ...feedProfile(collector, models)].join('\n'),
    );
    console.error(tooSmall);
    process.exitCode = 1;
    return;
  }

  const curated = getCatalogProducts();
  const passaByUrl = new Map((passaModels ?? []).map((m) => [m.url, m]));
  const passaPrices = passaModels ? livePricesFromFeed(curated, passaModels) : PASSAHOCKEY_LIVE_PRICES.prices;
  const passaSource = passaModels
    ? 'uit de PassaHockey-feed van vandaag.'
    : `PassaHockey-feed niet bereikbaar; prijzen van de laatste sync (${PASSAHOCKEY_LIVE_PRICES.date}), zonder EAN-koppeling.`;

  const matchProduct = (product: Product) => {
    const passa = product.passaSportsProductUrl ? passaByUrl.get(product.passaSportsProductUrl.split('?')[0] ?? '') : undefined;
    const bow = product.bowProfile?.value;
    const modelYear = getModelYear(product);
    return matchStick(
      {
        slug: product.slug,
        brand: product.brand,
        name: product.name,
        discipline: getDiscipline(product),
        ...(bow && { bow }),
        ...(modelYear && { modelYear }),
        eans: passa?.eans ?? [],
      },
      models,
    );
  };

  const rows: OverlapRow[] = curated.map((product) => {
    const match = matchProduct(product);
    const plutoPrice = match.model?.inStockPriceMin ?? null;
    return {
      slug: product.slug,
      name: product.name,
      bol: product.bolProductUrl ? 'ja' : product.bolNotSold ? 'nee' : 'onbekend',
      passaPrice: passaPrices[product.slug] ?? null,
      match,
      plutoPrice: match.level === 'geen' ? null : plutoPrice,
      plutoShipping: plutoPrice === null ? null : shippingCostEur(PLUTOSPORT_SHIPPING, plutoPrice),
    };
  });

  const date = new Date().toISOString().slice(0, 10);
  const products = [...curated, ...getImportedProducts()];
  const matches = products.map((product) => ({ product, match: matchProduct(product) }));
  writeFileSync(mdPath, report(date, collector, models, rows, passaSource));
  writeFileSync(mdPath.replace(/(\.md)?$/, '-sticks.md'), stickList(models, rows));
  const extra: string[] = [];
  if (writeMatches) {
    const sure = matchesFile(date, matches);
    writeFileSync(MATCHES_PATH, sure.source);
    extra.push(matchesReport(sure.matches, matches));
  }
  if (writeImport) {
    // Every Plutosport model a catalog stick matched, also as 'twijfel': never import those, or a stick appears twice.
    const matchedKeys = new Set(matches.flatMap(({ match }) => (match.model && match.level !== 'geen' ? [match.model.key] : [])));
    const taken = new Set(products.map((p) => p.slug));
    const imported: Product[] = [];
    const skips: ImportSkip[] = [];
    for (const gap of plutosportGaps(models, matchedKeys)) {
      const result = toPlutosportProduct(gap, date);
      if ('skip' in result) skips.push(result.skip);
      else if (taken.has(result.product.slug)) skips.push({ url: gap.url, name: gap.name, reason: 'slug bestaat al' });
      else {
        taken.add(result.product.slug);
        imported.push(result.product);
      }
    }
    imported.sort((a, b) => a.slug.localeCompare(b.slug));
    writeFileSync(IMPORT_PATH, importFile(date, imported));
    extra.push(importReport(imported, skips));
  }
  if (extra.length) writeFileSync(mdPath.replace(/(\.md)?$/, '-koppelingen.md'), extra.join('\n'));
  const summary = overlapSummary(rows);
  console.log(
    `${collector.tally.rows} regels, ${models.length} stickmodellen; ${summary.multiShopSure} van ${summary.sticks} sticks bij 2+ winkels.`,
  );
}

main().catch((error: unknown) => {
  console.error(redact(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
