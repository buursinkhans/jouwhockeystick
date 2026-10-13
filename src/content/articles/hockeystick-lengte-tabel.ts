import { LENGTH_GUIDE, alsoFitsInch } from '@/advice-engine/sizeAdvice';
import type { Article } from '../types';
import { ZAAL_SOURCES } from '../zaal';

const INTERSPORT_STICKS = 'https://intersport.nl/collections/hockeysticks';
const INTERSPORT_GUIDE =
  'https://intersport.nl/blogs/hockey/waar-moet-je-op-letten-bij-de-aanschaf-van-een-hockeystick';

const CM_PER_INCH = 2.54;

function formatInch(inch: number): string {
  return `${String(inch).replace('.', ',')} inch`;
}

function formatCm(inch: number): string {
  return `ca. ${Math.round(inch * CM_PER_INCH)} cm`;
}

/**
 * Generated from the same LENGTH_GUIDE the stickwijzer uses, so the table and
 * the advice can never disagree.
 */
const LENGTH_ROWS = LENGTH_GUIDE.map((band, index) => {
  const isLast = index === LENGTH_GUIDE.length - 1;
  const height = isLast
    ? `${band.minCm} cm en langer`
    : `${band.minCm}–${band.maxCm} cm`;
  const also = alsoFitsInch(band);
  return [
    height,
    band.sizes.map(formatInch).join(' of '),
    also.length > 0 ? also.map(formatInch).join(' of ') : '–',
    band.sizes.map(formatCm).join(' / '),
  ];
});

export const hockeystickLengteTabel: Article = {
  slug: 'hockeystick-lengte-tabel',
  title: 'Hockeystick lengte tabel: welke maat stick past bij jouw lengte?',
  intro:
    'Welke lengte stick heb je nodig? Een handig richtsnoer: kinderen tot ongeveer 1,10 meter spelen meestal met 22 tot 24 inch, kinderen rond 1,40 meter met 32 inch, en vanaf zo’n 1,63 meter is 36,5 inch de gangbare maat. Ben je 1,85 meter of langer, dan past 37,5 of 38,5 inch vaak beter. In de tabel hieronder vind je jouw maat in een paar seconden. Twijfel je bij een kind? Kies dan niet de langere om in te groeien.',
  sections: [
    {
      heading: 'De lengtetabel',
      level: 2,
      body: [
        {
          type: 'table',
          columns: [
            'Lichaamslengte',
            'Sticklengte',
            'Kan ook passen',
            'Sticklengte in cm',
          ],
          rows: LENGTH_ROWS,
        },
        'Deze tabel is onze eigen richtlijn, geen officiële norm. En eerlijk is eerlijk: de maattabellen van merken lopen flink uiteen. Bij kinderen scheelt het al snel 2 inch, en de ene tabel adviseert een maat langer dan de andere. Daarom staat er per rij ook een maat die kan passen. Bij kinderen is dat altijd de kortere maat, bij volwassenen de maat erboven of eronder.',
        'Kijk bij een specifiek model ook even naar de maattabel van het merk. De [stickwijzer](/stickwijzer) werkt met precies deze tabel en kijkt daarnaast naar je huidige stick.',
      ],
    },
    {
      heading: 'Zo gebruik je de tabel',
      level: 2,
      body: [
        'Meet de lichaamslengte zonder schoenen en zoek de rij die erbij hoort. Doe daarna de houdingscheck: kan de speler ontspannen bewegen, dribbelen en de stick dicht bij het lichaam houden? Dan zit je goed. Een te lange stick maakt balcontrole en het leren van de techniek een stuk lastiger.',
      ],
    },
    {
      heading: 'Twijfel tussen twee maten',
      level: 3,
      body: [
        'Zit de lichaamslengte precies op een grens, of staan er twee maten in de tabel? Dan kunnen ze allebei passen, en de stickwijzer noemt ze dan ook allebei. Laat de houdingscheck beslissen. Blijf je twijfelen, kies dan de kortere: een iets kortere stick is goed te hanteren, een te lange werkt juist tegen bij aannemen en dribbelen.',
      ],
    },
    {
      heading: 'Koop een kinderstick niet op de groei',
      level: 3,
      body: [
        'Een maat groter, zodat de stick langer meegaat? Begrijpelijk, maar je kind moet er nú mee kunnen oefenen. Is de juiste maat niet te krijgen, dan is één maatje korter prima. Een maat langer raden we af. Meer tips vind je bij [hockeysticks voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).',
      ],
    },
    {
      heading: 'Volwassenen: 36,5 inch of langer?',
      level: 2,
      body: [
        'Voor volwassenen is 36,5 inch de meest gekozen lengte. Ben je 1,85 meter of langer, dan is 37,5 inch een logische richting, en vanaf zo’n 1,93 meter 38,5 inch. Merken leggen die grens net verschillend, dus zit je ertussenin, probeer dan beide. Langer is niet vanzelf beter: je hebt meer bereik, maar balcontrole dicht bij je lichaam wordt lastiger. Kies dus vooral wat prettig voelt.',
        'Er is ook een grens: een stick mag volgens de spelregels niet langer zijn dan 105 cm, op het veld én in de zaal.',
      ],
    },
    {
      heading: 'Geldt dezelfde lengte in de zaal?',
      level: 2,
      body: [
        'Ja, als startpunt wel. Onze [zaalkeuze](/zaalsticks) gebruikt voor kinderen dezelfde tabel. Volwassen zaalsticks vind je meestal in 36,5 en 37,5 inch.',
      ],
    },
    {
      heading: 'Liever een persoonlijk advies?',
      level: 2,
      body: [
        'Vul in de [stickwijzer](/stickwijzer) je lichaamslengte, ervaring en wensen in. Je krijgt dan niet alleen een maat, maar ook sticks die je in die maat kunt krijgen, met de redenen erbij. Wil je eerst meer weten over de rest van de keuze? Lees dan [hockeystick kopen: zo kies je een stick die bij je past](/blog/hockeystick-kopen).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-08',
  updatedAt: '2026-10-13',
  sources: [
    {
      label:
        'Intersport — Waar moet je op letten bij de aanschaf van een hockeystick',
      url: INTERSPORT_GUIDE,
    },
    {
      label: 'Intersport — Hockeysticks (assortiment en lengtes)',
      url: INTERSPORT_STICKS,
    },
    {
      label: 'Grays — maattabel hockeysticks (lichaamslengte en sticklengte)',
    },
    { label: ZAAL_SOURCES.fieldRules.label, url: ZAAL_SOURCES.fieldRules.url },
    {
      label:
        'Lengtetabel: redactionele richtlijn van jouwhockeystick.nl, dezelfde als in de stickwijzer — geen officiële norm',
    },
  ],
  metaDescription:
    'Hockeystick lengte tabel: zie per lichaamslengte welke sticklengte in inch past, voor kinderen en volwassenen. Plus tips bij twijfel tussen twee maten.',
};
