import { getIndoorProducts } from '@/catalog';
import { BOW_LABELS, EXPERIENCE_LABELS } from '@/catalog/labels';
import { isJuniorStick } from '@/catalog/similar';
import type { Product } from '@/catalog/types';
import { LENGTH_GUIDE } from '@/advice-engine/sizeAdvice';
import type { Article } from '../types';
import { ZAAL_SOURCES } from '../zaal';
import { byPrice, formatEuro, stickListItem } from '../catalogLinks';

const juniorIndoorSticks = getIndoorProducts().filter(isJuniorStick).sort(byPrice);
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
    : LENGTH_GUIDE.find((band) => band.sizes.some((size) => size >= shortestLength))
        ?.minCm;

const inch = (value: number) => `${String(value).replace('.', ',')} inch`;

function juniorListItem(product: Product): string {
  const details = [
    `niveau ${EXPERIENCE_LABELS[product.experienceLevel.value].toLowerCase()}`,
    product.bowProfile ? BOW_LABELS[product.bowProfile.value].toLowerCase() : null,
  ].filter(Boolean);
  const availability = product.bolNotSold ? ' — niet verkrijgbaar bij bol.com' : '';
  return `${stickListItem(product)} (${details.join(', ')})${availability}`;
}

const lengthCoverage =
  shortestLength !== undefined && longestLength !== undefined && minHeightCm !== undefined
    ? `De juniorzaalsticks in onze catalogus zijn er van ${inch(shortestLength)} tot ${inch(longestLength)}. Volgens onze lengtetabel past dat bij kinderen vanaf ongeveer ${minHeightCm} cm.`
    : 'We hebben op dit moment geen juniorzaalsticks in onze catalogus.';

export const zaalstickVoorKinderen: Article = {
  slug: 'zaalstick-voor-kinderen',
  title: 'Zaalstick voor kinderen: waar let je op?',
  intro:
    'Een zaalstick voor een kind kies je in de eerste plaats op lengte: dezelfde maat als op het veld, niet groter. Daarna weegt balcontrole zwaarder dan slagkracht, omdat slaan in de zaal niet mag. Een aparte zaalstick is volgens de spelregels niet verplicht; voor zaal- en veldsticks gelden dezelfde maximale eisen. Omdat het zaalseizoen kort is, is een eenvoudige en betaalbare stick vaak een logische keuze.',
  sections: [
    {
      heading: 'Heeft een kind een aparte zaalstick nodig?',
      level: 2,
      body: [
        `Nee, volgens de spelregels niet. In zowel het zaal- als het veldreglement van de FIH moet een stick door een ring van 51 mm passen, mag de kromming maximaal 25 mm zijn, en mag de stick niet zwaarder zijn dan 737 gram en niet langer dan 105 cm. [Bron: FIH Rules of Indoor Hockey](${ZAAL_SOURCES.indoorRules.url})`,
        'Een zaalstick is dus een keuze, geen eis. Merken ontwerpen zaalsticks wel voor het zaalspel. Speelt je kind voor het eerst zaalhockey, dan kan het eerste seizoen met de veldstick een redelijke manier zijn om te ontdekken of het bevalt. Dat is onze redactionele inschatting. Vraag bij twijfel bij je club of er voor de jeugd aanvullende afspraken gelden.',
      ],
    },
    {
      heading: 'Wat is er anders in de zaal?',
      level: 2,
      body: [
        `In de zaal mag je de bal niet slaan; je speelt hem met een push of een flick. De bal blijft laag: alleen bij een schot op doel mag hij bewust omhoog. [Bron: FIH Rules of Indoor Hockey](${ZAAL_SOURCES.indoorRules.url}) Het spel draait daardoor om aannemen, pushen en snelle acties in een kleine ruimte. Meer over de verschillen lees je op de pagina [zaalsticks](/zaalsticks).`,
      ],
    },
    {
      heading: 'De juiste lengte',
      level: 2,
      body: [
        'Voor een zaalstick gebruik je hetzelfde lengteadvies als voor een veldstick. In de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel) zie je per lichaamslengte welke maat een logisch startpunt is.',
        'Koop niet extra groot ‘op de groei’: een te lange stick maakt balcontrole lastiger, en juist die is in de zaal belangrijk. Is de juiste maat niet te krijgen, dan is één maat korter een redelijk alternatief. Een maat langer raden we af.',
      ],
    },
    {
      heading: 'Waar let je verder op?',
      level: 2,
      body: [
        'Onze redactionele vertaling van het zaalspel naar een keuze, geen meting:',
        {
          type: 'list',
          items: [
            '**Controle boven slagkracht.** Omdat slaan niet mag, levert een stijve, krachtige stick in de zaal weinig op. Een soepele stick met weinig of geen carbon is vergevingsgezinder bij het aannemen.',
            '**Een rustig profiel.** Een mid bow maakt vlak pushen en aannemen voorspelbaar. Een low bow is gericht op flicks en 3D-acties en vraagt meer techniek. Het verschil lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
            '**Een redelijke prijs.** Het zaalseizoen duurt een paar maanden en kinderen groeien snel. Geef pas meer uit als je kunt uitleggen welke eigenschap je daarmee koopt.',
          ],
        },
      ],
    },
    {
      heading: 'Wat kost een zaalstick voor een kind?',
      level: 2,
      body: [
        `De juniorzaalsticks in onze catalogus die bij bol.com te koop zijn, hebben een richtprijs ${priceRange}. Controleer de actuele prijs en de leverbare maat bij de winkel.`,
      ],
    },
    {
      heading: 'Juniorzaalsticks in onze catalogus',
      level: 2,
      body: [
        lengthCoverage,
        'Gesorteerd op richtprijs. Bij elke stick staat het niveau en het profiel volgens de bron op de productpagina.',
        { type: 'list', items: juniorIndoorSticks.map(juniorListItem) },
        {
          type: 'note',
          text: 'Ons aanbod juniorzaalsticks is nog klein. Is je kind kleiner dan de maten hierboven, dan is de veldstick in de juiste lengte voorlopig de logische keuze voor de zaal.',
        },
      ],
    },
    {
      heading: 'Snel een selectie of persoonlijk advies',
      level: 2,
      body: [
        'Op de pagina [zaalsticks](/zaalsticks) maak je in drie vragen een selectie: voor wie, de lengte van je kind en je budget. Speelt je kind ook op het veld, dan geeft de [stickwijzer](/stickwijzer) persoonlijk advies voor een veldstick. Over een eerste veldstick lees je meer in [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-09',
  updatedAt: '2026-10-09',
  sources: [
    { label: ZAAL_SOURCES.indoorRules.label, url: ZAAL_SOURCES.indoorRules.url },
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
