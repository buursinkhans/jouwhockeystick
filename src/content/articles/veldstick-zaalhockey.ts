import { getIndoorProducts } from '@/catalog';
import type { Article } from '../types';
import { ZAAL_SOURCES } from '../zaal';
import { byPrice, stickListItem } from '../catalogLinks';

const buyableIndoor = getIndoorProducts()
  .filter((p) => !p.bolNotSold)
  .sort(byPrice);
const cheapest = buyableIndoor[0];

const priceSentence = cheapest
  ? `De goedkoopste zaalstick in onze catalogus die bij bol.com te koop is: ${stickListItem(cheapest)}. Controleer de actuele prijs en de leverbare maat bij de winkel.`
  : 'We hebben op dit moment geen zaalsticks in onze catalogus die bij bol.com te koop zijn.';

export const veldstickZaalhockey: Article = {
  slug: 'veldstick-zaalhockey',
  title: 'Kun je met een veldstick zaalhockeyen?',
  intro:
    'Ja, met een veldstick kun je zaalhockeyen. In de spelregels van de FIH gelden voor zaal- en veldsticks dezelfde maximale eisen, dus een aparte zaalstick is niet verplicht. Het spel is wel anders: in de zaal mag je de bal niet slaan. Een veldstick kan daarom een prima start zijn; een zaalstick is een keuze voor wie vaker zaalhockeyt. Vraag bij twijfel je club of er afspraken gelden.',
  sections: [
    {
      heading: 'Mag een veldstick in de zaal?',
      level: 2,
      body: [
        `Volgens de spelregels wel. In zowel het zaal- als het veldreglement van de FIH moet een stick door een ring van 51 mm passen, mag de kromming maximaal 25 mm zijn, en mag de stick niet zwaarder zijn dan 737 gram en niet langer dan 105 cm. [Bron: FIH Rules of Indoor Hockey](${ZAAL_SOURCES.indoorRules.url}) en [FIH Rules of Hockey](${ZAAL_SOURCES.fieldRules.url})`,
        'Een zaalstick is dus geen spelregeleis. Of er bij jouw club of competitie aanvullende afspraken gelden, kunnen we niet voor je nagaan. Vraag het daarom bij je club of trainer.',
      ],
    },
    {
      heading: 'Wat is anders aan het zaalspel?',
      level: 2,
      body: [
        `In de zaal mag je de bal niet slaan; je speelt hem met een push of een flick. De bal blijft laag: alleen bij een schot op doel mag hij bewust omhoog. [Bron: FIH Rules of Indoor Hockey](${ZAAL_SOURCES.indoorRules.url}) Het spel draait daardoor om aannemen, pushen en snelle acties in een kleine ruimte.`,
        'Dat verandert niet wat je met je stick *mag*, maar wel wat je ermee *doet*. Je veldstick kan dus mee; je speelstijl past zich aan. Meer over de verschillen lees je op de pagina [zaalsticks](/zaalsticks).',
      ],
    },
    {
      heading: 'Wanneer is een veldstick genoeg?',
      level: 2,
      body: [
        'Onze redactionele inschatting, geen meting:',
        {
          type: 'list',
          items: [
            '**Je speelt voor het eerst zaalhockey.** Het eerste seizoen met je veldstick kan een redelijke manier zijn om te ontdekken of het je bevalt.',
            '**Je speelt maar een paar wedstrijden of trainingen in de zaal.** Het zaalseizoen is kort; een tweede stick kost dan relatief veel voor weinig gebruik.',
            '**Je veldstick heeft al een rustig profiel.** Een mid bow maakt vlak pushen en aannemen voorspelbaar. Het verschil met een low bow lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
          ],
        },
      ],
    },
    {
      heading: 'Wanneer kan een zaalstick een logische stap zijn?',
      level: 2,
      body: [
        `Merken ontwerpen zaalsticks specifiek voor het zaalspel. Grays beschrijft zijn zaalmodellen bijvoorbeeld met een "Micro headshape for tight indoor spaces and quick skills". [Bron: Grays, collectie Indoor Hockey Sticks](${ZAAL_SOURCES.graysIndoor.url})`,
        'Een zaalstick kan een logische keuze zijn als je vaak in de zaal speelt of het zaalspel serieus neemt. Het is een voorkeur, geen noodzaak. Wat een zaalstick in jouw spel oplevert, kunnen we niet meten: wij testen sticks niet zelf.',
      ],
    },
    {
      heading: 'Waar let je op als je toch een zaalstick koopt?',
      level: 2,
      body: [
        'Gebruik hetzelfde lengteadvies als voor een veldstick. In de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel) zie je per lichaamslengte welke maat een logisch startpunt is. Koop bij een kind niet extra groot ‘op de groei’.',
        'Omdat je in de zaal niet slaat, weegt balcontrole doorgaans zwaarder dan maximale slagkracht. Een uitgebreide uitleg voor kinderen staat in [zaalstick voor kinderen](/kennis/zaalstick-voor-kinderen).',
        priceSentence,
      ],
    },
    {
      heading: 'Hulp bij je keuze',
      level: 2,
      body: [
        'Op de pagina [zaalsticks](/zaalsticks) maak je in drie vragen een eerste selectie uit onze zaalsticks. Voor persoonlijk advies over een veldstick gebruik je de [stickwijzer](/stickwijzer).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-11',
  updatedAt: '2026-10-11',
  sources: [
    { label: ZAAL_SOURCES.indoorRules.label, url: ZAAL_SOURCES.indoorRules.url },
    { label: ZAAL_SOURCES.fieldRules.label, url: ZAAL_SOURCES.fieldRules.url },
    { label: ZAAL_SOURCES.graysIndoor.label, url: ZAAL_SOURCES.graysIndoor.url },
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
    'Mag je met een veldstick zaalhockeyen? Volgens de FIH-spelregels gelden dezelfde stickeisen. Wanneer een zaalstick wel een logische keuze kan zijn.',
};
