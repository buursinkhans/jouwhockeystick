/**
 * Turns a Plutosport feed model into a catalog product (bulk import, like
 * the PassaHockey import in feedImport.ts; decision log 2026-10-27). Only
 * sticks we do not have yet: not curated, not imported from PassaHockey, and
 * not a 'zeker' or 'twijfel' match to either, so no stick appears twice.
 * Specs come only from the feed; level and positions are our own estimate,
 * labelled as such. Unknown specs stay empty.
 */
import {
  BOW_LABEL,
  BOW_STRENGTH,
  MIN_MODEL_YEAR,
  catalogBrand,
  estimateLevel,
  estimatePositions,
  isImplausibleCarbon,
  slugFromUrl,
  type ImportSkip,
} from './feedImport';
import { bowInName, seasonYear, yearFromArticleCode, type PlutoStickModel } from './plutosportFeed';
import { COLOURS } from './gaps';
import { modelTokens } from './passaFeed';
import type { Product } from './types';

/**
 * A carbon percentage the shop states in so many words ("60% carbon",
 * "Carbon: 60%"). Nothing when the text names none or several different
 * percentages (e.g. a range in a general text).
 */
export function carbonFromText(text: string): number | null {
  const found = new Set<number>();
  for (const match of text.matchAll(/(\d{1,3})\s*%\s*carbon\b|\bcarbon(?:percentage|gehalte)?\s*[:=]?\s*(\d{1,3})\s*%/gi)) {
    const value = Number(match[1] ?? match[2]);
    if (value >= 0 && value <= 100) found.add(value);
  }
  return found.size === 1 ? ([...found][0] as number) : null;
}

const inchValue = (size: string) => Number(size.replace(',', '.'));
const euro = (n: number) => `€${n.toFixed(2).replace('.', ',')}`;
const inch = (n: number) => String(n).replace('.', ',');

/** Colour variants have their own page; one product per model name, the one with the most lengths in stock. */
export function modelNameKey(model: PlutoStickModel): string {
  return `${model.brand.toLowerCase()}|${modelTokens(model.name, model.brand)
    .filter((token) => !COLOURS.has(token))
    .join(' ')}`;
}

/**
 * The Plutosport sticks to import: in stock, matched to nothing in the
 * catalog (`matchedKeys` holds every model a catalog stick matched as
 * 'zeker' or 'twijfel'), one per model name.
 */
export function plutosportGaps(models: readonly PlutoStickModel[], matchedKeys: ReadonlySet<string>): PlutoStickModel[] {
  const byName = new Map<string, PlutoStickModel>();
  for (const model of models) {
    if (!model.inStock || matchedKeys.has(model.key)) continue;
    const key = modelNameKey(model);
    const existing = byName.get(key);
    if (
      !existing ||
      model.sizesInStock.length > existing.sizesInStock.length ||
      (model.sizesInStock.length === existing.sizesInStock.length && model.url < existing.url)
    ) {
      byName.set(key, model);
    }
  }
  return [...byName.values()].sort((a, b) => a.url.localeCompare(b.url));
}

