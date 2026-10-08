import { LENGTH_GUIDE } from '@/advice-engine/sizeAdvice';
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
  return [
    height,
    band.sizes.map(formatInch).join(' of '),
    band.sizes.map(formatCm).join(' / '),
  ];
});

export const hockeystickLengteTabel: Article = {
  slug: 'hockeystick-lengte-tabel',
  title: 'Hockeystick lengte tabel: welke maat stick past bij jouw lengte?',
  intro:
    'Welke lengte hockeystick heb je nodig? Als richtlijn: kinderen tot ongeveer 1,10 meter spelen meestal met 22 tot 24 inch, kinderen rond 1,40 meter met 32 inch, en vanaf ongeveer 1,63 meter is 36,5 inch de gangbare maat. In de tabel hieronder zie je per lichaamslengte welke sticklengte een logisch startpunt is. Twijfel je tussen twee maten? Kies dan niet de langere om in te groeien.',
  sections: [
    {
      heading: 'Lengtetabel: lichaamslengte en sticklengte',
      level: 2,
      body: [
        {
          type: 'table',
          columns: ['Lichaamslengte', 'Sticklengte', 'Sticklengte in cm'],
          rows: LENGTH_ROWS,
        },
        'Deze tabel is een redactionele richtlijn, geen officiële norm van een bond of fabrikant. Fabrikanten hanteren soms net andere grenzen; gebruik bij een specifiek model ook de maattabel van de aanbieder. De [stickwijzer](/stickwijzer) gebruikt precies deze tabel en houdt daarnaast rekening met je huidige stick.',
      ],
    },
    {
      heading: 'Zo gebruik je de tabel',
      level: 2,
      body: [
        'Meet de lichaamslengte zonder schoenen en zoek de rij die erbij hoort. Controleer daarna in een normale hockeyhouding: kan de speler ontspannen bewegen, dribbelen en de stick dicht bij het lichaam houden? Een stick die te lang is, maakt balcontrole en het leren van de techniek lastiger. [Bron: Intersport — hockeystick kopen](' +
          INTERSPORT_GUIDE +
          ')',
      ],
    },
    {
      heading: 'Twijfel tussen twee maten',
      level: 3,
      body: [
        'Valt de lichaamslengte precies op een grens, of staan er in de tabel twee maten, dan kunnen beide passen. De stickwijzer noemt dan ook beide. Laat de houdingscheck hierboven de doorslag geven. Blijf je twijfelen, kies dan liever de kortere maat: een iets kortere stick is goed te hanteren, een te lange stick werkt juist tegen bij aannemen en dribbelen.',
      ],
    },
    {
      heading: 'Koop een kinderstick niet op de groei',
      level: 3,
      body: [
        'Een maat groter kopen zodat de stick langer meegaat, lijkt voordelig. Toch raden we het af: een kind moet nu met de stick kunnen oefenen. Is de geadviseerde maat niet te krijgen, dan is één maat korter een redelijk alternatief, en nooit een maat langer. Meer tips lees je in [hockeysticks voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).',
      ],
    },
    {
      heading: 'Volwassenen: 36,5 inch of langer?',
      level: 2,
      body: [
        'Voor volwassenen is 36,5 inch de meest gebruikte lengte. Er zijn ook sticks van 37,5 en 38,5 inch, vooral voor lange spelers. Langer is niet automatisch beter: een langere stick geeft meer bereik, maar vraagt ook meer bij balcontrole dicht bij het lichaam. Vergelijk daarom op hanteerbaarheid en persoonlijke voorkeur. [Bron: Intersport — hockeysticks](' +
          INTERSPORT_STICKS +
          ')',
        'De spelregels stellen een grens: een stick mag volgens de FIH niet langer zijn dan 105 cm, zowel op het veld als in de zaal. [Bron: FIH Rules of Hockey](' +
          ZAAL_SOURCES.fieldRules.url +
          ')',
      ],
    },
    {
      heading: 'Geldt dezelfde lengte in de zaal?',
      level: 2,
      body: [
        'Ja, als uitgangspunt wel. De [zaalkeuze](/zaalsticks) op deze site gebruikt voor kinderen dezelfde tabel. Volwassen zaalsticks zijn meestal te krijgen in 36,5 en 37,5 inch.',
      ],
    },
    {
      heading: 'Liever een persoonlijk advies?',
      level: 2,
      body: [
        'Vul in de [stickwijzer](/stickwijzer) je lichaamslengte, ervaring en speelwensen in. Je krijgt dan niet alleen een maat, maar ook sticks die in die maat te krijgen zijn, met de redenen erbij. Wil je eerst meer weten over de rest van de keuze? Lees dan [hockeystick kopen: zo kies je een stick die bij je past](/blog/hockeystick-kopen).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-08',
  updatedAt: '2026-10-08',
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
    { label: ZAAL_SOURCES.fieldRules.label, url: ZAAL_SOURCES.fieldRules.url },
    {
      label:
        'Lengtetabel: redactionele richtlijn van jouwhockeystick.nl, dezelfde als in de stickwijzer — geen officiële norm',
    },
  ],
  metaDescription:
    'Hockeystick lengte tabel: zie per lichaamslengte welke sticklengte in inch past, voor kinderen en volwassenen. Plus tips bij twijfel tussen twee maten.',
};
