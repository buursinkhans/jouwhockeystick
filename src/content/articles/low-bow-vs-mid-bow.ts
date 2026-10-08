import { getFieldProducts } from '@/catalog';
import { isJuniorStick } from '@/catalog/similar';
import type { BowProfile } from '@/catalog/types';
import type { Article } from '../types';
import { byPrice, stickListItem } from '../catalogLinks';
import { ZAAL_SOURCES } from '../zaal';

const INTERSPORT_GUIDE =
  'https://intersport.nl/blogs/hockey/waar-moet-je-op-letten-bij-de-aanschaf-van-een-hockeystick';
const PASSAHOCKEY_INDOOR = 'https://www.hockeydirect.nl/zaalhockeyadvies';

function adultFieldSticksWith(bow: BowProfile): string[] {
  return getFieldProducts()
    .filter(
      (product) => product.bowProfile?.value === bow && !isJuniorStick(product),
    )
    .sort(byPrice)
    .map(stickListItem);
}

export const lowBowVsMidBow: Article = {
  slug: 'low-bow-vs-mid-bow',
  title: 'Low bow of mid bow: welke kromming past bij jou?',
  intro:
    'Een mid bow heeft een rustige kromming die ongeveer halverwege de stick ligt. Dat maakt aannemen, vlak passen en pushen voorspelbaar, en daarom is het een logisch startpunt voor beginners en allround spelers. Bij een low bow ligt de kromming lager, dichter bij de krul. Dat helpt om onder de bal te komen voor lifts, 3D-acties en aerials, maar vraagt meer techniek bij de aanname. Kies dus op de acties die jij het meest maakt.',
  sections: [
    {
      heading: 'Wat is de bow van een hockeystick?',
      level: 2,
      body: [
        'De bow is de kromming van de stick. Volgens de spelregels mag die kromming maximaal 25 mm diep zijn, op het veld en in de zaal. [Bron: FIH Rules of Hockey](' +
          ZAAL_SOURCES.fieldRules.url +
          ')',
        'Omdat de maximale diepte voor iedereen gelijk is, zit het verschil tussen sticks vooral in de **plaats** van de kromming. Een lager geplaatste kromming helpt om onder de bal te komen; een rustiger of hoger geplaatst profiel wordt vaak als startpunt voor beginners geadviseerd. [Bron: PassaHockey — zaalhockeyadvies](' +
          PASSAHOCKEY_INDOOR +
          ') · [Bron: Intersport — hockeystick kopen](' +
          INTERSPORT_GUIDE +
          ')',
      ],
    },
    {
      heading: 'Mid bow en low bow naast elkaar',
      level: 2,
      body: [
        {
          type: 'table',
          columns: ['Kenmerk', 'Mid bow', 'Low bow'],
          rows: [
            [
              'Plaats van de kromming',
              'Ongeveer halverwege',
              'Lager, dichter bij de krul',
            ],
            [
              'Aannemen en vlak passen',
              'Doorgaans voorspelbaar',
              'Vraagt meer techniek',
            ],
            [
              'Liften, 3D en aerials',
              'Kan, maar lastiger',
              'Makkelijker onder de bal',
            ],
            [
              'Logische richting voor',
              'Beginners en allround spelers',
              'Spelers die de basis beheersen',
            ],
          ],
        },
        'Dit is een redactionele samenvatting, geen vaste regel. Ook carbon, gewicht en balans bepalen hoe een stick aanvoelt.',
      ],
    },
    {
      heading: 'Wanneer past een mid bow?',
      level: 2,
      body: [
        {
          type: 'list',
          items: [
            'Je begint net of bent nog bezig met de basistechniek.',
            'Je speelt veel vlakke passes en wilt een voorspelbare aanname.',
            'Je speelt allround en maakt maar af en toe een lift of 3D-actie.',
          ],
        },
      ],
    },
    {
      heading: 'Wanneer past een low bow?',
      level: 2,
      body: [
        {
          type: 'list',
          items: [
            'Je beheerst de basis en wilt vaker liften, scheppen of aerials spelen.',
            'Je maakt veel 3D-acties of dribbelt graag met de bal van de grond.',
            'Je hebt al met een rustiger profiel gespeeld en weet wat je mist.',
          ],
        },
        'Een **extreme low bow** gaat nog een stap verder en is een specialistische keuze, bijvoorbeeld voor de dragflick. Die adviseren we niet als eerste stick.',
      ],
    },
    {
      heading: 'En pro bow, dynabow of standaard?',
      level: 3,
      body: [
        'Merken gebruiken eigen namen. Een standaardprofiel (bij Grays bijvoorbeeld Ultrabow) is nog rustiger dan een mid bow. Pro bow en dynabow zijn tussenvormen tussen mid en low bow. Vergelijk daarom niet alleen het woord op de stick, maar ook de omschrijving van het exacte model.',
      ],
    },
    {
      heading: 'Overstappen van mid bow naar low bow',
      level: 2,
      body: [
        'Verander niet alles tegelijk. Wie van een soepele mid bow overstapt naar een stijve extreme low bow, merkt veel verschillen tegelijk en weet daarna niet goed wat wel en niet bevalt. Een low bow met een vergelijkbaar carbonpercentage is een rustiger volgende stap.',
      ],
    },
    {
      heading: 'Mid bow sticks in onze catalogus',
      level: 2,
      body: [
        'Veldsticks voor volwassenen, gesorteerd op richtprijs:',
        { type: 'list', items: adultFieldSticksWith('midbow') },
      ],
    },
    {
      heading: 'Low bow sticks in onze catalogus',
      level: 2,
      body: [
        'Veldsticks voor volwassenen, gesorteerd op richtprijs:',
        { type: 'list', items: adultFieldSticksWith('lowbow') },
        'Twijfel je nog? De [stickwijzer](/stickwijzer) vraagt naar je spelacties en ervaring en laat zien welk profiel een logische richting is, met de redenen erbij. Meer over de hele keuze lees je in [hockeystick kopen: zo kies je een stick die bij je past](/blog/hockeystick-kopen).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-08',
  updatedAt: '2026-10-08',
  sources: [
    { label: ZAAL_SOURCES.fieldRules.label, url: ZAAL_SOURCES.fieldRules.url },
    { label: 'PassaHockey — Zaalhockeyadvies', url: PASSAHOCKEY_INDOOR },
    {
      label:
        'Intersport — Waar moet je op letten bij de aanschaf van een hockeystick',
      url: INTERSPORT_GUIDE,
    },
    {
      label:
        'Redactionele uitgangspunten jouwhockeystick.nl — geen eigen testresultaten of prestatiegaranties',
    },
  ],
  metaDescription:
    'Low bow of mid bow? Lees wat het verschil in kromming betekent voor aannemen, passen en liften, voor wie welk profiel past, en welke sticks je kunt vergelijken.',
};
