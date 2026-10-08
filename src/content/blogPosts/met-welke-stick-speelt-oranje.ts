import { getFieldProducts } from '@/catalog';
import type { Brand } from '@/catalog/types';
import type { Article } from '../types';
import { formatEuro } from '../catalogLinks';

const SOURCES = {
  passaDames:
    'https://www.passasports.nl/hockey/blog/speel-jij-met-dezelfde-hockeymerken-als-de-oranje-dames',
  passaBrinkman: 'https://www.passasports.nl/hockey/blog/thierry-brinkman',
  passaStrafcorner:
    'https://www.passasports.nl/hockey/blog/de-strafcorner-sticks-van-seizoen-2021',
  braboBrinkman: 'https://brabohockey.com/pages/athletes/thierry-brinkman',
  osakaYibbi: 'https://osakaworld.com/blogs/athletes/yibbi-jansen',
  osakaYibbiCollection:
    'https://osakaworld.com/collections/yibbi-field-hockey-sticks',
  princessMatla:
    'https://www.princess-hockey.com/pages/athletes/frederique-matla',
  jumboPrincess:
    'https://www.jumbosports.com/hockey/hockeysticks/merken/princess',
  jumboEstro95: 'https://www.jumbosports.com/adidas-estro-95-3453361873',
  hockeywinkelCroon:
    'https://de-hockeywinkel.nl/blogs/blogs-advies-van-de-hockeywinkel/speel-als-jorrit-croon-met-de-adidas-estro-serie',
  hockeydirectCroon:
    'https://www.hockeydirect.nl/blog/exclusief-interview-met-jorrit-croon',
} as const;

const ORANJE_BRANDS: Brand[] = [
  'adidas',
  'Princess',
  'Brabo',
  'Osaka',
  'Grays',
];

/** One line per brand with what our catalog holds, generated from the catalog. */
function brandCatalogLine(brand: Brand): string | undefined {
  const sticks = getFieldProducts().filter(
    (product) => product.brand === brand,
  );
  if (sticks.length === 0) {
    return undefined;
  }
  const prices = sticks.map((product) => product.priceIndicativeEur.value);
  const range =
    sticks.length === 1
      ? `richtprijs ${formatEuro(prices[0] ?? 0)}`
      : `richtprijzen van ${formatEuro(Math.min(...prices))} tot ${formatEuro(Math.max(...prices))}`;
  return `[${brand}](/sticks?brand=${encodeURIComponent(brand)}) — ${sticks.length} ${sticks.length === 1 ? 'veldstick' : 'veldsticks'}, ${range}`;
}

const brandLines = ORANJE_BRANDS.map(brandCatalogLine).filter(
  (line): line is string => line !== undefined,
);

