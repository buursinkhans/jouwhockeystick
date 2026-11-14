import { DIRECT_MIN_CARBON, SOFT_MAX_CARBON } from '@/advice-engine/carbon';
import { isJuniorStick } from '@/catalog/similar';
import type { ExperienceLevel, Product } from '@/catalog/types';
import { MAX_DESCRIPTION_LENGTH } from '@/lib/site';
import { formatEuro } from './catalogLinks';

/**
 * Copy for the /sticks page, the landing page for "veldhockeysticks" and
 * "hockeysticks vergelijken" (decision log 2026-10-23 and 2026-11-14). Same
 * layout as zaal.ts. Deliberately not about "kiezen" or "kopen": "welke
 * hockeystick kopen" belongs to /kennis/hoe-kies-je-de-juiste-hockeystick
 * (owner's keyword table, 2026-11-14). Numbers (counts, prices) are computed
 * from the catalog on the page, never written here.
 */
export const VELD = {
  /** H1 on the page. */
  title: 'Veldhockeysticks vergelijken',
  /** <title> in search results. */
  seoTitle: 'Veldhockeysticks vergelijken: alle veldsticks naast elkaar',
  /** Fallback when the counts are unknown; see veldMetaDescription. */
  metaDescription:
    'Vergelijk veldhockeysticks op lengte, bow, carbon en niveau, voor junior en senior, met de bron bij elk gegeven en winkelprijzen van partnerwinkels.',
  /** Meta description with the stick and brand counts from getCatalogStats. */
  metaDescriptionWithCounts: (sticks: number, brands: number) =>
    `Vergelijk ${sticks} veldhockeysticks van ${brands} merken op lengte, bow, carbon en niveau, voor junior en senior, met winkelprijzen van partnerwinkels.`,
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-23',
  updatedAt: '2026-11-14',
  /** Answers the main question within the first 80 words. */
  intro:
    'Alle veldhockeysticks uit onze catalogus, voor junioren en volwassenen. Je vergelijkt ze op lengte, kromming (bow), carbon en niveau, en bij elk gegeven staat de bron. Met de filters zie je alleen veldsticks in jouw maat en budget. Twijfel je wat bij je past? De [stickwijzer](/stickwijzer) kiest mee, of lees eerst [welke hockeystick je koopt](/kennis/hoe-kies-je-de-juiste-hockeystick).',
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
       * little (decision log 2026-10-29). Since 2026-11-11 it gives the
       * engine's rule of thumb (SOFT_MAX_CARBON, DIRECT_MIN_CARBON), like
       * the carbon article.
       */
      answer: `Voor beginners is 0 tot ${SOFT_MAX_CARBON}% carbon meestal genoeg, en veel clubhockeyers zitten goed rond de 50%. Een stick met ${DIRECT_MIN_CARBON}% of meer is stijf en direct, en past vooral bij wie de bal al zuiver aanneemt en slaat. Een vaste norm is er niet: merken noemen voor hetzelfde niveau verschillende percentages. Ook de kromming, het gewicht en de balans bepalen hoe een stick voelt. Het percentage staat bij elke stick, met de bron erbij. Meer lees je in [hoeveel carbon heeft je hockeystick nodig?](/kennis/meer-carbon-hockeystick-beter)`,
    },
    price: {
      question: 'Wat kost een veldhockeystick?',
      /** Counts and price ranges computed from the catalog on the page. */
      answer: (count: number, all: string, byAge: string, perLevel: string) =>
        `In onze catalogus staan ${count} veldsticks, juniorsticks en sticks voor volwassenen samen, met een richtprijs van ${all}. ${byAge}Per niveau, junior en volwassen samen: ${perLevel}. Dit zijn richtprijzen; de actuele prijs zie je bij de winkel.`,
    },
    fit: {
      question: 'Hoe vind je een veldhockeystick die bij je past?',
      answer:
        'Filter eerst op niveau en op je lengte (die vind je in de [lengtetabel](/kennis/hockeystick-lengte-tabel)), en daarna op budget en kromming. Leg dan sticks van hetzelfde niveau naast elkaar. Liever hulp? De [stickwijzer](/stickwijzer) vraagt naar je niveau, speelstijl en budget en geeft maximaal drie sticks, met de redenen erbij. Hoe je in drie stappen kiest, lees je in [welke hockeystick kopen?](/kennis/hoe-kies-je-de-juiste-hockeystick)',
    },
    prices: {
      question: 'Waar komen de winkelprijzen vandaan?',
      answer:
        `Uit de productfeeds van onze partnerwinkels: bol.com, PassaHockey, Plutosport, HockeyCity en Daka. We lezen ze elke week en zetten de datum erbij; bovenaan deze pagina zie je wanneer. Prijzen kunnen bij de winkel intussen veranderd zijn, dus de prijs op de winkelsite geldt. Is een prijs ouder dan 14 dagen, dan tonen we hem niet meer. Heeft een stick geen actuele winkelprijs, dan zie je de richtprijs, met bron en datum. De knoppen naar de winkels zijn partnerlinks: koop je via zo'n knop, dan krijgen wij een kleine vergoeding van de winkel. Die vergoeding bepaalt niet welke sticks hier staan of in welke volgorde, en sticks die geen partnerwinkel verkoopt, staan er ook gewoon tussen.`,
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
    faq.fit,
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
  items.push(faq.prices, faq.indoor);
  return items;
}
