// HockeyCity feed (decision log 2026-11-03): downloads the TradeTracker product
// feed of HockeyCity, matches its sticks with our catalog by name (its stick
// GTINs are HockeyCity's own numbers, not EANs) and its shoes by EAN, and
// writes a Dutch report. With --write it writes src/catalog/offers/hockeyCity.ts:
// the 'zeker' stick matches and the hand-confirmed ones (hockeyCityConfirmed.ts)
// that are in stock, and the shoe listings. The weekly PassaHockey sync runs it
// after the shoe import, so new shoe models get their HockeyCity listing too.
// Usage: npm run hockeycity:feed -- [report.md] [feed.xml] [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { getDiscipline } from '../src/catalog/discipline';
import {
  HOCKEYCITY_FEED_URL,
  hockeyCityShoeListings,
  hockeyCityStickMatches,
  hockeyCitySticks,
  isHockeyCityShoe,
  parseHockeyCityFeed,
  type HockeyCityRecord,
  type HockeyCityStickModel,
} from '../src/catalog/hockeyCityFeed';
import { getCatalogProducts, getImportedProducts, getPlutosportImportedProducts } from '../src/catalog/index';
import { getModelYear } from '../src/catalog/modelYear';
import type { HockeyCityOffers } from '../src/catalog/offers/index';
import { HOCKEYCITY_OFFERS } from '../src/catalog/offers/hockeyCity';
import { HOCKEYCITY_CONFIRMED } from '../src/catalog/offers/hockeyCityConfirmed';
import { isJunior } from '../src/catalog/passaFeed';
import { matchStick, type StickMatch } from '../src/catalog/plutosportFeed';
import { IMPORTED_SHOES } from '../src/catalog/shoes/imported';
import { CURATED_SHOES } from '../src/catalog/shoes/products';
import { isJuniorStick } from '../src/catalog/similar';
import type { Product } from '../src/catalog/types';

/** HockeyCity's feed held 622 products on 2026-11-03; far fewer means a broken download. */
const MIN_RECORDS = 200;
/** It held some 260 sticks; fewer than this means the feed or its categories changed. */
const MIN_STICKS = 50;
const DOUBT_LIMIT = 40;
const OUTPUT = 'src/catalog/offers/hockeyCity.ts';

async function readFeed(localPath: string | undefined): Promise<string> {
  if (localPath) return readFileSync(localPath, 'utf8');
  const response = await fetch(HOCKEYCITY_FEED_URL, { signal: AbortSignal.timeout(300_000) });
  if (!response.ok) throw new Error(`HockeyCity-feed niet opgehaald (HTTP ${response.status}).`);
  return response.text();
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

const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;

function report(
  data: HockeyCityOffers,
  records: readonly HockeyCityRecord[],
  sticks: readonly HockeyCityStickModel[],
  matches: readonly ProductMatch[],
  confirmed: Readonly<Record<string, string>>,
): string {
  const before = HOCKEYCITY_OFFERS;
  const slugs = Object.keys(data.sticks);
  const added = slugs.filter((slug) => !before.sticks[slug]);
  const removed = Object.keys(before.sticks).filter((slug) => !data.sticks[slug]);
  const lostConfirmed = Object.keys(confirmed).filter((slug) => !data.sticks[slug]);
  const doubts = matches.filter(({ product, match }) => match.level === 'twijfel' && match.model?.inStock && !confirmed[product.slug]);
  const shoes = records.filter(isHockeyCityShoe);
  return [
    '## HockeyCity',
    '',
    `${records.length} producten in de feed, waarvan ${sticks.length} sticks (${sticks.filter((s) => s.inStock).length} op voorraad) en ${shoes.length} schoenen. Prijzen zijn de actuele prijs per productpagina; de feed geeft geen lengtes of maten.`,
    '',
    `- **Sticks met een HockeyCity-knop:** ${slugs.length} (${slugs.filter((s) => data.sticks[s]?.method === 'handmatig').length} met de hand bevestigd)`,
    `- **Nieuw:** ${added.length ? added.map((s) => `\`${s}\``).join(', ') : 'geen'}`,
    `- **Vervallen** (niet meer zeker of niet meer leverbaar): ${removed.length ? removed.map((s) => `\`${s}\``).join(', ') : 'geen'}`,
    ...(lostConfirmed.length
      ? [`- **Bevestigd, maar nu niet leverbaar of niet meer in de feed:** ${lostConfirmed.map((s) => `\`${s}\``).join(', ')}`]
      : []),
    `- **Schoenmodellen met een HockeyCity-pagina (zelfde EAN):** ${Object.keys(data.shoes).length}`,
    '',
    '### Twijfel: met de hand bevestigen',
    '',
    doubts.length
      ? `Deze sticks krijgen géén knop. HockeyCity zet zelden een modeljaar in de naam. Klopt een koppeling (zelfde model én modeljaar), zet hem dan in \`src/catalog/offers/hockeyCityConfirmed.ts\`. De eerste ${Math.min(DOUBT_LIMIT, doubts.length)} van ${doubts.length}:`
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

function generated(data: HockeyCityOffers): string {
  return [
    '// GENERATED by `npm run hockeycity:feed -- --write` from the HockeyCity product feed (TradeTracker).',
    "// Sticks: 'zeker' name matches and hand-confirmed ones; shoes: same EAN. See src/catalog/hockeyCityFeed.ts.",
    "import type { HockeyCityOffers } from './index';",
    '',
    `export const HOCKEYCITY_OFFERS: HockeyCityOffers = ${JSON.stringify(data)};`,
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
  const products = [...getCatalogProducts(), ...getImportedProducts(), ...getPlutosportImportedProducts()];
  const matches = matchAll(products, sticks);
  const data: HockeyCityOffers = {
    date,
    sticks: hockeyCityStickMatches(
      matches.map(({ product, match }) => ({ slug: product.slug, match })),
      records,
      HOCKEYCITY_CONFIRMED,
    ),
    // Checked models first: an EAN that is in both goes to the checked one.
    shoes: hockeyCityShoeListings([...CURATED_SHOES, ...IMPORTED_SHOES], records, date),
  };
  if (write) writeFileSync(OUTPUT, generated(data));
  writeFileSync(mdPath, report(data, records, sticks, matches, HOCKEYCITY_CONFIRMED));
  console.log(`${records.length} producten; ${Object.keys(data.sticks).length} sticks en ${Object.keys(data.shoes).length} schoenen gekoppeld.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
