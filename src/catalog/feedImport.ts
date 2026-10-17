/**
 * Turns a PassaHockey feed model into a catalog product (bulk import, see
 * docs/decision-log.md 2026-10-17). Specs come only from the feed: the bow
 * and carbon percentage from the "Belangrijkste kenmerken" in the
 * description (or the product name), the model year from the article code
 * where the brand puts it there. Level and positions are our own estimate,
 * labelled as such. Nothing is guessed: unknown specs stay empty.
 */
import type { PassaStickModel } from './passaFeed';
import { brandSchema, type BowProfile, type Brand, type ExperienceLevel, type Position, type Product } from './types';

/** Oldest model year we import; older collections are left out when the year is known. */
export const MIN_MODEL_YEAR = 2025;

const BRAND_BY_FEED_NAME: Record<string, Brand> = Object.fromEntries([
  ...brandSchema.options.map((brand) => [brand.toLowerCase(), brand] as const),
  ['indian maharadja', 'The Indian Maharadja'] as const,
]);

export function catalogBrand(feedBrand: string): Brand | null {
  return BRAND_BY_FEED_NAME[feedBrand.trim().toLowerCase()] ?? null;
}

const BOW_PATTERNS: [RegExp, BowProfile][] = [
  [/extreme\s*-?\s*low\s*-?\s*bow/i, 'extreme_lowbow'],
  [/low\s*-?\s*bow/i, 'lowbow'],
  [/mid\s*-?\s*bow/i, 'midbow'],
  [/pro\s*-?\s*bow/i, 'probow'],
  [/ultra\s*-?\s*bow/i, 'ultrabow'],
  [/dyna\s*-?\s*bow/i, 'dynabow'],
];

function bowFrom(text: string): BowProfile | null {
  for (const [pattern, bow] of BOW_PATTERNS) if (pattern.test(text)) return bow;
  return null;
}

/** The "Type kromming" in the description, as written. */
function statedBow(description: string): string | null {
  return description.match(/type\s+kromming\s*:\s*([a-z][a-z \-]*?)\s*(?:\*|de\s|$)/i)?.[1]?.trim() ?? null;
}

export type BowFinding =
  | { bow: BowProfile; from: 'omschrijving' | 'naam' }
  | { bow: null; reason: 'niet vermeld' | 'tegenstrijdig' | 'onbekend type' };

/** Bow from the description, else from the name; omitted when the two disagree or the type is not one of ours. */
export function extractBow(description: string, name: string): BowFinding {
  const stated = statedBow(description);
  const fromDescription = stated ? bowFrom(stated) : null;
  const fromName = bowFrom(name);
  if (stated && !fromDescription) return { bow: null, reason: 'onbekend type' };
  if (fromDescription && fromName && fromDescription !== fromName) return { bow: null, reason: 'tegenstrijdig' };
  if (fromDescription) return { bow: fromDescription, from: 'omschrijving' };
  if (fromName) return { bow: fromName, from: 'naam' };
  return { bow: null, reason: 'niet vermeld' };
}

export function extractCarbon(description: string): number | null {
  const match = description.match(/(?:carbonpercentage|percentage\s+carbon)\s*:\s*(\d{1,3})\s*%/i);
  const value = match?.[1] ? Number(match[1]) : NaN;
  return value >= 0 && value <= 100 ? value : null;
}

/**
 * Model year from the article code, only for brands that put it there:
 * Y1 and Ritual end the page with the season ("…-26", "…25"), Indian
 * Maharadja codes start with 10 + the year ("…-10261057" is 2026).
 */
export function modelYearFromUrl(brand: Brand, url: string): number | null {
  const path = new URL(url).pathname;
  if (brand === 'Y1' || brand === 'Ritual') {
    const year = path.match(/(2[3-9])$/)?.[1];
    return year ? 2000 + Number(year) : null;
  }
  if (brand === 'The Indian Maharadja') {
    const year = path.match(/-10(2[0-9])\d{4}$/)?.[1];
    return year ? 2000 + Number(year) : null;
  }
  return null;
}

