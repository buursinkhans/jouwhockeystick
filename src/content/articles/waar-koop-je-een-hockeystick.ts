import { getAllProducts } from '@/catalog';
import type { Article } from '../types';

const BOL_RETURNS =
  'https://www.bol.com/nl/nl/klantenservice/a/5653635052601344/retourvoorwaarden';
const BOL_DELIVERY =
  'https://www.bol.com/nl/nl/klantenservice/info/blt59015a4311d01e18/bezorgen-en-ontvangen';
const PASSA_ORDERING = 'https://www.passasports.nl/faq-bestelproces';
const PASSA_RETURNS = 'https://www.passasports.nl/faq-ruilen-en-retourneren';
const PASSA_ABOUT = 'https://www.passasports.nl/about-passa-sports';
const PLUTO_DELIVERY = 'https://www.plutosport.nl/bezorgen-afhalen';
const PLUTO_RETURNS = 'https://www.plutosport.nl/klantenservice/retour-garantie';
const HOCKEYCITY_SERVICE = 'https://www.hockeycity.nl/service/';
const HOCKEYCITY_RETURNS = 'https://www.hockeycity.nl/service/shipping-returns/';
const HOCKEYCITY_ABOUT = 'https://www.hockeycity.nl/service/about/';
// daka.nl refused automated reading on 2026-11-04; Daisycon's campaign page and the feed instead.
const DAKA_CAMPAIGN = 'https://daisycon.com/campaigns/7290-daka-nl';

/** Shop terms below were checked on these dates; they can change. */
const TERMS_CHECKED = '16 oktober 2026';
const PLUTO_TERMS_CHECKED = '29 oktober 2026';
const HOCKEYCITY_TERMS_CHECKED = '3 november 2026';
const DAKA_TERMS_CHECKED = '4 november 2026';

// Counted from the catalog, so the numbers stay right when it changes.
const products = getAllProducts();
const atBol = products.filter((p) => p.bolNotSold === undefined);
const atPassa = products.filter((p) => p.passaSportsProductUrl !== undefined);
const atPluto = products.filter((p) => p.plutosportProductUrl !== undefined);
const atHockeyCity = products.filter((p) => p.hockeyCityProductUrl !== undefined);
const atDaka = products.filter((p) => p.dakaProductUrl !== undefined);
const shopsOf = (p: (typeof products)[number]) =>
  Number(p.bolNotSold === undefined) +
  Number(p.passaSportsProductUrl !== undefined) +
  Number(p.plutosportProductUrl !== undefined) +
  Number(p.hockeyCityProductUrl !== undefined) +
  Number(p.dakaProductUrl !== undefined);
const atSeveral = products.filter((p) => shopsOf(p) >= 2);

