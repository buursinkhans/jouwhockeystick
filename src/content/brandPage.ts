import { getOffers, isPriceFresh } from '@/catalog/offers';
import { EXPERIENCE_LABELS, BOW_LABELS } from '@/catalog/labels';
import { indexableSeries, seriesPath } from '@/catalog/series';
import { isJuniorStick } from '@/catalog/similar';
import type { BrandEvaluation } from '@/catalog/brandPages';
import type { FaqItem } from '@/lib/faqJsonLd';
import { RETAILERS } from '@/lib/retailers';
import { dutchList, seriesTitle } from './series';

/**
 * The text of a brand page (/merken/<merk>, decision log 2026-11-23), built
 * from the hand-checked catalog only: level, bow, carbon, lengths and price of
 * the sticks, and where each value comes from. Nothing here is a test result,
 * a ranking or a fact about the brand that is not in the repo; the brand's own
 * profile comes from src/content/brands.ts, with its sources.
 */

const MAX_DESCRIPTION = 158;
const inchNumber = (value: number) => String(value).replace('.', ',');
const bowName = (bow: keyof typeof BOW_LABELS) => (BOW_LABELS[bow].split(' / ')[0] ?? '').toLowerCase();

const bowText = (e: BrandEvaluation) => dutchList(e.bows.map(bowName));
const carbonText = (e: BrandEvaluation) =>
  !e.carbon ? '' : e.carbon.min === e.carbon.max ? `${e.carbon.min}%` : `${e.carbon.min}% tot ${e.carbon.max}%`;
const levelsText = (e: BrandEvaluation) =>
  e.levels.length > 1 ? `van ${e.levels[0]} tot ${e.levels.at(-1)}` : `voor ${e.levels[0] ?? 'alle niveaus'}`;

export function brandTitle(e: BrandEvaluation): string {
  return `${e.definition.brand} hockeysticks: welke past bij jou?`;
}

export function brandDescription(e: BrandEvaluation): string {
  const { brand } = e.definition;
  const n = e.sticks.length;
  const candidates = [
    `${brand} hockeysticks vergeleken: ${n} modellen met ${bowText(e)}, ${carbonText(e)} carbon en de prijs bij partnerwinkels.`,
    `${brand} hockeysticks vergeleken: ${n} modellen ${levelsText(e)}, ${carbonText(e)} carbon, met de prijs bij partnerwinkels.`,
    `${brand} hockeysticks vergeleken: ${n} modellen, met de prijs bij partnerwinkels.`,
  ];
  return candidates.find((text) => text.length <= MAX_DESCRIPTION) ?? candidates[2]!;
}

/** The first paragraph: what is on the page, in the first 80 words. */
export function brandIntro(e: BrandEvaluation): string {
  const { brand } = e.definition;
  const where = dutchList(
    [e.counts.field ? `${e.counts.field} voor het veld` : null, e.counts.indoor ? `${e.counts.indoor} voor de zaal` : null].filter(
      (part): part is string => part !== null,
    ),
  );
  const junior = e.counts.junior > 0 ? `, waarvan ${e.counts.junior} voor kinderen en junioren` : '';
  return `In onze catalogus staan ${e.sticks.length} ${brand}-sticks met volledige gegevens: ${where}${junior}. Het niveau loopt ${levelsText(e)}, met ${bowText(e)} en ${carbonText(e)} carbon. Per groep zie je de kromming, het carbonpercentage en de prijs bij partnerwinkels. Dit is een overzicht op catalogusgegevens, geen rangorde.`;
}

function namesOf(sticks: readonly { name: string }[], limit = 4): string {
  const names = sticks.slice(0, limit).map((s) => s.name);
  const more = sticks.length - names.length;
  return more > 0 ? `${names.join(', ')} en nog ${more}` : dutchList(names);
}

function shopsOf(e: BrandEvaluation, now: Date): string[] {
  const ids = new Set(e.sticks.flatMap((p) => getOffers(p).filter((o) => isPriceFresh(o, now)).map((o) => o.retailer)));
  return [...ids].map((id) => RETAILERS[id].label).sort((a, b) => a.localeCompare(b, 'nl'));
}