export function slugFromUrl(url: string): string {
  return new URL(url).pathname
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const isJunior = (model: PassaStickModel) =>
  model.gender === 'Junior' || /\b(junior|jr|kids|kinder)\b/i.test(model.name);

/** Our estimate: carbon and price are the only level signals the feed gives. */
export function estimateLevel(carbon: number | null, price: number): ExperienceLevel {
  if ((carbon !== null && carbon >= 70) || price >= 200) return 'ervaren';
  if ((carbon !== null && carbon >= 30) || price >= 80) return 'gevorderd';
  return 'beginner';
}

function estimatePositions(bow: BowProfile | null): Position[] {
  return bow === 'extreme_lowbow' ? ['middenvelder', 'aanvaller'] : ['verdediger', 'middenvelder', 'aanvaller'];
}

const BOW_LABEL: Record<BowProfile, string> = {
  extreme_lowbow: 'extreme low bow',
  lowbow: 'low bow',
  midbow: 'mid bow',
  probow: 'pro bow',
  ultrabow: 'ultrabow',
  dynabow: 'dynabow',
};

const BOW_STRENGTH: Record<BowProfile, string> = {
  extreme_lowbow:
    'Extra lage kromming: een logische richting voor technische spelers die veel liften, slepen en sleeppushen',
  lowbow: 'Lage kromming: kan passen bij spelers die de bal willen liften en slepen',
  midbow: 'Kromming in het midden: een allround keuze die bij veel spelers en posities kan passen',
  probow: 'Kromming hoger in de stick: kan passen bij wie veel wil passen en de bal rustig wil aannemen',
  ultrabow: 'Grays Ultrabow: een gelijkmatige kromming die bij veel beginnende spelers kan passen',
  dynabow: 'Grays Dynabow: een kromming tussen mid bow en low bow in',
};

const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;
const inch = (n: number) => String(n).replace('.', ',');

export type ImportSkip = { url: string; name: string; reason: string };

export function toImportedProduct(
  model: PassaStickModel,
  today: string,
): { product: Product } | { skip: ImportSkip } {
  const skip = (reason: string) => ({ skip: { url: model.url, name: model.name, reason } });
  const brand = catalogBrand(model.brand);
  if (!brand) return skip(`merk "${model.brand}" staat niet in de catalogus`);
  if (!/\s/.test(model.name.trim())) return skip('naam in de feed is een artikelcode');
  if (model.discipline === 'onbekend') return skip('veld of zaal niet bekend');
  if (model.sizesInStockInches.length === 0) return skip('geen leverbare maat in inches');
  const modelYear = modelYearFromUrl(brand, model.url);
  if (modelYear !== null && modelYear < MIN_MODEL_YEAR) return skip(`modeljaar ${modelYear}`);

  const source = 'partner-shop' as const;
  const sourceUrl = model.url;
  const year = modelYear !== null ? { modelYear } : {};
  const fact = (sourceLabel: string) => ({ source, sourceLabel, sourceUrl, ...year, lastVerifiedAt: today });
  const estimate = (sourceLabel: string) => ({ source: 'editorial-estimate' as const, sourceLabel, lastVerifiedAt: today });

  const bowFinding = extractBow(model.description, model.name);
  const bow = bowFinding.bow;
  const carbon = extractCarbon(model.description);
  const price = model.priceMin;
  const sizes = model.sizesInStockInches;
  const junior = isJunior(model);
  const kind = model.discipline === 'zaal' ? 'Zaalstick' : 'Veldstick';

  const details = [
    bow ? `${BOW_LABEL[bow]}` : null,
    carbon !== null ? `${carbon}% carbon` : null,
  ].filter((d): d is string => d !== null);
  const summary = `${kind} van ${brand}${junior ? ' voor jeugdspelers' : ''}${
    details.length ? `, met ${details.join(' en ')}` : ''
  }. Leverbaar bij PassaHockey in ${sizes.length === 1 ? `${inch(sizes[0] ?? 0)} inch` : `${sizes.length} lengtes`}.`;

  const strengths = [
    bow ? BOW_STRENGTH[bow] : null,
    carbon === null
      ? null
      : carbon >= 70
        ? `Veel carbon (${carbon}%): een stijve stick die veel slagkracht kan geven`
        : carbon >= 30
          ? `Gemiddeld carbonpercentage (${carbon}%): een balans tussen balgevoel en slagkracht`
          : `Weinig of geen carbon (${carbon}%): vergevingsgezind bij het aannemen van de bal`,
    sizes.length >= 5 ? `Leverbaar in veel lengtes (${inch(sizes[0] ?? 0)} tot ${inch(sizes[sizes.length - 1] ?? 0)} inch)` : null,
  ].filter((s): s is string => s !== null);

  const attention = [
    'Gegevens uit de productomschrijving van PassaHockey; nog niet met de website van het merk vergeleken',
    bow === null ? 'Kromming niet eenduidig vermeld' : null,
    carbon === null ? 'Carbonpercentage niet vermeld' : null,
    sizes.length === 1 ? 'Bij PassaHockey in één lengte leverbaar' : null,
  ].filter((s): s is string => s !== null);

  const bowLabel =
    bow === null
      ? null
      : 'from' in bowFinding && bowFinding.from === 'omschrijving'
        ? `PassaHockey vermeldt "Type kromming: ${statedBow(model.description) ?? BOW_LABEL[bow]}".`
        : `De productnaam bij PassaHockey noemt een ${BOW_LABEL[bow]}.`;

  const product: Product = {
    slug: slugFromUrl(model.url),
    brand,
    name: model.name,
    dataStatus: 'verified',
    feedImport: { feed: 'passahockey', importedAt: today },
    passaSportsProductUrl: model.url,
    imageAlt: `${model.name} hockeystick`,
    ...(model.imageUrl && { imageUrl: model.imageUrl, imageSourceUrl: model.url }),
    discipline: {
      value: model.discipline,
      ...fact(`PassaHockey plaatst deze stick bij ${model.discipline === 'zaal' ? 'zaalhockey' : 'de veldhockeysticks'}.`),
    },
    experienceLevel: {
      value: estimateLevel(carbon, price),
      ...estimate(
        `PassaHockey noemt geen niveau. Eigen inschatting op basis van ${
          carbon !== null ? `het carbonpercentage (${carbon}%) en ` : ''
        }de prijs (${euro(price)}).`,
      ),
      ...year,
    },
    recommendedPositions: {
      value: estimatePositions(bow),
      ...estimate('PassaHockey noemt geen positie. Eigen inschatting op basis van de kromming; positie is nooit de enige factor.'),
    },
    ...(bow && bowLabel && { bowProfile: { value: bow, ...fact(bowLabel) } }),
    ...(carbon !== null && {
      carbonPercentage: { value: carbon, ...fact(`PassaHockey vermeldt een carbonpercentage van ${carbon}%.`) },
    }),
    lengthsInches: { value: sizes, ...fact('Lengtes die volgens de productfeed van PassaHockey leverbaar waren op de controledatum.') },
    priceIndicativeEur: {
      value: price,
      ...fact('Laagste verkoopprijs bij PassaHockey volgens de productfeed op de controledatum.'),
    },
    stock: {
      value: sizes.length === 1 ? 'limited' : 'available',
      ...fact('Voorraad volgens de productfeed van PassaHockey op de controledatum.'),
    },
    summary,
    strengths: {
      value: strengths.length ? strengths : [`Leverbaar bij PassaHockey in ${sizes.length} ${sizes.length === 1 ? 'lengte' : 'lengtes'}`],
      ...estimate('Eigen inschatting op basis van de gegevens in de productfeed van PassaHockey.'),
    },
    pointsOfAttention: {
      value: attention,
      ...estimate('Eigen inschatting op basis van de gegevens in de productfeed van PassaHockey.'),
    },
  };
  return { product };
}
