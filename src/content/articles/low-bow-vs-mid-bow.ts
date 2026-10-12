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
    'Bij een mid bow zit de kromming ongeveer halverwege de stick. Rustig en voorspelbaar: fijn voor aannemen, vlak passen en pushen, en daarom een mooi startpunt voor beginners en allround spelers. Bij een low bow zit de kromming lager, dichter bij de krul. Daarmee kom je makkelijker onder de bal voor lifts, 3D-acties en aerials, maar de aanname vraagt meer techniek. Kies dus op de acties die jij het meest maakt.',
  sections: [
    {
      heading: 'Wat is de bow van een hockeystick?',
      level: 2,
      body: [
        'De bow is de kromming van je stick. Hoe diep die mag zijn, is vastgelegd in de spelregels: maximaal 25 mm, op het veld en in de zaal.',
        'Omdat die grens voor iedereen gelijk is, zit het echte verschil tussen sticks in de **plek** van de kromming. Ligt die laag, dan kom je makkelijker onder de bal. Een rustiger profiel is juist fijn als je nog aan je basis werkt.',
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
              'Plek van de kromming',
              'Ongeveer halverwege',
              'Lager, dichter bij de krul',
            ],
            [
              'Aannemen en vlak passen',
              'Meestal voorspelbaar',
              'Vraagt meer techniek',
            ],
            [
              'Liften, 3D en aerials',
              'Kan, maar lastiger',
              'Makkelijker onder de bal',
            ],
            [
              'Een logische keuze voor',
              'Beginners en allround spelers',
              'Spelers die de basis beheersen',
            ],
          ],
        },
        'Zie dit als hulpje, niet als wet. Ook carbon, gewicht en balans bepalen hoe een stick in je handen ligt.',
      ],
    },
    {
      heading: 'Wanneer past een mid bow?',
      level: 2,
      body: [
        {
          type: 'list',
          items: [
            'Je begint net, of je werkt nog aan je basistechniek.',
            'Je speelt veel vlakke passes en wilt een aanname waar je op kunt bouwen.',
            'Je speelt overal een beetje en maakt af en toe een lift of 3D-actie.',
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
            'Je beheerst de basis en wilt vaker liften, scheppen of een aerial spelen.',
            'Je maakt veel 3D-acties of dribbelt graag met de bal van de grond.',
            'Je hebt al met een rustiger profiel gespeeld en weet wat je mist.',
          ],
        },
        'Een **extreme low bow** gaat nog een stapje verder. Echt iets voor specialisten, bijvoorbeeld voor de sleeppush. Als eerste stick raden we hem niet aan.',
      ],
    },
    {
      heading: 'En pro bow, dynabow of standaard?',
      level: 3,
      body: [
        'Elk merk geeft zijn profielen een eigen naam, en dat maakt het soms verwarrend. Een standaardprofiel, zoals de Ultrabow van Grays, is nog rustiger dan een mid bow. Pro bow en dynabow zitten tussen mid en low bow in. Kijk dus niet alleen naar het woord op de stick, maar ook naar de omschrijving van dat ene model.',
      ],
    },
    {
      heading: 'Overstappen van mid bow naar low bow',
      level: 2,
      body: [
        'Verander niet alles in één keer. Wie van een soepele mid bow meteen naar een stijve extreme low bow springt, merkt tien verschillen tegelijk en weet daarna niet wat er nou beviel. Een low bow met ongeveer hetzelfde carbonpercentage is een rustigere volgende stap.',
      ],
    },
    {
      heading: 'Mid bow sticks in onze catalogus',
      level: 2,
      body: [
        'Veldsticks voor volwassenen, op volgorde van richtprijs:',
        { type: 'list', items: adultFieldSticksWith('midbow') },
      ],
    },
    {
      heading: 'Low bow sticks in onze catalogus',
      level: 2,
      body: [
        'Veldsticks voor volwassenen, op volgorde van richtprijs:',
        { type: 'list', items: adultFieldSticksWith('lowbow') },
        'Twijfel je nog? De [stickwijzer](/stickwijzer) vraagt naar je spelacties en ervaring en laat zien welk profiel bij je past, met de redenen erbij. Meer over de hele keuze lees je in [hockeystick kopen: zo kies je een stick die bij je past](/blog/hockeystick-kopen).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-08',
  updatedAt: '2026-10-12',
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