export function toPlutosportProduct(
  model: PlutoStickModel,
  today: string,
): { product: Product } | { skip: ImportSkip } {
  const skip = (reason: string) => ({ skip: { url: model.url, name: model.name, reason } });
  const brand = catalogBrand(model.brand);
  if (!brand) return skip(`merk "${model.brand}" staat niet in de catalogus`);
  if (/goalie|keeper|\bgk\s*\d*\b/i.test(model.name)) return skip('keepersstick');
  if (/\bbaby\b/i.test(model.name)) return skip('babystick');
  const sizes = model.sizesInStock.map(inchValue).filter((n) => Number.isFinite(n) && n >= 18 && n <= 39);
  if (sizes.length === 0) return skip('geen leverbare lengte in inches');
  const modelYear = seasonYear(model.name) ?? yearFromArticleCode(model.url, model.brand);
  if (modelYear !== null && modelYear < MIN_MODEL_YEAR) return skip(`modeljaar ${modelYear}`);
  const price = model.inStockPriceMin ?? model.priceMin;

  const source = 'partner-shop' as const;
  const sourceUrl = model.url;
  const year = modelYear !== null ? { modelYear } : {};
  const fact = (sourceLabel: string) => ({ source, sourceLabel, sourceUrl, ...year, lastVerifiedAt: today });
  const estimate = (sourceLabel: string) => ({ source: 'editorial-estimate' as const, sourceLabel, lastVerifiedAt: today });

  const bow = bowInName(model.name, model.brand);
  const feedCarbon = carbonFromText(`${model.specText} | ${model.description}`);
  const carbonDropped = feedCarbon !== null && isImplausibleCarbon(feedCarbon, price);
  const carbon = carbonDropped ? null : feedCarbon;
  const junior = model.junior;
  const kind = model.discipline === 'zaal' ? 'Zaalstick' : 'Veldstick';

  const details = [bow ? BOW_LABEL[bow] : null, carbon !== null ? `${carbon}% carbon` : null].filter(
    (d): d is string => d !== null,
  );
  const summary = `${kind} van ${brand}${junior ? ' voor jeugdspelers' : ''}${
    details.length ? `, met ${details.join(' en ')}` : ''
  }. Leverbaar bij Plutosport in ${sizes.length === 1 ? `${inch(sizes[0] ?? 0)} inch` : `${sizes.length} lengtes`}.`;

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
    'Gegevens uit de productfeed van Plutosport; nog niet met de website van het merk vergeleken',
    bow === null ? 'Kromming niet vermeld in de naam' : null,
    carbonDropped
      ? `Carbonpercentage in de feed (${feedCarbon}%) past niet bij de prijs; niet overgenomen`
      : carbon === null
        ? 'Carbonpercentage niet vermeld'
        : null,
    sizes.length === 1 ? 'Bij Plutosport in één lengte leverbaar' : null,
  ].filter((s): s is string => s !== null);

  const product: Product = {
    slug: slugFromUrl(model.url),
    brand,
    name: model.name,
    dataStatus: 'verified',
    feedImport: { feed: 'plutosport', importedAt: today },
    plutosportProductUrl: model.url,
    imageAlt: `${model.name}`,
    ...(model.imageUrl && { imageUrl: model.imageUrl, imageSourceUrl: model.url }),
    discipline: {
      value: model.discipline,
      ...fact(`Plutosport plaatst deze stick bij ${model.discipline === 'zaal' ? 'de zaalhockeysticks' : 'de veldhockeysticks'}.`),
    },
    experienceLevel: {
      value: estimateLevel(carbon, price, junior),
      ...estimate(
        `Plutosport noemt geen niveau. Eigen inschatting op basis van ${
          carbon !== null ? `het carbonpercentage (${carbon}%) en ` : ''
        }de prijs (${euro(price)})${junior ? '; een juniorstick schatten we nooit als "ervaren" in' : ''}.`,
      ),
      ...year,
    },
    recommendedPositions: {
      value: estimatePositions(bow),
      ...estimate('Plutosport noemt geen positie. Eigen inschatting op basis van de kromming; positie is nooit de enige factor.'),
    },
    ...(bow && { bowProfile: { value: bow, ...fact(`De productnaam bij Plutosport noemt een ${BOW_LABEL[bow]}.`) } }),
    ...(carbon !== null && {
      carbonPercentage: { value: carbon, ...fact(`Plutosport vermeldt een carbonpercentage van ${carbon}%.`) },
    }),
    lengthsInches: {
      value: sizes,
      ...fact('Lengtes die volgens de productfeed van Plutosport leverbaar waren op de controledatum (uit het artikelnummer).'),
    },
    priceIndicativeEur: {
      value: price,
      ...fact('Laagste verkoopprijs bij Plutosport volgens de productfeed op de controledatum.'),
    },
    stock: {
      value: sizes.length === 1 ? 'limited' : 'available',
      ...fact('Voorraad volgens de productfeed van Plutosport op de controledatum.'),
    },
    summary,
    strengths: {
      value: strengths.length ? strengths : [`Leverbaar bij Plutosport in ${sizes.length} ${sizes.length === 1 ? 'lengte' : 'lengtes'}`],
      ...estimate('Eigen inschatting op basis van de gegevens in de productfeed van Plutosport.'),
    },
    pointsOfAttention: {
      value: attention,
      ...estimate('Eigen inschatting op basis van de gegevens in de productfeed van Plutosport.'),
    },
  };
  return { product };
}
