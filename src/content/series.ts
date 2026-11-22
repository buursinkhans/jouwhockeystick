import { BOW_LABELS } from '@/catalog/labels';
import { getOffers } from '@/catalog/offers';
import type { Dimension, SeriesEvaluation, SeriesStick } from '@/catalog/series';
import type { ExperienceLevel, Product } from '@/catalog/types';
import { RETAILERS } from '@/lib/retailers';
import type { FaqItem } from '@/lib/faqJsonLd';
import { euro } from './offers';

/**
 * The text of a series comparison (/vergelijk/<reeks>, wave 1, decision log
 * 2026-11-22), built from the catalog data only: level, bow, carbon, lengths
 * and indicative price of the sticks. Nothing here is a test result or an
 * experience, and nothing ranks the sticks. A fact that is not in the catalog
 * is left out; two sticks that differ only in price are said to differ only
 * in price.
 */

const AUDIENCE: Record<ExperienceLevel, string> = {
  beginner: 'beginnende spelers',
  gevorderd: 'gevorderde spelers',
  ervaren: 'ervaren spelers',
};

const DIMENSION_WORDS: Record<Dimension, string> = {
  niveau: 'niveau',
  kromming: 'kromming',
  carbon: 'carbonpercentage',
  lengtes: 'beschikbare lengtes',
  prijs: 'richtprijs',
};

