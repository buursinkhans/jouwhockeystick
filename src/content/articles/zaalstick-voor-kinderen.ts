import { getIndoorProducts } from '@/catalog';
import { BOW_LABELS, EXPERIENCE_LABELS } from '@/catalog/labels';
import { isJuniorStick } from '@/catalog/similar';
import type { Product } from '@/catalog/types';
import { LENGTH_GUIDE } from '@/advice-engine/sizeAdvice';
import type { Article } from '../types';
import { ZAAL_SOURCES } from '../zaal';
import { byPrice, formatEuro, stickListItem } from '../catalogLinks';

const juniorIndoorSticks = getIndoorProducts()
  .filter(isJuniorStick)
  .sort(byPrice);
const buyableAtBol = juniorIndoorSticks.filter((p) => !p.bolNotSold);

const prices = buyableAtBol.map((p) => p.priceIndicativeEur.value);
const priceRange =
  prices.length > 0
    ? `tussen ${formatEuro(Math.min(...prices))} en ${formatEuro(Math.max(...prices))}`
    : 'nog niet bekend';

const lengths = juniorIndoorSticks.flatMap((p) => p.lengthsInches.value);
const shortestLength = lengths.length > 0 ? Math.min(...lengths) : undefined;
const longestLength = lengths.length > 0 ? Math.max(...lengths) : undefined;
/** Smallest body height our length table links to the shortest junior indoor stick. */
const minHeightCm =
  shortestLength === undefined
    ? undefined
    : LENGTH_GUIDE.find((band) =>
        band.sizes.some((size) => size >= shortestLength),
      )?.minCm;

const inch = (value: number) => `${String(value).replace('.', ',')} inch`;

function juniorListItem(product: Product): string {
  const details = [
    `niveau ${EXPERIENCE_LABELS[product.experienceLevel.value].toLowerCase()}`,
    product.bowProfile
      ? BOW_LABELS[product.bowProfile.value].toLowerCase()
      : null,
  ].filter(Boolean);
  const availability = product.bolNotSold
    ? ' — niet verkrijgbaar bij bol.com'
    : '';
  return `${stickListItem(product)} (${details.join(', ')})${availability}`;
}

const lengthCoverage =
  shortestLength !== undefined &&
  longestLength !== undefined &&
  minHeightCm !== undefined
    ? `De juniorzaalsticks in onze catalogus zijn er van ${inch(shortestLength)} tot ${inch(longestLength)}. Volgens onze lengtetabel past dat bij kinderen vanaf ongeveer ${minHeightCm} cm.`
    : 'We hebben op dit moment geen juniorzaalsticks in onze catalogus.';

