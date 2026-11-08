import { isJuniorStick } from '@/catalog/similar';
import type { ExperienceLevel, Product } from '@/catalog/types';
import { MAX_DESCRIPTION_LENGTH } from '@/lib/site';
import { formatEuro } from './catalogLinks';

/**
 * Copy for the /sticks page, the landing page for "veldhockeystick(s)"
 * (decision log 2026-10-23). Same layout as zaal.ts. Deliberately not about
 * "kiezen" or "kopen": /blog/hockeystick-kopen owns those searches
 * (decision log 2026-10-08). Numbers (counts, prices) are computed from the
 * catalog on the page, never written here.
 */
export const VELD = {
  /** H1 on the page. */
  title: 'Veldhockeysticks vergelijken',
  /** <title> in search results. */
  seoTitle: 'Veldhockeysticks vergelijken: lengte, bow, carbon en niveau',
  /** Fallback when the counts are unknown; see veldMetaDescription. */
  metaDescription:
    'Alle veldhockeysticks uit onze catalogus naast elkaar: lengte, bow, carbon en niveau per stick, met de bron erbij. Plus een eerste keuze per niveau.',
  /** Meta description with the stick and brand counts from getCatalogStats. */
  metaDescriptionWithCounts: (sticks: number, brands: number) =>
    `Vergelijk ${sticks} veldhockeysticks van ${brands} merken op lengte, bow, carbon en niveau, met de bron bij elk gegeven. Plus een eerste keuze per niveau.`,
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-23',
  updatedAt: '2026-10-30',
  /** Answers the main question within the first 80 words. */
  intro:
    'Hier vind je alle veldhockeysticks uit onze catalogus, met per gegeven de bron. Een veldhockeystick vergelijk je op vier punten: de juiste lengte (zie de [lengtetabel](/kennis/hockeystick-lengte-tabel)), de kromming ([low bow of mid bow](/kennis/low-bow-vs-mid-bow)), het carbonpercentage ([meer carbon is niet altijd beter](/kennis/meer-carbon-hockeystick-beter)) en je niveau. Wil je advies dat bij jou past, doe dan de [stickwijzer](/stickwijzer). Waar je bij het kopen op let, lees je in [hockeystick kopen](/blog/hockeystick-kopen).',
  levels: {
    heading: 'Veldsticks per niveau',
    intro:
      'Per niveau een paar veldsticks om mee te beginnen, van verschillende merken en steeds met minstens één voor volwassenen. Het niveau komt van het merk of is onze inschatting; dat staat bij elke stick. Alle veldsticks staan verderop.',
    groups: [
      { level: 'beginner', heading: 'Voor beginners' },
      { level: 'gevorderd', heading: 'Voor gevorderde spelers' },
      { level: 'ervaren', heading: 'Voor ervaren spelers' },
    ] satisfies readonly { level: ExperienceLevel; heading: string }[],
    allLink: 'Bekijk alle veldsticks',
  },
  faq: {
    heading: 'Veelgestelde vragen over de veldhockeystick',
    length: {
      question: 'Welke lengte veldhockeystick heb je nodig?',
      answer:
        'Dat hangt vooral af van je lichaamslengte. In de [lengtetabel](/kennis/hockeystick-lengte-tabel) zie je per lichaamslengte welke maat past, voor kinderen en volwassenen. Koop een kinderstick niet extra groot ‘op de groei’. De [stickwijzer](/stickwijzer) rekent de maat voor je uit.',
    },
    bow: {
      question: 'Welke bow past bij een veldhockeystick?',
      answer:
        'Een rustige kromming (mid bow of standaard) kan passen bij wie de basis nog leert en strak vlak wil passen. Een lage kromming (low bow) is gericht op liften, flicks en 3D-acties en is een logische richting voor spelers die daar al mee bezig zijn. Het verschil lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
    },
    carbon: {
      question: 'Hoeveel carbon heb je nodig in een veldhockeystick?',
      /**
       * No catalog range: it ran from wooden sticks (0%) to 100% and said
       * little (decision log 2026-10-29). Same line as the carbon article.
       */
      answer:
        'Minder dan je misschien denkt, en een vaste norm is er niet. Meer carbon maakt een stick stijver en directer, maar ook minder vergevingsgezind als je de bal net niet goed raakt. Werk je nog aan je basis, dan is een stick met minder carbon vaak een fijn startpunt. Wil je een directer gevoel, dan is meer carbon een logische volgende stap. Ook de kromming, het gewicht en de balans bepalen hoe een stick voelt. Het percentage staat bij elke stick, met de bron erbij. Meer lees je in [meer carbon is niet altijd beter](/kennis/meer-carbon-hockeystick-beter).',
    },
    price: {
      question: 'Wat kost een veldhockeystick?',
      /** Counts and price ranges computed from the catalog on the page. */
      answer: (count: number, all: string, byAge: string, perLevel: string) =>
        `In onze catalogus staan ${count} veldsticks, juniorsticks en sticks voor volwassenen samen, met een richtprijs van ${all}. ${byAge}Per niveau, junior en volwassen samen: ${perLevel}. Dit zijn richtprijzen; de actuele prijs zie je bij de winkel.`,
    },
    indoor: {
      question: 'Wat is het verschil tussen een veldstick en een zaalstick?',
      answer:
        'Volgens de spelregels gelden voor beide dezelfde eisen; je mag met je veldstick ook in de zaal spelen. Merken maken zaalsticks wel voor het zaalspel, met pushen en balcontrole in een kleine ruimte. Lees [kun je met een veldstick zaalhockeyen?](/kennis/veldstick-zaalhockey) of bekijk de [zaalsticks](/zaalsticks).',
    },
  },
} as const;