export const metWelkeStickSpeeltOranje: Article = {
  slug: 'met-welke-stick-speelt-oranje',
  title: 'Met welke stick speelt Oranje? De merken van de dames en heren',
  intro:
    'Bij de Oranje-dames valt één merk op: volgens PassaSports spelen zeven speelsters met een stick van adidas. Frédérique Matla is verbonden aan Princess en Yibbi Jansen aan Osaka. Bij de heren is het beeld gevarieerder: Thierry Brinkman speelt met Brabo, Koen Bijen ontwikkelde mee aan een Princess-stick en Jorrit Croon wordt zowel aan adidas als aan Princess gekoppeld. Welk exact model ze in wedstrijden gebruiken, is meestal niet openbaar.',
  sections: [
    {
      heading: 'Kijk eens naar de stick van je idool',
      level: 2,
      body: [
        'Wie bij een interland langs het veld staat, kijkt al snel niet alleen naar de bal, maar ook naar de stick. Welk merk is dat? Welke kleur? En zou die stick bij mij ook werken?',
        'We zochten uit wat er publiek bekend is over de sticks van de Oranje-dames en -heren. Dat bleek minder eenvoudig dan het lijkt. Een speler kan met een merk spelen, ambassadeur zijn van een merk of meegewerkt hebben aan een stick. Dat zijn drie verschillende dingen. Daarom zetten we er bij elke naam bij hoe zeker het is.',
      ],
    },
    {
      heading: 'In één oogopslag',
      level: 2,
      body: [],
    },
    {
      heading: 'Oranje-dames',
      level: 3,
      body: [
        {
          type: 'table',
          columns: ['Speelster', 'Merk', 'Wat weten we?'],
          rows: [
            ['Xan de Waard', 'adidas', 'Speelt met adidas; model niet bekend'],
            [
              'Renée van Laarhoven',
              'adidas',
              'Speelt met adidas; model niet bekend',
            ],
            ['Felice Albers', 'adidas', 'Speelt met adidas; model niet bekend'],
            ['Luna Fokke', 'adidas', 'Speelt met adidas; model niet bekend'],
            ['Joosje Burg', 'adidas', 'Speelt met adidas; model niet bekend'],
            ['Pien Dicke', 'adidas', 'Speelt met adidas; model niet bekend'],
            [
              'Daantje de Kruijff',
              'adidas',
              'Speelt met adidas; model niet bekend',
            ],
            ['Yibbi Jansen', 'Osaka', 'Ambassadeur, met eigen Yibbi-collectie'],
            [
              'Frédérique Matla',
              'Princess',
              'Atletenpagina; medeontwikkelaar Premium 7 Star',
            ],
          ],
        },
      ],
    },
    {
      heading: 'Oranje-heren',
      level: 3,
      body: [
        {
          type: 'table',
          columns: ['Speler', 'Merk', 'Wat weten we?'],
          rows: [
            [
              'Thierry Brinkman',
              'Brabo',
              'Speelt met Brabo; model niet bekend',
            ],
            ['Koen Bijen', 'Princess', 'Medeontwikkelaar Premium 7 Star'],
            [
              'Jorrit Croon',
              'adidas, eerder Princess',
              'Bronnen spreken elkaar tegen',
            ],
            ['Jip Janssen', 'Grays', 'Alleen een vermelding uit 2020/2021'],
          ],
        },
        'Dit is geen volledige lijst van de huidige selecties. We noemen alleen spelers over wie een publieke bron iets zegt over hun stick.',
      ],
    },
    {
      heading: 'De Oranje-dames: opvallend veel adidas',
      level: 2,
      body: [
        `Volgens PassaSports spelen Xan de Waard, Renée van Laarhoven, Felice Albers, Luna Fokke, Joosje Burg, Pien Dicke en Daantje de Kruijff met een stick van adidas. Dat gaat echt over hun sticks, niet over de kleding: adidas levert ook de tenues van de Nederlandse teams, maar dat is een andere afspraak. Welk model elke speelster gebruikt, noemt de bron niet. [Bron: PassaSports — hockeymerken van de Oranje Dames](${SOURCES.passaDames})`,
      ],
    },
    {
      heading: 'Yibbi Jansen en Osaka',
      level: 3,
      body: [
        `Yibbi Jansen is ambassadeur van Osaka, en het merk heeft zelfs een eigen Yibbi-stickcollectie. Dat zegt veel over de band met het merk, maar niet met welke uitvoering zij op dit moment in wedstrijden speelt. Een collectie is geen wedstrijdmodel. [Bron: Osaka — Yibbi Jansen](${SOURCES.osakaYibbi}) · [Bron: Osaka — Yibbi-collectie](${SOURCES.osakaYibbiCollection})`,
      ],
    },
    {
      heading: 'Frédérique Matla en Princess',
      level: 3,
      body: [
        `Frédérique Matla staat op de officiële atletenpagina van Princess. Volgens Jumbo Sports werkte zij samen met Koen Bijen mee aan de ontwikkeling van de Princess Premium 7 Star. Dat bevestigt haar betrokkenheid bij die lijn, niet automatisch het exacte model waarmee ze nu speelt. [Bron: Princess — Frédérique Matla](${SOURCES.princessMatla}) · [Bron: Jumbo Sports — Princess](${SOURCES.jumboPrincess})`,
      ],
    },
    {
      heading: 'De Oranje-heren: meer variatie',
      level: 2,
      body: [
        'Waar bij de dames één merk de boventoon voert, is het bij de heren een mix. En bij één speler is het verhaal zelfs niet helemaal rond.',
      ],
    },
    {
      heading: 'Thierry Brinkman en Brabo',
      level: 3,
      body: [
        `Thierry Brinkman hockeyt volgens PassaSports met Brabo, nadat hij eerder met Princess speelde. Brabo heeft ook een officiële atletenpagina voor hem. Welk model hij in wedstrijden gebruikt, staat niet in de geraadpleegde passages. [Bron: PassaSports — Thierry Brinkman](${SOURCES.passaBrinkman}) · [Bron: Brabo — Thierry Brinkman](${SOURCES.braboBrinkman})`,
      ],
    },
    {
      heading: 'Koen Bijen en Princess',
      level: 3,
      body: [
        `Koen Bijen ontwikkelde samen met Frédérique Matla de Princess Premium 7 Star, aldus Jumbo Sports. Of hij nu met een specifieke uitvoering uit die lijn speelt, is daarmee niet gezegd. [Bron: Jumbo Sports — Princess](${SOURCES.jumboPrincess})`,
      ],
    },
    {
      heading: 'Jorrit Croon: adidas of Princess?',
      level: 3,
      body: [
        `Bij Jorrit Croon spreken de bronnen elkaar tegen. De Hockeywinkel koppelt hem aan de adidas Estro-serie en Jumbo Sports noemt hem bij de adidas Estro .95. Maar in een interview bij HockeyDirect vertelt hij over een Princess Premium 7 Star Midbow. Wanneer dat interview precies is afgenomen, konden we niet vaststellen. [Bron: De Hockeywinkel — Jorrit Croon en de Estro-serie](${SOURCES.hockeywinkelCroon}) · [Bron: Jumbo Sports — adidas Estro .95](${SOURCES.jumboEstro95}) · [Bron: HockeyDirect — interview met Jorrit Croon](${SOURCES.hockeydirectCroon})`,
        'Mogelijk is hij van merk gewisseld, maar dat kunnen we niet bevestigen. We noemen adidas daarom als vermelding door winkels, niet als zijn bevestigde wedstrijdstick.',
      ],
    },
    {
      heading: 'Jip Janssen en de Grays Jumbow',
      level: 3,
      body: [
        `Jip Janssen werd in seizoen 2020/2021 genoemd als gebruiker van de Jumbow, in een artikel over strafcornersticks bij de Grays GR 10000 Jumbow. Dat is een paar seizoenen geleden. We koppelen zijn naam daarom niet aan het huidige model of aan actueel Grays-gebruik. [Bron: PassaSports — strafcornersticks 2020/2021](${SOURCES.passaStrafcorner})`,
      ],
    },
    {
      heading: 'Speler, ambassadeur of medeontwikkelaar?',
      level: 2,
      body: [
        'Je zag het al: niet elke koppeling tussen een international en een merk betekent hetzelfde.',
        {
          type: 'list',
          items: [
            '**Speelt met het merk:** een bron noemt dat de speler met een stick van dat merk speelt. Het exacte model is vaak niet bekend.',
            '**Ambassadeur:** de speler werkt samen met het merk, soms met een eigen collectie. Dat zegt niet welk model in wedstrijden wordt gebruikt.',
            '**Medeontwikkelaar:** de speler werkte mee aan een productlijn. Ook dat is geen bewijs van huidig gebruik.',
          ],
        },
        'Materiaalkeuzes en contracten veranderen bovendien. Wat vorig seizoen klopte, hoeft nu niet meer te kloppen.',
      ],
    },
    {
      heading: 'Moet je dezelfde stick kopen als je idool?',
      level: 2,
      body: [
        'Het is leuk om met hetzelfde merk te spelen als je favoriete international. Maar een international kiest een stick die past bij een spel van topniveau: vaak stijf, met veel carbon en een lage kromming voor sleeppushes, aerials en 3D-acties. Voor de meeste spelers, en zeker voor kinderen, is dat niet de logische eerste keuze.',
        'Ons advies: kies gerust een merk dat je aanspreekt, maar kies het model op je eigen lengte, ervaring en spel. Hoe dat werkt, lees je in [hockeystick kopen: zo kies je een stick die bij je past](/blog/hockeystick-kopen). Het verschil in kromming lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow), en voor kinderen is er [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).',
        'Wil je weten welke stick bij jou past, ook binnen het merk van je idool? Doe de [stickwijzer](/stickwijzer).',
      ],
    },
    {
      heading: 'Deze merken in onze catalogus',
      level: 2,
      body: [
        'Dit zijn niet de wedstrijdsticks van de spelers, maar sticks van dezelfde merken die je bij ons kunt vergelijken:',
        { type: 'list', items: brandLines },
        'Meer over de merken zelf lees je bij [merken](/merken).',
      ],
    },
    {
      heading: 'Over dit overzicht',
      level: 2,
      body: [
        'Dit overzicht is samengesteld op 8 oktober 2026 uit publiek beschikbare bronnen. Niet elke bronpagina kon volledig worden opgehaald; een deel van de vermeldingen berust op passages uit zoekresultaten. Het overzicht is niet door elke speler of fabrikant afzonderlijk bevestigd. We noemen alleen een exact wedstrijdmodel als daar specifieke en actuele bevestiging voor is, en dat was bij niemand het geval.',
        {
          type: 'note',
          text: '*De genoemde spelers en speelsters bevelen deze website of een winkel niet aan. Dit artikel bevat geen citaten of testimonials van hen. Zie je een fout of een nieuwere bron? Laat het ons weten via info@jouwhockeystick.nl.*',
        },
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-08',
  updatedAt: '2026-10-08',
  sources: [
    {
      label:
        'PassaSports — Speel jij met dezelfde hockeymerken als de Oranje Dames?',
      url: SOURCES.passaDames,
    },
    { label: 'PassaSports — Thierry Brinkman', url: SOURCES.passaBrinkman },
    {
      label: 'PassaSports — De strafcorner-sticks van seizoen 2020/2021',
      url: SOURCES.passaStrafcorner,
    },
    {
      label: 'Brabo — atletenpagina Thierry Brinkman',
      url: SOURCES.braboBrinkman,
    },
    { label: 'Osaka — atletenpagina Yibbi Jansen', url: SOURCES.osakaYibbi },
    {
      label: 'Osaka — Yibbi-stickcollectie',
      url: SOURCES.osakaYibbiCollection,
    },
    {
      label: 'Princess — atletenpagina Frédérique Matla',
      url: SOURCES.princessMatla,
    },
    {
      label: 'Jumbo Sports — Princess-hockeysticks (Premium 7 Star)',
      url: SOURCES.jumboPrincess,
    },
    { label: 'Jumbo Sports — adidas Estro .95', url: SOURCES.jumboEstro95 },
    {
      label:
        'De Hockeywinkel — Speel als Jorrit Croon met de adidas Estro-serie',
      url: SOURCES.hockeywinkelCroon,
    },
    {
      label: 'HockeyDirect — Exclusief interview met Jorrit Croon',
      url: SOURCES.hockeydirectCroon,
    },
  ],
  metaDescription:
    'Met welke stick spelen de Oranje-dames en -heren? Een overzicht van stickmerken per international, met bron en hoe zeker elke vermelding is.',
};
