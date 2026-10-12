import { getFieldProducts } from '@/catalog';
import type { Brand } from '@/catalog/types';
import type { Article } from '../types';
import { formatEuro } from '../catalogLinks';

const ORANJE_BRANDS: Brand[] = ['adidas', 'Princess', 'Brabo', 'Osaka'];

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
    'Bij de Oranje-dames springt één merk eruit: maar liefst zeven speelsters spelen met een stick van adidas. Frédérique Matla hoort bij Princess en Yibbi Jansen bij Osaka. Bij de heren is het een mix: Thierry Brinkman speelt met Brabo, Koen Bijen hielp een Princess-stick ontwikkelen en Jorrit Croon zie je zowel bij adidas als bij Princess terug. Met welk model ze precies spelen? Dat houden de meesten voor zich.',
  sections: [
    {
      heading: 'Kijk eens naar de stick van je idool',
      level: 2,
      body: [
        'Sta je bij een interland langs het veld, dan kijk je al snel niet alleen naar de bal, maar ook naar de stick. Welk merk is dat? Welke kleur? En zou die bij mij ook werken?',
        'Wij zochten het voor je uit. Dat bleek best een puzzel, want een speler kan met een merk spelen, ambassadeur van een merk zijn of hebben meegeholpen aan een stick. Drie heel verschillende dingen. Per speler lees je hieronder wat er bekend is.',
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
          columns: ['Speelster', 'Merk', 'Bijzonderheid'],
          rows: [
            ['Xan de Waard', 'adidas', ''],
            ['Renée van Laarhoven', 'adidas', ''],
            ['Felice Albers', 'adidas', ''],
            ['Luna Fokke', 'adidas', ''],
            ['Joosje Burg', 'adidas', ''],
            ['Pien Dicke', 'adidas', ''],
            ['Daantje de Kruijff', 'adidas', ''],
            ['Yibbi Jansen', 'Osaka', 'Eigen Yibbi-collectie'],
            [
              'Frédérique Matla',
              'Princess',
              'Betrokken bij ontwikkeling Premium 7 Star',
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
          columns: ['Speler', 'Merk', 'Bijzonderheid'],
          rows: [
            ['Thierry Brinkman', 'Brabo', ''],
            [
              'Koen Bijen',
              'Princess',
              'Betrokken bij ontwikkeling Premium 7 Star',
            ],
            ['Jorrit Croon', 'adidas / Princess', ''],
          ],
        },
        'Dit is geen complete lijst van de selecties. We noemen alleen spelers van wie bekend is met welk merk ze spelen.',
      ],
    },
    {
      heading: 'De Oranje-dames: opvallend veel adidas',
      level: 2,
      body: [
        'Xan de Waard, Renée van Laarhoven, Felice Albers, Luna Fokke, Joosje Burg, Pien Dicke en Daantje de Kruijff: allemaal spelen ze met een stick van adidas. En nee, dat komt niet doordat adidas ook de shirts van Oranje levert. Dat is een aparte afspraak. Welk model elke speelster precies gebruikt, is niet bekend.',
      ],
    },
    {
      heading: 'Yibbi Jansen en Osaka',
      level: 3,
      body: [
        'Yibbi Jansen is ambassadeur van Osaka, en ze heeft zelfs een eigen stickcollectie: de Yibbi-lijn. Dat zegt veel over haar band met het merk. Met welke uitvoering ze op dit moment in wedstrijden speelt, weten we niet. Een collectie met je naam is nog geen wedstrijdstick.',
      ],
    },
    {
      heading: 'Frédérique Matla en Princess',
      level: 3,
      body: [
        'Frédérique Matla staat bij Princess tussen de vaste namen, en samen met Koen Bijen hielp ze de Princess Premium 7 Star te ontwikkelen. Ze is dus nauw betrokken bij die lijn. Met welk model ze nu precies speelt, is niet bekend.',
      ],
    },
    {
      heading: 'De Oranje-heren: meer variatie',
      level: 2,
      body: [
        'Bij de dames heeft één merk duidelijk de overhand, bij de heren is het een mix. En bij één speler is het verhaal nog niet helemaal rond.',
      ],
    },
    {
      heading: 'Thierry Brinkman en Brabo',
      level: 3,
      body: [
        'Thierry Brinkman speelt met Brabo, na eerder met Princess te hebben gespeeld. Brabo zet hem ook op de eigen site in de spotlights. Zijn exacte wedstrijdmodel? Dat houdt hij voor zich.',
      ],
    },
    {
      heading: 'Koen Bijen en Princess',
      level: 3,
      body: [
        'Koen Bijen ontwikkelde samen met Frédérique Matla de Princess Premium 7 Star. Een heren- en een damesinternational aan één stick, leuk! Of hij er zelf in wedstrijden mee speelt, is daarmee nog niet gezegd.',
      ],
    },
    {
      heading: 'Jorrit Croon: adidas of Princess?',
      level: 3,
      body: [
        'Bij Jorrit Croon is het een beetje zoeken. Hij wordt in verband gebracht met de adidas Estro-serie, maar zelf vertelde hij in een interview over een Princess Premium 7 Star Midbow. Wanneer dat interview was, konden we niet achterhalen.',
        'Misschien is hij van merk gewisseld, maar zeker weten doen we het niet. Daarom zetten we beide merken bij zijn naam.',
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
            '**Speelt met het merk:** de speler gebruikt een stick van dat merk. Het exacte model is vaak niet bekend.',
            '**Ambassadeur:** de speler werkt samen met het merk, soms met een eigen collectie. Dat zegt niet met welk model er in wedstrijden wordt gespeeld.',
            '**Medeontwikkelaar:** de speler hielp een stick ontwikkelen. Ook dat zegt niet dat hij of zij er nu zelf mee speelt.',
          ],
        },
        'En materiaal en contracten veranderen. Wat vorig seizoen klopte, kan nu alweer anders zijn.',
      ],
    },
    {
      heading: 'Moet je dezelfde stick kopen als je idool?',
      level: 2,
      body: [
        'Spelen met hetzelfde merk als je favoriete international? Superleuk! Maar de merknaam vertelt nog niet welk model bij jou past. En het exacte wedstrijdmodel van je idool is meestal niet eens bekend.',
        'Laat je dus gerust inspireren, maar kies het model op je eigen lengte, ervaring, voorkeuren en budget.',
        'Benieuwd welke stick bij jou past? Doe de [stickwijzer](/stickwijzer) of lees [hockeystick kopen: zo kies je een stick die bij je past](/blog/hockeystick-kopen). Het verschil in kromming lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow), en voor kinderen is er [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).',
      ],
    },
    {
      heading: 'Deze merken in onze catalogus',
      level: 2,
      body: [
        'Dit zijn niet de wedstrijdsticks van de spelers, maar wel sticks van dezelfde merken die je bij ons kunt vergelijken:',
        { type: 'list', items: brandLines },
        'Meer over de merken zelf lees je bij [merken](/merken).',
      ],
    },
    {
      heading: 'Over dit overzicht',
      level: 2,
      body: [
        'We hebben dit overzicht op 8 oktober 2026 samengesteld uit openbare informatie van merken, winkels en interviews. De spelers en merken hebben het niet zelf voor ons bevestigd. Daarom noemen we bij niemand een exact wedstrijdmodel.',
        {
          type: 'note',
          text: '*De genoemde spelers en speelsters bevelen deze website of een winkel niet aan, en dit artikel bevat geen citaten van hen. Zie je een fout of weet je iets nieuws? Laat het ons weten via info@jouwhockeystick.nl.*',
        },
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-08',
  updatedAt: '2026-10-12',
  sources: [
    {
      label:
        'PassaSports — Speel jij met dezelfde hockeymerken als de Oranje Dames?',
    },
    { label: 'PassaSports — Thierry Brinkman' },
    { label: 'Brabo — atletenpagina Thierry Brinkman' },
    { label: 'Osaka — atletenpagina Yibbi Jansen en Yibbi-stickcollectie' },
    { label: 'Princess — atletenpagina Frédérique Matla' },
    {
      label:
        'Jumbo Sports — Princess-hockeysticks (Premium 7 Star) en adidas Estro .95',
    },
    {
      label:
        'De Hockeywinkel — Speel als Jorrit Croon met de adidas Estro-serie',
    },
    { label: 'HockeyDirect — Exclusief interview met Jorrit Croon' },
    { label: 'Alle bronnen geraadpleegd op 8 oktober 2026' },
  ],
  metaDescription:
    'Met welke stick spelen de Oranje-dames en -heren? Een overzicht van de stickmerken per international, en wat je ervan kunt leren voor je eigen keuze.',
};