export type FaqItem = { question: string; answer: string };

const LEVEL_LABEL: Record<ExperienceLevel, string> = {
  beginner: 'beginners',
  gevorderd: 'gevorderden',
  ervaren: 'ervaren spelers',
};

/**
 * The meta description with the live counts, so it never needs a hand edit
 * after a catalog change. Falls back to the plain text when a count is
 * missing or the text would be cut off in search results.
 */
export function veldMetaDescription(sticks: number, brands: number): string {
  const withCounts = VELD.metaDescriptionWithCounts(sticks, brands);
  return Number.isInteger(sticks) &&
    Number.isInteger(brands) &&
    sticks > 0 &&
    brands > 1 &&
    withCounts.length <= MAX_DESCRIPTION_LENGTH
    ? withCounts
    : VELD.metaDescription;
}

/** "€20 tot €409", or undefined for an empty list. */
function priceRange(products: readonly Product[]): string | undefined {
  const prices = products.map((p) => p.priceIndicativeEur.value);
  return prices.length
    ? `${formatEuro(Math.min(...prices))} tot ${formatEuro(Math.max(...prices))}`
    : undefined;
}

/**
 * The FAQ on /sticks, with the numbers computed from the catalog so they
 * never go stale (no prices in the copy). Prices and the count come from all
 * field sticks the page lists, junior sticks included; the answer says so and
 * gives the junior and adult ranges apart.
 */
export function veldFaq(products: readonly Product[]): FaqItem[] {
  const { faq } = VELD;
  const items: FaqItem[] = [
    faq.length,
    faq.bow,
    { question: faq.carbon.question, answer: faq.carbon.answer },
  ];
  const all = priceRange(products);
  if (all) {
    const junior = priceRange(products.filter(isJuniorStick));
    const adult = priceRange(products.filter((p) => !isJuniorStick(p)));
    const byAge = [
      junior && `juniorsticks ${junior}`,
      adult && `sticks voor volwassenen ${adult}`,
    ]
      .filter(Boolean)
      .join(', ');
    const perLevel = VELD.levels.groups
      .flatMap(({ level }) => {
        const range = priceRange(
          products.filter((p) => p.experienceLevel.value === level),
        );
        return range ? [`voor ${LEVEL_LABEL[level]} ${range}`] : [];
      })
      .join(', ');
    items.push({
      question: faq.price.question,
      answer: faq.price.answer(
        products.length,
        all,
        junior && adult ? `Apart: ${byAge}. ` : '',
        perLevel,
      ),
    });
  }
  items.push(faq.indoor);
  return items;
}