export function brandFaq(e: BrandEvaluation, now: Date = new Date()): FaqItem[] {
  const { brand } = e.definition;
  const perLevel = e.levels.map((level) => {
    const sticks = e.sticks.filter((p) => p.experienceLevel.value === level);
    return `${EXPERIENCE_LABELS[level]}: ${namesOf(sticks)}`;
  });
  const perBow = e.bows.map((bow) => `${bowName(bow)}: ${e.sticks.filter((p) => p.bowProfile?.value === bow).length}`);
  const fromBrand = e.sticks.filter((p) => p.carbonPercentage?.source === 'brand-website').length;
  const fromShop = e.sticks.length - fromBrand;
  const lengthsOf = (junior: boolean) => {
    const all = e.sticks.filter((p) => isJuniorStick(p) === junior).flatMap((p) => p.lengthsInches.value);
    return all.length ? `${inchNumber(Math.min(...all))} tot ${inchNumber(Math.max(...all))} inch` : null;
  };
  const lengthParts = [lengthsOf(false) ? `volwassenen ${lengthsOf(false)}` : null, lengthsOf(true) ? `kinderen en junioren ${lengthsOf(true)}` : null].filter(
    (part): part is string => part !== null,
  );
  const shops = shopsOf(e, now);

  return [
    {
      question: `Welke niveaus heeft ${brand} in onze catalogus?`,
      answer: `${perLevel.join('; ')}. Het niveau komt van de merksite of is een inschatting van ons; per stick staat bij de bron welke van de twee.`,
    },
    {
      question: `Welke bows heeft ${brand}?`,
      answer: `In onze catalogus, met het aantal sticks: ${perBow.join('; ')}. Het verschil tussen de kromming lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).`,
    },
    {
      question: `Hoeveel carbon zit er in ${brand}-sticks?`,
      answer: `Van ${carbonText(e)} carbon. Het percentage komt ${dutchList([fromBrand > 0 ? `bij ${fromBrand} van de ${e.sticks.length} sticks van de merksite` : null, fromShop > 0 ? `bij ${fromShop} van de ${e.sticks.length} van een partnerwinkel` : null].filter((part): part is string => part !== null))}. Lees ook [hoeveel carbon je nodig hebt](/kennis/meer-carbon-hockeystick-beter).`,
    },
    {
      question: `In welke lengtes staan ${brand}-sticks in onze catalogus?`,
      answer: `${lengthParts.join('; ')}. Welke lengte bij jou past, zie je in de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel).`,
    },
    {
      question: `Waar kan ik ${brand}-sticks kopen?`,
      answer: shops.length
        ? `Bij partnerwinkels: ${dutchList(shops)}. Niet elke winkel verkoopt elke stick; op de pagina van elke stick zie je per winkel de prijs, gesorteerd op prijs inclusief verzending. De winkel is de verkoper. Wij krijgen een vergoeding als je via een link koopt; dat verandert de volgorde niet.`
        : `We kennen op dit moment geen partnerwinkel met actuele prijzen voor deze ${brand}-sticks. Vraag ernaar bij je hockeywinkel.`,
    },
  ];
}

/** Links at the bottom: advice, the series or the comparison tool, and the articles on bow, carbon and length. */
export function brandReadMore(e: BrandEvaluation): { href: string; label: string }[] {
  const { brand } = e.definition;
  const first = e.sticks[0];
  const last = e.sticks.at(-1);
  const links: { href: string; label: string }[] = [];
  if (e.counts.field > 0) links.push({ href: '/stickwijzer', label: 'Doe de stickwijzer voor een advies op jouw spel' });
  if (e.counts.indoor > 0) links.push({ href: '/zaalsticks', label: 'Zaalsticks: kies in drie vragen' });
  for (const series of indexableSeries().filter((s) => s.series.brand === brand)) {
    links.push({ href: seriesPath(series.series.slug), label: seriesTitle(series) });
  }
  if (first && last && first.slug !== last.slug) {
    links.push({ href: `/vergelijk?a=${first.slug}&b=${last.slug}`, label: `Zet twee ${brand}-sticks naast elkaar in de vergelijker` });
  }
  links.push(
    { href: '/kennis/low-bow-vs-mid-bow', label: 'Low bow of mid bow: welke kromming past bij jou?' },
    { href: '/kennis/meer-carbon-hockeystick-beter', label: 'Hoeveel carbon heeft je hockeystick nodig?' },
    { href: '/kennis/hockeystick-lengte-tabel', label: 'Hockeystick lengte tabel: welke maat stick past bij jouw lengte?' },
  );
  return links;
}