export const waarKoopJeEenHockeystick: Article = {
  slug: 'waar-koop-je-een-hockeystick',
  title:
    'Waar koop je een hockeystick? Overal, en via ons bij bol.com, PassaHockey, Plutosport, HockeyCity of Daka',
  seoTitle: 'Waar koop je een hockeystick? De winkels naast elkaar',
  intro:
    'Een hockeystick koop je waar je wilt: in de clubshop, bij een sportwinkel om de hoek of in een webshop. Ons advies blijft hetzelfde. Wil je meteen bestellen, dan zie je bij elke stick welke van onze partnerwinkels hem verkopen: bol.com, PassaHockey, Plutosport, HockeyCity of Daka. Hieronder lees je wat het verschil is tussen die vijf, zodat je kiest wat bij jou past.',
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
      heading: 'Waarom noemen we bol.com, PassaHockey, Plutosport, HockeyCity en Daka?',
      level: 2,
      body: [
        'Bij deze vijf winkels kun je direct doorklikken naar precies de stick uit je advies. Het zijn partnerlinks: koop je via zo’n link, dan krijgen wij een klein bedrag van de winkel. Jij betaalt precies hetzelfde. Daarmee houden we de stickwijzer gratis en zonder reclame.',
        'Wat we verdienen, telt niet mee in het advies, en ook niet in de volgorde van de winkels. Verkopen meer winkels dezelfde stick, dan zetten we ze op prijs inclusief verzendkosten, voor zover we die kennen. Een stick die je alleen in een andere winkel vindt, kan in het advies net zo goed bovenaan staan. Hoe dat werkt, lees je in [hoe ons advies tot stand komt](/methodiek).',
      ],
    },
    {
      heading: 'Wat is het verschil tussen bol.com, PassaHockey, Plutosport, HockeyCity en Daka?',
      level: 2,
      body: [
        'bol.com is een groot online warenhuis waar je naast hockeysticks bijna alles vindt. PassaHockey is de hockeywinkel van PassaSports, een sportspecialist met webshops per sport. Plutosport is een online sportwinkel voor veel sporten, met een servicepunt in Ter Aar. HockeyCity is een online hockeywinkel die sinds 2020 hoort bij twee hockeyspeciaalzaken in Nederland. Daka is een sportwinkel met een webshop voor veel sporten. De belangrijkste verschillen voor een stick op een rij:',
        {
          type: 'table',
          columns: ['', 'bol.com', 'PassaHockey', 'Plutosport', 'HockeyCity', 'Daka'],
          rows: [
            [
              'Soort winkel',
              'Online warenhuis met veel verschillende producten',
              'Online hockeyspeciaalzaak van PassaSports',
              'Online sportwinkel voor veel sporten',
              'Online hockeywinkel',
              'Sportwinkel met webshop voor veel sporten',
            ],
            [
              'Wie verkoopt de stick?',
              'bol.com zelf of een verkooppartner; dat zie je op de productpagina',
              'PassaSports zelf',
              'Plutosport zelf',
              'HockeyCity zelf',
              'Daka zelf',
            ],
            [
              'Verzendkosten',
              'Geen verzendkosten bij een bestelling vanaf €25',
              'Gratis vanaf €79; daaronder €3,95 (vanaf €25) of €5,95. Thuisbezorgen kost €1 extra ten opzichte van een DHL ServicePoint',
              'Gratis vanaf €75; daaronder €6,95 bij een DHL ServicePoint, €7,95 thuis overdag of €8,95 ’s avonds. Afhalen in Ter Aar is gratis',
              'Gratis vanaf €100 volgens de winkelmand (de veelgestelde vragen noemen €75); daaronder €5',
              'Gratis vanaf €50; daaronder €4,95 (volgens Daisycon en de productfeed van Daka)',
            ],
            [
              'Retourneren',
              'Binnen 30 dagen aanmelden, terugsturen is gratis',
              'Binnen 14 dagen; met hun retourlabel betaal je €2,95',
              'Binnen 30 dagen via een DHL ServicePoint; dat kost €1,95',
              'Binnen 14 dagen, op eigen kosten; ruilen kan niet',
              'Nog niet nagekeken: de site van Daka was niet te lezen',
            ],
            [
              'Bezorging',
              'Bezorgtijd staat bij het product',
              'Je kiest zelf je bezorgdag',
              'Vóór 22.00 uur besteld, de volgende dag bezorgd (niet op zondag)',
              'Op werkdagen vóór 16.00 uur besteld, de volgende dag in huis (de banner op de site noemt binnen 2 dagen)',
              'Via PostNL, thuis of bij een afhaalpunt (volgens de productfeed)',
            ],
          ],
        },
        {
          type: 'note',
          text: `De voorwaarden van bol.com en PassaHockey hebben we op ${TERMS_CHECKED} nagekeken, die van Plutosport op ${PLUTO_TERMS_CHECKED}, die van HockeyCity op ${HOCKEYCITY_TERMS_CHECKED} en die van Daka op ${DAKA_TERMS_CHECKED}, via Daisycon en de productfeed omdat de site van Daka zelf niet te lezen was. Winkels passen ze weleens aan, dus kijk bij het afrekenen even naar wat er dan geldt.`,
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
            '**Twijfel je nog over de maat?** Dan is een lange retourtermijn prettig: bij bol.com en Plutosport is dat 30 dagen.',
            '**Wil je er meteen grip, ballen of een stickbag bij?** PassaHockey en HockeyCity zijn helemaal ingericht op hockey, dus dat bestel je in één keer mee.',
            '**Heb je hem snel nodig?** Plutosport bezorgt de volgende dag als je vóór 22.00 uur bestelt, en woon je in de buurt van Ter Aar, dan kun je hem daar gratis ophalen.',
            '**Let op de verzendkosten.** Gratis verzending begint bij bol.com vanaf €25, bij Daka vanaf €50, bij Plutosport vanaf €75, bij PassaHockey vanaf €79 en bij HockeyCity vanaf €100. Bij een goedkopere stick kan dat het verschil maken; bij een duurdere stick meestal niet.',
            '**Staat er maar één winkel bij?** Dan verkoopt alleen die winkel de stick, voor zover wij weten. Je kunt hem natuurlijk ook ergens anders zoeken.',
          ],
        },
      ],
    },
    {
      heading: 'Hoeveel sticks vind je waar?',
      level: 2,
      body: [
        `Van de ${products.length} sticks op deze site kun je er ${atBol.length} via bol.com bestellen, ${atPassa.length} via PassaHockey, ${atPluto.length} via Plutosport, ${atHockeyCity.length} via HockeyCity en ${atDaka.length} via Daka. ${atSeveral.length} sticks zijn bij twee of meer van deze winkels te koop; die winkels zie je dan bij de stick onder elkaar.`,
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
  updatedAt: '2026-11-04',
  sources: [
    { label: 'bol.com — Retourvoorwaarden', url: BOL_RETURNS },
    { label: 'bol.com — Bezorgen en ontvangen', url: BOL_DELIVERY },
    {
      label: 'PassaSports — Bestellen en betalen (verzend- en retourkosten)',
      url: PASSA_ORDERING,
    },
    { label: 'PassaSports — Ruilen en retourneren', url: PASSA_RETURNS },
    { label: 'PassaSports — Over PassaSports', url: PASSA_ABOUT },
    { label: 'Plutosport — Bezorgen en afhalen (verzendkosten)', url: PLUTO_DELIVERY },
    { label: 'Plutosport — Retourneren', url: PLUTO_RETURNS },
    { label: 'HockeyCity — Klantenservice (verzendkosten en bezorging)', url: HOCKEYCITY_SERVICE },
    { label: 'HockeyCity — Verzenden en retourneren', url: HOCKEYCITY_RETURNS },
    { label: 'HockeyCity — Over HockeyCity', url: HOCKEYCITY_ABOUT },
    { label: 'Daisycon — Campagne Daka.nl (verzendkosten)', url: DAKA_CAMPAIGN },
    { label: 'Daka — Productfeed via Daisycon (verzendkosten en bezorging per product), gelezen op 4 november 2026' },
    {
      label:
        'Aantallen sticks per winkel: de catalogus van jouwhockeystick.nl, met per stick de gecontroleerde winkels',
    },
  ],
  metaDescription:
    'Een hockeystick koop je overal. Via jouwhockeystick.nl bestel je bij bol.com, PassaHockey, Plutosport, HockeyCity of Daka: de verschillen in verzendkosten, retourneren en bezorging.',
};
