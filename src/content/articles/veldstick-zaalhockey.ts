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
    'Ja, dat kan! Voor zaal- en veldsticks gelden dezelfde maximale eisen, dus een aparte zaalstick is niet verplicht. Het spel is wel anders: in de zaal mag je de bal niet slaan. Je veldstick is daarom een prima start, en een zaalstick is vooral iets voor wie vaker de zaal in gaat. Twijfel je? Vraag even bij je club of er afspraken gelden.',
  sections: [
    {
      heading: 'Mag een veldstick in de zaal?',
      level: 2,
      body: [
        'Ja. Voor de zaal en het veld gelden dezelfde maximale eisen: een stick moet door een ring van 51 mm passen, de kromming mag maximaal 25 mm zijn, en de stick mag niet zwaarder zijn dan 737 gram en niet langer dan 105 cm.',
        'Een zaalstick is dus geen spelregel. Of je club of competitie nog eigen afspraken heeft, kunnen wij niet voor je checken. Vraag het gewoon even bij je club of trainer.',
      ],
    },
    {
      heading: 'Wat is anders aan het zaalspel?',
      level: 2,
      body: [
        'In de zaal sla je de bal niet: je speelt hem met een push of een flick. En de bal blijft laag. Alleen bij een schot op doel mag hij bewust omhoog. Het spel draait dus om aannemen, pushen en snelle acties in een kleine ruimte.',
        'Dat verandert niet wat je met je stick *mag*, maar wel wat je ermee *doet*. Je veldstick kan dus gewoon mee; je speelstijl past zich aan. Meer over de verschillen lees je bij de [zaalsticks](/zaalsticks).',
      ],
    },
    {
      heading: 'Wanneer is je veldstick genoeg?',
      level: 2,
      body: [
        'Onze ervaring vertaald naar een paar vuistregels:',
        {
          type: 'list',
          items: [
            '**Je gaat voor het eerst de zaal in.** Een seizoen met je veldstick is een prima manier om te ontdekken of zaalhockey bij je past.',
            '**Je speelt maar een paar keer in de zaal.** Het zaalseizoen is kort, en een tweede stick kost dan veel voor weinig speeltijd.',
            '**Je veldstick heeft al een rustig profiel.** Met een mid bow gaan vlak pushen en aannemen vanzelfsprekend. Het verschil met een low bow lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
          ],
        },
      ],
    },
    {
      heading: 'Wanneer is een zaalstick een logische stap?',
      level: 2,
      body: [
        'Merken ontwerpen zaalsticks speciaal voor het spel binnen. Grays geeft zijn zaalsticks bijvoorbeeld een kleinere kop, gemaakt voor snelle acties in een kleine ruimte.',
        'Speel je vaak in de zaal, of neem je het zaalspel serieus? Dan kan een zaalstick een mooie stap zijn. Het blijft een voorkeur, geen must. Wij testen sticks niet zelf, dus wat een zaalstick in jouw spel oplevert, kunnen we niet voor je meten.',
      ],
    },
    {
      heading: 'Waar let je op als je toch een zaalstick koopt?',
      level: 2,
      body: [
        'Gebruik hetzelfde lengteadvies als voor een veldstick. In de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel) zie je per lichaamslengte welke maat een goed startpunt is. En koop voor een kind niet extra groot ‘op de groei’.',
        'Omdat je in de zaal niet slaat, telt balcontrole meestal meer dan slagkracht. Zoek je voor je kind? Dan staat alles op een rij in [zaalstick voor kinderen](/kennis/zaalstick-voor-kinderen).',
        priceSentence,
      ],
    },
    {
      heading: 'Hulp bij je keuze',
      level: 2,
      body: [
        'Bij de [zaalsticks](/zaalsticks) maak je in drie vragen een eerste selectie. Voor persoonlijk advies over een veldstick gebruik je de [stickwijzer](/stickwijzer).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-11',
  updatedAt: '2026-10-12',
  sources: [
    {
      label: ZAAL_SOURCES.indoorRules.label,
      url: ZAAL_SOURCES.indoorRules.url,
    },
    { label: ZAAL_SOURCES.fieldRules.label, url: ZAAL_SOURCES.fieldRules.url },
    {
      label: ZAAL_SOURCES.graysIndoor.label,
      url: ZAAL_SOURCES.graysIndoor.url,
    },
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
    'Mag je met een veldstick zaalhockeyen? Ja: voor zaal en veld gelden dezelfde stickeisen. Lees wanneer een zaalstick wel een logische keuze kan zijn.',
};
