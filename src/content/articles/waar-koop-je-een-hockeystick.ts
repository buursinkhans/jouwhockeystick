import { getAllProducts } from '@/catalog';
import type { Article } from '../types';

const BOL_RETURNS =
  'https://www.bol.com/nl/nl/klantenservice/a/5653635052601344/retourvoorwaarden';
const BOL_DELIVERY =
  'https://www.bol.com/nl/nl/klantenservice/info/blt59015a4311d01e18/bezorgen-en-ontvangen';
const PASSA_ORDERING = 'https://www.passasports.nl/faq-bestelproces';
const PASSA_RETURNS = 'https://www.passasports.nl/faq-ruilen-en-retourneren';
const PASSA_ABOUT = 'https://www.passasports.nl/about-passa-sports';

/** Shop terms below were checked on this date; they can change. */
const TERMS_CHECKED = '16 oktober 2026';

// Counted from the catalog, so the numbers stay right when it changes.
const products = getAllProducts();
const atBol = products.filter((p) => p.bolNotSold === undefined);
const atPassa = products.filter((p) => p.passaSportsProductUrl !== undefined);
const atBoth = atBol.filter((p) => p.passaSportsProductUrl !== undefined);

export const waarKoopJeEenHockeystick: Article = {
  slug: 'waar-koop-je-een-hockeystick',
  title:
    'Waar koop je een hockeystick? Overal, en via ons bij bol.com of PassaHockey',
  intro:
    'Een hockeystick koop je waar je wilt: in de clubshop, bij een sportwinkel om de hoek of in een webshop. Ons advies blijft hetzelfde. Wil je meteen bestellen, dan vind je bij elke stick een knop naar bol.com, naar PassaHockey of naar allebei. Hieronder lees je wat het verschil is tussen die twee, zodat je kiest wat bij jou past.',
  sections: [
    {
      heading: 'Je mag je stick overal kopen',
      level: 2,
      body: [
        'Echt waar: jouwhockeystick.nl is geen winkel. We helpen je kiezen, en waar je de stick daarna koopt, maak jij uit. Heeft je club een clubshop of zit er een hockeywinkel bij jou in de buurt? Dan kun je de stick daar vaak ook even in je handen nemen. Dat is altijd fijn.',
        'Onze tip: neem de modelnaam en de lengte uit je advies mee. Dan weet je zeker dat je dezelfde stick krijgt, en niet een nét andere uitvoering of een maat te lang.',
      ],
    },
    {
      heading: 'Waarom staan er knoppen naar bol.com en PassaHockey?',
      level: 2,
      body: [
        'Bij deze twee winkels kun je direct doorklikken naar precies de stick uit je advies. Het zijn partnerlinks: koop je via zo’n knop, dan krijgen wij een klein bedrag van de winkel. Jij betaalt precies hetzelfde. Daarmee houden we de stickwijzer gratis en zonder reclame.',
        'Wat we verdienen, telt niet mee in het advies. Een stick die je alleen in een andere winkel vindt, kan net zo goed bovenaan staan. Hoe dat werkt, lees je in [hoe ons advies tot stand komt](/methodiek).',
      ],
    },
    {
      heading: 'Wat is het verschil tussen bol.com en PassaHockey?',
      level: 2,
      body: [
        'bol.com is een groot online warenhuis waar je naast hockeysticks bijna alles vindt. PassaHockey is de hockeywinkel van PassaSports, een sportspecialist met webshops per sport. De belangrijkste verschillen voor een stick op een rij:',
        {
          type: 'table',
          columns: ['', 'bol.com', 'PassaHockey'],
          rows: [
            [
              'Soort winkel',
              'Online warenhuis met veel verschillende producten',
              'Online hockeyspeciaalzaak van PassaSports',
            ],
            [
              'Wie verkoopt de stick?',
              'bol.com zelf of een verkooppartner; dat zie je op de productpagina',
              'PassaSports zelf',
            ],
            [
              'Verzendkosten',
              'Geen verzendkosten bij een bestelling vanaf €25',
              'Gratis vanaf €79; daaronder €3,95 (vanaf €25) of €5,95. Thuisbezorgen kost €1 extra ten opzichte van een DHL ServicePoint',
            ],
            [
              'Retourneren',
              'Binnen 30 dagen aanmelden, terugsturen is gratis',
              'Binnen 14 dagen; met hun retourlabel betaal je €2,95',
            ],
            [
              'Bezorging',
              'Bezorgtijd staat bij het product',
              'Je kiest zelf je bezorgdag',
            ],
          ],
        },
        {
          type: 'note',
          text: `De voorwaarden hebben we op ${TERMS_CHECKED} bij beide winkels nagekeken. Winkels passen ze weleens aan, dus kijk bij het afrekenen even naar wat er dan geldt.`,
        },
      ],
    },
    {
      heading: 'Wanneer kies je wat?',
      level: 3,
      body: [
        'Er is geen goede of foute keuze: het is dezelfde stick. Een paar dingen die kunnen helpen:',
        {
          type: 'list',
          items: [
            '**Twijfel je nog over de maat?** Dan is de langere, gratis retourtermijn van bol.com prettig.',
            '**Wil je er meteen grip, ballen of een stickbag bij?** PassaHockey is helemaal ingericht op hockey, dus dat bestel je in één keer mee.',
            '**Koop je een duurdere stick?** Vanaf €79 bezorgt PassaHockey gratis, en bol.com al vanaf €25. Bij een stick maakt dat dus vaak weinig uit.',
            '**Staat er maar één knop?** Dan verkoopt alleen die winkel de stick, voor zover wij weten. Je kunt hem natuurlijk ook ergens anders zoeken.',
          ],
        },
      ],
    },
    {
      heading: 'Hoeveel sticks vind je waar?',
      level: 2,
      body: [
        `Van de ${products.length} sticks op deze site kun je er ${atBol.length} via bol.com bestellen en ${atPassa.length} via PassaHockey. ${atBoth.length} sticks zijn bij allebei te koop; daar zie je dan ook twee knoppen.`,
      ],
    },
    {
      heading: 'Eerst weten welke stick bij je past?',
      level: 2,
      body: [
        'Begin dan met de [stickwijzer](/stickwijzer). In een paar minuten krijg je een stick die past bij je lengte, je ervaring en hoe je speelt, met de redenen erbij. Twijfel je vooral over de maat? Kijk dan in de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-16',
  updatedAt: '2026-10-16',
  sources: [
    { label: 'bol.com — Retourvoorwaarden', url: BOL_RETURNS },
    { label: 'bol.com — Bezorgen en ontvangen', url: BOL_DELIVERY },
    {
      label: 'PassaSports — Bestellen en betalen (verzend- en retourkosten)',
      url: PASSA_ORDERING,
    },
    { label: 'PassaSports — Ruilen en retourneren', url: PASSA_RETURNS },
    { label: 'PassaSports — Over PassaSports', url: PASSA_ABOUT },
    {
      label:
        'Aantallen sticks per winkel: de catalogus van jouwhockeystick.nl, met per stick de gecontroleerde winkels',
    },
  ],
  metaDescription:
    'Een hockeystick koop je overal. Via jouwhockeystick.nl bestel je bij bol.com of PassaHockey: dit zijn de verschillen in verzendkosten, retourneren en bezorging.',
};