/** "a, b en c". */
export function dutchList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} en ${items.at(-1)}`;
}

const dims = (varying: readonly Dimension[]) => dutchList(varying.map((d) => DIMENSION_WORDS[d]));
const inchNumber = (value: number) => String(value).replace('.', ',');
const bowName = (product: Product) =>
  product.bowProfile ? (BOW_LABELS[product.bowProfile.value].split(' / ')[0] ?? '').toLowerCase() : null;
const carbonText = (product: Product) =>
  product.carbonPercentage?.value === 0 ? 'zonder carbon' : `${product.carbonPercentage?.value}% carbon`;

/** "JB 6 (40% carbon, gevorderd)": the facts that differ, short. */
function summary(stick: SeriesStick, evaluation: SeriesEvaluation): string {
  const { product } = stick;
  const parts = [
    evaluation.varying.includes('kromming') ? bowName(product) : null,
    carbonText(product),
    product.experienceLevel.value,
  ].filter((part): part is string => part !== null);
  return `${stick.label} (${parts.join(', ')})`;
}

const noSpace = (label: string) => label.replace(' ', '');

export function seriesTitle(evaluation: SeriesEvaluation): string {
  const { series, members } = evaluation;
  return `${series.brand} ${series.name} vergeleken: ${dutchList(members.map((m) => noSpace(m.label)))}`;
}

export function seriesDescription(evaluation: SeriesEvaluation): string {
  const { series, members, varying } = evaluation;
  const without = varying.filter((d) => d !== 'prijs');
  return `${series.brand} ${dutchList(members.map((m) => m.label))} vergeleken: wat verschilt er in ${dims(without)}, en wat kosten ze bij partnerwinkels?`;
}

/** The first paragraph: who is which stick, in the first 80 words. */
export function seriesIntro(evaluation: SeriesEvaluation): string {
  const { series, members, varying } = evaluation;
  return `In deze vergelijking staan ${members.length} ${series.noun}: ${dutchList(members.map((m) => summary(m, evaluation)))}. Ze verschillen in ${dims(varying)}. Dit is een vergelijking op gegevens uit onze catalogus, geen rangorde.`;
}

/** Sentence for sticks that differ only in indicative price; null when there are none. */
export function priceOnlyNote(evaluation: SeriesEvaluation): string | null {
  if (evaluation.priceOnlyPairs.length === 0) return null;
  const pairs = evaluation.priceOnlyPairs.map(([a, b]) => `de ${a.label} en de ${b.label}`);
  return `In onze gegevens verschillen ${dutchList(pairs)} alleen in richtprijs. Andere verschillen, zoals de opbouw van de stick, staan niet in onze gegevens.`;
}

export type ChooseBlock = { label: string; slug: string; points: string[] };

/** "Kies de JB 6 als…": the level, then at most two properties in which the series differs. */
export function chooseBlocks(evaluation: SeriesEvaluation): ChooseBlock[] {
  const { members, varying } = evaluation;
  const priceOnlyLabels = new Set(evaluation.priceOnlyPairs.flatMap(([a, b]) => [a.label, b.label]));
  const carbons = members.map((m) => m.product.carbonPercentage?.value ?? 0);
  const prices = members.map((m) => m.product.priceIndicativeEur.value);
  const minCarbon = Math.min(...carbons);
  const maxCarbon = Math.max(...carbons);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return members.map(({ product, label }) => {
    const carbon = product.carbonPercentage?.value ?? 0;
    const price = product.priceIndicativeEur.value;
    const level = product.experienceLevel.source === 'editorial-estimate'
      ? `je een stick zoekt die kan passen bij ${AUDIENCE[product.experienceLevel.value]}`
      : `je een stick zoekt voor ${AUDIENCE[product.experienceLevel.value]}`;
    const optional: Record<Exclude<Dimension, 'niveau'>, string> = {
      kromming: `je een ${bowName(product)} wilt`,
      carbon:
        carbon === 0
          ? 'je een stick zonder carbon wilt'
          : carbon === maxCarbon && maxCarbon > minCarbon
            ? `je het hoogste carbonpercentage in deze vergelijking wilt (${carbon}%)`
            : carbon === minCarbon && maxCarbon > minCarbon
              ? `je het laagste carbonpercentage in deze vergelijking wilt (${carbon}%)`
              : `je een carbonpercentage van ${carbon}% zoekt`,
      prijs:
        price === minPrice && maxPrice > minPrice
          ? `je de laagste richtprijs in deze vergelijking zoekt (${euro(price)})`
          : price === maxPrice && maxPrice > minPrice
            ? `je de hoogste richtprijs in deze vergelijking accepteert (${euro(price)})`
            : `je rond een richtprijs van ${euro(price)} blijft`,
      lengtes: `je een lengte van ${dutchList([...new Set(product.lengthsInches.value)].sort((a, b) => a - b).map(inchNumber))} inch zoekt`,
    };
    const order = ['kromming', 'carbon', 'prijs', 'lengtes'] as const;
    const candidates = order.filter((d) => varying.includes(d));
    // A stick that differs from another only in price must say so, or its block reads the same as the other's.
    const needsPrice = priceOnlyLabels.has(label) && candidates.includes('prijs');
    const chosen = needsPrice ? [...candidates.filter((d) => d !== 'prijs').slice(0, 1), 'prijs' as const] : candidates.slice(0, 2);
    const extra = chosen.map((d) => optional[d]);
    return { label, slug: product.slug, points: [level, ...extra] };
  });
}

/** The partner shops that list at least one stick of the series, by name. */
function shopsOf(evaluation: SeriesEvaluation): string[] {
  const ids = new Set(evaluation.members.flatMap((m) => getOffers(m.product).map((o) => o.retailer)));
  return [...ids].map((id) => RETAILERS[id].label).sort((a, b) => a.localeCompare(b, 'nl'));
}

export function seriesFaq(evaluation: SeriesEvaluation): FaqItem[] {
  const { series, members, varying } = evaluation;
  const labels = dutchList(members.map((m) => m.label));
  const note = priceOnlyNote(evaluation);
  const follow =
    series.discipline === 'veld'
      ? 'Twijfel je? In de [stickwijzer](/stickwijzer) kom je in een paar vragen bij een eerste selectie.'
      : 'Bij de [zaalsticks](/zaalsticks) maak je in drie vragen een eerste selectie.';
  const shops = shopsOf(evaluation);

  return [
    {
      question: `Wat is het verschil tussen de ${series.brand} ${labels}?`,
      answer: `Ze verschillen in ${dims(varying)}. ${members.map((m) => summary(m, evaluation)).join('; ')}.${note ? ` ${note}` : ''}`,
    },
    {
      question: 'Voor welke spelers zijn deze sticks bedoeld?',
      answer: `${members.map((m) => `${m.label}: ${AUDIENCE[m.product.experienceLevel.value]}`).join('; ')}. Het niveau komt van de merksite of is een inschatting van ons; per stick staat bij de bron welke van de twee. ${follow}`,
    },
    {
      question: 'Hoeveel carbon zit er in deze sticks?',
      answer: `${members.map((m) => `${m.label}: ${m.product.carbonPercentage?.value === 0 ? 'geen carbon' : `${m.product.carbonPercentage?.value}%`}`).join('; ')}. Lees ook [hoeveel carbon je nodig hebt](/kennis/meer-carbon-hockeystick-beter).`,
    },
    {
      question: 'In welke lengtes staan ze in onze catalogus?',
      answer: `${members.map((m) => `${m.label}: ${dutchList([...new Set(m.product.lengthsInches.value)].sort((a, b) => a - b).map(inchNumber))} inch`).join('; ')}. Welke lengte bij jou past, zie je in de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel).`,
    },
    {
      question: 'Waar kan ik deze sticks kopen?',
      answer: shops.length
        ? `Bij partnerwinkels: ${dutchList(shops)}. Niet elke winkel verkoopt elke stick; hierboven zie je per stick welke winkel welke prijs heeft, gesorteerd op prijs inclusief verzending. De winkel is de verkoper. Wij krijgen een vergoeding als je via een link koopt; dat verandert de volgorde niet.`
        : 'We kennen op dit moment geen partnerwinkel die deze sticks verkoopt. Vraag ernaar bij je hockeywinkel.',
    },
  ];
}

/** Reading links at the bottom: the stickwijzer or the indoor selector, and the articles on bow, carbon and length. */
export function seriesReadMore(evaluation: SeriesEvaluation): { href: string; label: string }[] {
  const base = [
    { href: '/kennis/low-bow-vs-mid-bow', label: 'Low bow of mid bow: welke kromming past bij jou?' },
    { href: '/kennis/meer-carbon-hockeystick-beter', label: 'Hoeveel carbon heeft je hockeystick nodig?' },
    { href: '/kennis/hockeystick-lengte-tabel', label: 'Hockeystick lengte tabel: welke maat stick past bij jouw lengte?' },
  ];
  return evaluation.series.discipline === 'veld'
    ? [{ href: '/stickwijzer', label: 'Doe de stickwijzer voor een advies op jouw spel' }, ...base]
    : [
        { href: '/zaalsticks', label: 'Zaalsticks: kies in drie vragen' },
        { href: '/kennis/veldstick-zaalhockey', label: 'Kun je met een veldstick zaalhockeyen?' },
        ...base,
      ];
}
