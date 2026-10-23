import type { ExperienceLevel, Product } from '@/catalog/types';
import { formatEuro } from './catalogLinks';

/**
 * Copy for the /sticks page, the landing page for "veldhockeystick(s)"
 * (decision log 2026-10-23). Same layout as zaal.ts. Deliberately not about
 * "kiezen" or "kopen": /blog/hockeystick-kopen owns those searches
 * (decision log 2026-10-08). Numbers (prices, carbon) are computed from the
 * catalog on the page, never written here.
 */
export const VELD = {
  /** H1 on the page. */
  title: 'Veldhockeysticks vergelijken',
  /** <title> in search results. */
  seoTitle: 'Veldhockeysticks vergelijken: lengte, bow, carbon en niveau',
  metaDescription:
    'Alle veldhockeysticks uit onze catalogus naast elkaar: per stick lengte, bow, carbon en niveau met de bron erbij. Met een eerste keuze per niveau en antwoorden op veelgestelde vragen.',
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-23',
  updatedAt: '2026-10-23',
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
        'Dat hangt vooral af van je lichaamslengte. Voor volwassenen is 36,5 inch de gangbare maat; voor kinderen zie je per lichaamslengte de maat in de [lengtetabel](/kennis/hockeystick-lengte-tabel). Koop een kinderstick niet extra groot ‘op de groei’. De [stickwijzer](/stickwijzer) rekent de maat voor je uit.',
    },
    bow: {
      question: 'Welke bow past bij een veldhockeystick?',
      answer:
        'Een rustige kromming (mid bow of standaard) kan passen bij wie de basis nog leert en strak vlak wil passen. Een lage kromming (low bow) is gericht op liften, flicks en 3D-acties en is een logische richting voor spelers die daar al mee bezig zijn. Het verschil lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
    },
    carbon: {
      question: 'Hoeveel carbon heb je nodig in een veldhockeystick?',
      /** Range computed from the catalog on the page. */
      answer: (min: number, max: number) =>
        `Minder dan je misschien denkt. Carbon maakt een stick stijver: de bal gaat harder weg, maar aannemen wordt lastiger. Voor beginners kan weinig carbon goed passen; meer carbon is een logische richting voor ervaren spelers. In onze catalogus loopt het carbonpercentage van veldsticks van ${min}% tot ${max}%. Meer lees je in [meer carbon is niet altijd beter](/kennis/meer-carbon-hockeystick-beter).`,
    },
    price: {
      question: 'Wat kost een veldhockeystick?',
      /** Counts and prices computed from the catalog on the page. */
      answer: (count: number, min: string, max: string, perLevel: string) =>
        `In onze catalogus staan ${count} veldsticks met een richtprijs van ${min} tot ${max}. Per niveau: ${perLevel}. Dit zijn richtprijzen; de actuele prijs zie je bij de winkel.`,
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
 * The FAQ on /sticks, with the numbers computed from the field sticks the
 * page lists, so they never go stale (no prices or carbon in the copy).
 */
export function veldFaq(products: readonly Product[]): FaqItem[] {
  const { faq } = VELD;
  const items: FaqItem[] = [faq.length, faq.bow];
  const carbon = products
    .map((p) => p.carbonPercentage?.value)
    .filter((value): value is number => value !== undefined);
  if (carbon.length) {
    items.push({
      question: faq.carbon.question,
      answer: faq.carbon.answer(Math.min(...carbon), Math.max(...carbon)),
    });
  }
  const prices = products.map((p) => p.priceIndicativeEur.value);
  if (prices.length) {
    const perLevel = VELD.levels.groups
      .flatMap(({ level }) => {
        const own = products
          .filter((p) => p.experienceLevel.value === level)
          .map((p) => p.priceIndicativeEur.value);
        return own.length
          ? [
              `voor ${LEVEL_LABEL[level]} ${formatEuro(Math.min(...own))} tot ${formatEuro(Math.max(...own))}`,
            ]
          : [];
      })
      .join(', ');
    items.push({
      question: faq.price.question,
      answer: faq.price.answer(
        products.length,
        formatEuro(Math.min(...prices)),
        formatEuro(Math.max(...prices)),
        perLevel,
      ),
    });
  }
  items.push(faq.indoor);
  return items;
}