export const zaalstickVoorKinderen: Article = {
  slug: 'zaalstick-voor-kinderen',
  title: 'Zaalstick voor kinderen: waar let je op?',
  intro:
    'Op naar de zaal! Een zaalstick voor je kind kies je eerst op lengte: dezelfde maat als op het veld, niet groter. Daarna telt balcontrole meer dan slagkracht, want slaan mag in de zaal niet. Goed om te weten: een aparte zaalstick is niet verplicht, want voor zaal- en veldsticks gelden dezelfde regels. En omdat het zaalseizoen kort is, is een eenvoudige, betaalbare stick vaak een slimme keuze.',
  sections: [
    {
      heading: 'Heeft je kind een aparte zaalstick nodig?',
      level: 2,
      body: [
        'Nee, dat hoeft niet. Voor zaal én veld gelden dezelfde maximale eisen: de stick moet door een ring van 51 mm passen, de kromming mag maximaal 25 mm zijn, en de stick mag niet zwaarder zijn dan 737 gram en niet langer dan 105 cm.',
        'Een zaalstick is dus een keuze, geen must. Merken maken zaalsticks wel speciaal voor het spel binnen. Gaat je kind voor het eerst de zaal in? Dan kan een eerste seizoen met de veldstick een prima manier zijn om te ontdekken of het bevalt. Twijfel je? Vraag even bij je club of er voor de jeugd extra afspraken zijn.',
      ],
    },
    {
      heading: 'Wat is er anders in de zaal?',
      level: 2,
      body: [
        'In de zaal sla je de bal niet: je speelt hem met een push of een flick. En de bal blijft laag. Alleen bij een schot op doel mag hij bewust omhoog. Het spel draait dus om aannemen, pushen en snelle acties in een kleine ruimte. Meer over de verschillen lees je bij de [zaalsticks](/zaalsticks).',
      ],
    },
    {
      heading: 'De juiste lengte',
      level: 2,
      body: [
        'Voor een zaalstick gebruik je hetzelfde lengteadvies als voor een veldstick. In de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel) zie je per lichaamslengte welke maat een goed startpunt is.',
        'Koop niet extra groot ‘op de groei’: met een te lange stick wordt balcontrole lastiger, en juist die heb je in de zaal hard nodig. Is de juiste maat niet te krijgen, dan is één maatje korter prima. Een maat langer raden we af.',
      ],
    },
    {
      heading: 'Waar let je verder op?',
      level: 2,
      body: [
        'Onze tips, vertaald van het zaalspel naar een keuze:',
        {
          type: 'list',
          items: [
            '**Controle boven slagkracht.** Slaan mag niet, dus een stijve, krachtige stick levert in de zaal weinig op. Een soepele stick met weinig of geen carbon vergeeft het juist als de aanname net niet lukt.',
            '**Een rustig profiel.** Met een mid bow gaan vlak pushen en aannemen vanzelfsprekender. Een low bow is gemaakt voor flicks en 3D-acties en vraagt meer techniek. Het verschil lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
            '**Een vriendelijke prijs.** Het zaalseizoen duurt een paar maanden en kinderen groeien hard. Geef pas meer uit als je weet wat je daarvoor terugkrijgt.',
          ],
        },
      ],
    },
    {
      heading: 'Wat kost een zaalstick voor een kind?',
      level: 2,
      body: [
        `De juniorzaalsticks in onze catalogus die bij bol.com te koop zijn, hebben een richtprijs ${priceRange}. De actuele prijs en de leverbare maten zie je bij de winkel.`,
      ],
    },
    {
      heading: 'Juniorzaalsticks in onze catalogus',
      level: 2,
      body: [
        lengthCoverage,
        'Op volgorde van richtprijs, met bij elke stick het niveau en het profiel.',
        { type: 'list', items: juniorIndoorSticks.map(juniorListItem) },
        {
          type: 'note',
          text: 'Is je kind kleiner dan de maten hierboven? Dan is de veldstick in de juiste lengte voorlopig de logische keuze, ook voor de zaal.',
        },
      ],
    },
    {
      heading: 'Snel een selectie of persoonlijk advies',
      level: 2,
      body: [
        'Bij de [zaalsticks](/zaalsticks) maak je in drie vragen een selectie: voor wie, de lengte van je kind en je budget. Speelt je kind ook op het veld? Dan helpt de [stickwijzer](/stickwijzer) je aan persoonlijk advies voor een veldstick. Meer over een eerste veldstick lees je in [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-09',
  updatedAt: '2026-10-12',
  sources: [
    {
      label: ZAAL_SOURCES.indoorRules.label,
      url: ZAAL_SOURCES.indoorRules.url,
    },
    { label: ZAAL_SOURCES.fieldRules.label, url: ZAAL_SOURCES.fieldRules.url },
    {
      label:
        'Productgegevens en richtprijzen: de productpagina’s op deze site, met bron per gegeven',
    },
    {
      label:
        'Redactionele uitgangspunten jouwhockeystick.nl — geen eigen testresultaten of prestatiegaranties',
    },
  ],
  metaDescription:
    'Zaalstick voor je kind? Kies op lengte, controle en prijs. Is een aparte zaalstick nodig? Met de spelregels en juniorzaalsticks uit onze catalogus.',
};
