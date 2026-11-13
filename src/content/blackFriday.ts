import type { CampaignCard, CampaignEdition, PromoTiming, ShopPromo } from '@/lib/campaign';
import type { RetailerId } from '@/lib/retailers';

/**
 * /black-friday-hockey: one URL that comes back every year (decision log
 * 2026-11-10). Everything that changes per year or per shop lives here.
 *
 * A shop action changes? Edit its entry in BLACK_FRIDAY_PROMOS: set `kind`,
 * `name` (the shop's own name for the action, as on its page), `audience` (who
 * can use it, as the shop states it), the dates the shop states, `verifiedAt` (the day you checked the shop's own
 * page), a short `summary`, `conditions`, `sourceUrl` and `url`. Never a
 * percentage or a former price: we have no verifiable reference price
 * (CLAUDE.md, Commerce). A check older than 14 days shows as "nog niet
 * gecontroleerd"; after `lastDay` no action shows as running.
 *
 * Next year: set EDITION to the new dates, put every shop back on
 * 'niet-gecontroleerd' and check them again.
 */
export const BLACK_FRIDAY_EDITION: CampaignEdition = {
  year: 2026,
  day: '2026-11-27',
  lastDay: '2026-11-30',
  announceFrom: '2026-11-10',
};

export const BLACK_FRIDAY_PROMOS: readonly ShopPromo[] = [
  {
    retailer: 'bolcom',
    kind: 'black-friday',
    name: 'Black Friday',
    audience: null,
    status: 'gecontroleerd',
    // The page names no product groups and no hockey.
    categories: [],
    startsAt: null,
    endsAt: null,
    verifiedAt: '2026-11-10',
    summary: 'De Black Friday-pagina van bol.com staat online, met de eerste deals. Een begin- en einddatum staan er niet bij, en hockey wordt er niet apart genoemd.',
    conditions: 'Volgens bol.com gelden de voordelen niet voor het hele assortiment. Bij bol.com verkopen ook andere verkopers; kijk bij een stick wie de verkoper is.',
    sourceUrl: 'https://www.bol.com/nl/nl/sf/black-friday/',
    url: 'https://www.bol.com/nl/nl/sf/black-friday/',
  },
  {
    retailer: 'hockeycity',
    kind: 'sale',
    name: 'Sale',
    audience: null,
    status: 'gecontroleerd',
    categories: ['hockey'],
    startsAt: null,
    endsAt: null,
    verifiedAt: '2026-11-10',
    summary: 'HockeyCity heeft een sale-pagina met afgeprijsde hockeyartikelen. Een Black Friday-actie staat er niet bij, en ook geen einddatum.',
    conditions: null,
    sourceUrl: 'https://www.hockeycity.nl/sale/',
    url: 'https://www.hockeycity.nl/sale/',
  },
  {
    retailer: 'passasports',
    kind: 'black-friday',
    // The page's own words: "Black Friday aanbiedingen", for everyone from 20 November.
    name: 'Black Friday-aanbiedingen',
    audience: null,
    // Checked by the owner in the browser on 2026-11-10 (the page blocks automated reads).
    status: 'gecontroleerd',
    categories: ['hockey'],
    startsAt: '2026-11-20',
    endsAt: null,
    verifiedAt: '2026-11-10',
    summary: 'PassaHockey kondigt Black Friday-aanbiedingen aan vanaf vrijdag 20 november. Welke producten meedoen en tot wanneer, staat er nog niet bij.',
    conditions: 'Wie de nieuwsbrief van PassaSports heeft, krijgt de aanbiedingen volgens de winkel als eerste te zien.',
    sourceUrl: 'https://www.passasports.nl/hockey/Blackfriday',
    url: 'https://www.passasports.nl/hockey/Blackfriday',
  },
  {
    retailer: 'plutosport',
    kind: 'black-friday',
    // The page's own name and the code it needs (www.plutosport.nl/black-friday).
    name: 'Black Friday Early Access',
    audience: 'met een code via de nieuwsbrief',
    // Checked by the owner in the browser on 2026-11-10 (the page blocks automated reads).
    status: 'gecontroleerd',
    // "op alles", in the shop's words.
    categories: ['alles'],
    startsAt: '2026-11-06',
    endsAt: '2026-11-15',
    verifiedAt: '2026-11-10',
    summary: 'Plutosport heeft een Black Friday Early Access: wie zich aanmeldt voor de nieuwsbrief, krijgt een persoonlijke kortingscode. Volgens de winkel geldt die op het hele assortiment.',
    conditions: 'Alleen met de persoonlijke code, die je per mail krijgt na aanmelding. Nieuwsbriefleden kregen hem op 6 november. Uitzonderingen staan in de actievoorwaarden van Plutosport.',
    sourceUrl: 'https://www.plutosport.nl/black-friday',
    url: 'https://www.plutosport.nl/black-friday',
  },
  {
    retailer: 'daka',
    kind: 'geen',
    name: null,
    audience: null,
    // Checked by the owner in the browser on 2026-11-10; the owner checks daily.
    status: 'gecontroleerd',
    categories: [],
    startsAt: null,
    endsAt: null,
    verifiedAt: '2026-11-10',
    summary: 'Daka heeft nog geen Black Friday-actie aangekondigd. Zodra dat verandert, staat het hier.',
    conditions: null,
    sourceUrl: 'https://www.daka.nl/sale/hockey',
    url: 'https://www.daka.nl/sale/hockey',
  },
];

const nlDate = (date: string) =>
  new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));

export const formatNlDate = nlDate;

const { year, day, lastDay } = BLACK_FRIDAY_EDITION;

export const BLACK_FRIDAY = {
  path: '/black-friday-hockey',
  navLabel: 'Black Friday hockey',
  title: `Black Friday hockey ${year}: hockeysticks en hockeyschoenen vergelijken`,
  seoTitle: `Black Friday hockey ${year}: sticks en schoenen vergelijken`,
  metaDescription: `Black Friday is op ${nlDate(day)}. Zie welke hockeywinkels een actie hebben en vergelijk hockeysticks en hockeyschoenen op prijs bij meerdere winkels.`,
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-11-10',
  updatedAt: '2026-11-10',
  intro: {
    voor: `Black Friday ${year} is op vrijdag ${nlDate(day)}. Hier zie je welke hockeywinkels een actie hebben, wat die inhoudt en wanneer we dat hebben nagekeken. Daaronder vergelijk je hockeysticks en hockeyschoenen op de actuele prijs bij meerdere winkels, en lees je waar je op let, zodat je een stick koopt die past.`,
    actief: `Het is Black Friday-weekend, van ${nlDate(day)} tot en met Cyber Monday ${nlDate(lastDay)}. Hier zie je welke hockeywinkels een actie hebben en wanneer we dat hebben nagekeken. Daaronder vergelijk je hockeysticks en hockeyschoenen op de actuele prijs bij meerdere winkels, en lees je waar je op let.`,
    afgelopen: `Black Friday ${year} is voorbij: de acties van dat weekend gelden niet meer. Vergelijk hockeysticks en hockeyschoenen hieronder op de actuele prijs bij meerdere winkels; die prijzen werken we elke week bij. Volgend jaar staan de acties weer op deze pagina.`,
  },
  dateLine: {
    voor: `Black Friday: ${nlDate(day)}`,
    actief: `Black Friday-weekend: ${nlDate(day)} tot en met ${nlDate(lastDay)}`,
    afgelopen: `Black Friday ${year} is afgelopen`,
  },
  promise: 'Een goede Black Friday-aankoop is een stick die bij de speler past, voor een prijs die je kunt vergelijken.',
  routes: {
    heading: 'Waar ben je naar op zoek?',
    items: [
      { title: 'Hockeysticks', body: 'Veldsticks voor volwassenen, met prijzen bij meerdere winkels.', href: '#bf-sticks' },
      { title: 'Junior hockeysticks', body: 'Kortere sticks voor kinderen. Kies eerst de lengte.', href: '#bf-junior' },
      { title: 'Zaalhockeysticks', body: 'Sticks voor de zaal, met een keuzehulp op lengte en budget.', href: '#bf-zaal' },
      { title: 'Hockeyschoenen', body: 'Schoenen voor veld en zaal, met de prijs per winkel.', href: '#bf-schoenen' },
    ],
  },
  shops: {
    heading: 'Acties per winkel',
    intro: 'Per partnerwinkel staat hier wat de winkel zelf over zijn actie zegt en wanneer we dat hebben nagekeken. Kortingspercentages noemen we niet: dat doet de winkel op zijn eigen pagina, met de voorwaarden.',
    order: 'Volgorde: eerst lopende acties, dan aangekondigde, dan winkels zonder of met nog niet nagekeken actie; daarbinnen op naam. De vergoeding van een winkel speelt geen rol.',
    afgelopen: `De acties van Black Friday ${year} zijn afgelopen. Volgend jaar staan de nieuwe acties hier.`,
    kindLabel: {
      'black-friday': 'Black Friday-actie',
      sale: 'Sale',
      geen: 'Geen actie',
    },
  },
  products: {
    sticksHeading: 'Hockeysticks om te vergelijken',
    juniorHeading: 'Junior hockeysticks om te vergelijken',
    zaalHeading: 'Zaalhockeysticks om te vergelijken',
    shoesHeading: 'Hockeyschoenen met een actuele winkelprijs',
    intro: 'Deze sticks hebben bij minstens twee winkels een actuele prijs en zijn op voorraad. Per stick zie je de prijs inclusief verzendkosten, met de datum waarop we hem lazen. We tonen geen doorgestreepte prijzen: een betrouwbare eerdere prijs hebben we niet.',
    selection: 'Selectie: per groep drie merken, de sticks met de meeste gegevens van het merk zelf eerst. Geen ranking, en de vergoeding van een winkel speelt geen rol.',
    shoesIntro: 'Hockeyschoenen met minstens één actuele winkelprijs, een per merk. De prijs staat er met de datum waarop we hem lazen.',
    empty: 'Er zijn nu geen sticks in deze groep met een actuele prijs bij meerdere winkels.',
    more: { sticks: 'Alle veldsticks', zaal: 'Alle zaalsticks', schoenen: 'Alle hockeyschoenen' },
  },
  advice: {
    heading: 'Goed kopen tijdens Black Friday',
    intro: 'Een lage prijs helpt pas als de stick past. Check deze punten voor je bestelt; elk punt heeft een uitgebreidere uitleg.',
    items: [
      {
        title: 'Lengte eerst',
        body: 'Een stick die te lang of te kort is, speelt onhandig, hoe voordelig hij ook was. Volwassenen vanaf ongeveer 1,63 meter spelen meestal met 36,5 inch. Twijfel je bij een kind, kies dan niet de langere om in te groeien.',
        href: '/kennis/hockeystick-lengte-tabel',
        link: 'Lengtetabel',
      },
      {
        title: 'Hoeveel carbon heb je nodig?',
        body: 'Carbon maakt een stick stijver en directer, maar ook minder vergevingsgezind. Werk je nog aan je basis, dan is een stick met minder carbon vaak een fijn startpunt.',
        href: '/kennis/meer-carbon-hockeystick-beter',
        link: 'Over carbon',
      },
      {
        title: 'Kromming bij je spel',
        body: 'Een mid bow is rustig en voorspelbaar, fijn voor aannemen en vlak passen. Een low bow helpt bij lifts en 3D-acties, maar vraagt meer techniek.',
        href: '/kennis/low-bow-vs-mid-bow',
        link: 'Low bow of mid bow',
      },
      {
        title: 'Juniorstick: eenvoudig is genoeg',
        body: 'Voor een kind werkt een eenvoudige stick meestal het best: de juiste lengte, een rustig profiel en weinig of geen carbon.',
        href: '/kennis/hockeystick-kinderen-en-beginners',
        link: 'Sticks voor kinderen',
      },
      {
        title: 'Een stick als cadeau',
        body: 'Koop je een stick voor Sinterklaas of kerst zonder dat het kind erbij is? Vraag de lichaamslengte en of het veld of zaal speelt, en bewaar het bonnetje.',
        href: '/kennis/hockeystick-cadeau',
        link: 'Stick als cadeau',
      },
      {
        title: 'Veld of zaal',
        body: 'Een aparte zaalstick is niet verplicht: je veldstick is een prima start. Een zaalstick is vooral iets voor wie vaker de zaal in gaat.',
        href: '/kennis/veldstick-zaalhockey',
        link: 'Veldstick in de zaal',
      },
      {
        title: 'Hockeyschoenen: begin bij de ondergrond',
        body: 'Kies eerst veld of zaal, dan het soort kunstgras, dan hoe je voet past. Budget en kleur komen als laatste.',
        href: '/kennis/welke-hockeyschoenen-heb-je-nodig',
        link: 'Welke hockeyschoenen',
      },
    ],
    stickwijzer: 'Weet je niet welke stick past? De stickwijzer geeft in een paar minuten een richting, met de redenen erbij.',
  },
  faq: {
    heading: 'Veelgestelde vragen over Black Friday en hockey',
    items: [
      {
        question: `Wanneer is Black Friday ${year}?`,
        answer: `Black Friday ${year} is op vrijdag ${nlDate(day)}. De maandag erna, ${nlDate(lastDay)}, heet Cyber Monday. Welke dagen een actie precies loopt, bepaalt elke winkel zelf.`,
      },
      {
        question: 'Wanneer beginnen de Black Friday-aanbiedingen voor hockey?',
        answer: 'Dat verschilt per winkel. Plutosport had al een Early Access met een persoonlijke code, tot en met 15 november. PassaHockey kondigt zijn Black Friday-aanbiedingen aan vanaf vrijdag 20 november. bol.com had zijn Black Friday-pagina op 10 november al online, zonder begin- en einddatum. Bij de andere winkels noemen we een datum zodra de winkel die zelf vermeldt en we die hebben nagekeken.',
      },
      {
        question: 'Zijn hockeysticks tijdens Black Friday echt goedkoper?',
        answer: 'Dat verschilt per stick en per winkel. Kortingspercentages tonen we niet, omdat we geen betrouwbare eerdere prijs hebben. Wat je wel ziet: de actuele prijs per winkel inclusief verzendkosten, met de datum waarop we hem lazen. Zo vergelijk je zelf.',
      },
      {
        question: 'Zijn er ook aanbiedingen voor junior hockeysticks?',
        answer: 'Juniorsticks met een actuele prijs bij meerdere winkels staan op deze pagina. Kies eerst de juiste lengte met de [lengtetabel](/kennis/hockeystick-lengte-tabel): een te lange stick om in te groeien is geen voordeel.',
      },
      {
        question: 'Zijn zaalhockeysticks in de aanbieding?',
        answer: 'Zaalsticks met een actuele prijs bij meerdere winkels staan hierboven. Alle zaalsticks, met een keuzehulp op lengte en budget, vind je op [zaalhockeysticks](/zaalsticks).',
      },
      {
        question: 'Welke hockeywinkels staan op deze pagina?',
        answer: 'De vijf partnerwinkels van jouwhockeystick.nl: bol.com, PassaHockey (PassaSports), Plutosport, HockeyCity en Daka. Per winkel staat erbij of we de actie hebben nagekeken en wanneer. Het verschil tussen de winkels lees je in [waar koop je een hockeystick](/kennis/waar-koop-je-een-hockeystick).',
      },
      {
        question: 'Zijn hockeyschoenen ook afgeprijsd?',
        answer: 'Dat bepaalt elke winkel zelf. Hockeyschoenen met een actuele winkelprijs staan op deze pagina; op de pagina van een schoen zie je de prijs per winkel en welke maten op voorraad zijn.',
      },
      {
        question: 'Hoe weet je of een aanbieding echt voordelig is?',
        answer: 'Vergelijk de totaalprijs inclusief verzendkosten bij meerdere winkels, en kijk of jouw lengte of maat op voorraad is. Noemt een winkel een korting, dan moet die volgens de wet uitgaan van het minste dat de winkel er in de 30 dagen daarvoor voor vroeg. Past de stick niet bij de speler, dan is hij voor jou niet voordelig.',
      },
    ],
  },
  transparency:
    'jouwhockeystick.nl verkoopt zelf niets. We vergelijken sticks en schoenen bij vijf partnerwinkels en krijgen een vergoeding als je via onze link koopt. Die vergoeding speelt geen rol in de volgorde van de winkels, de selectie van de sticks of ons advies.',
  campaignNote: `Black Friday is op ${nlDate(day)}: zie welke hockeywinkels een actie hebben.`,
  /** The band under the homepage hero (CampaignBand) and the links in the search block and the top bar. */
  homeBand: {
    eyebrow: { bezig: 'Black Friday · nu al bezig', datum: `Black Friday · ${nlDate(day).replace(` ${year}`, '')}` },
    /** Without a current Black Friday action (or without a check of the last 14 days). */
    emptyHeading: `Black Friday is op ${nlDate(day).replace(` ${year}`, '')}`,
    emptyLine: 'Zie per winkel of er een actie is, en vergelijk hockeysticks en hockeyschoenen op prijs.',
    cta: 'Bekijk de acties',
    stickwijzer: { prefix: 'Eerst weten welke stick je nodig hebt?', label: 'Doe de stickwijzer' },
  },
  shortcutLabel: 'Black Friday',
  barLabel: 'Black Friday-acties',
} as const;

/* ---------- dynamic texts (decision log 2026-11-10, second version) ---------- */

const MONTHS_SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const shortDate = (date: string) => `${Number(date.slice(8, 10))} ${MONTHS_SHORT[Number(date.slice(5, 7)) - 1]}`;
const dayMonth = (date: string) => nlDate(date).replace(/ \d{4}$/, '');

/** "Plutosport Black Friday Early Access", or the shop alone without a name of its own. */
export const actionName = (promo: ShopPromo, shop: string) => (promo.name ? `${shop} ${promo.name}` : shop);

const CATEGORY_TEXT: Record<ShopPromo['categories'][number], string> = {
  alles: 'het hele assortiment',
  hockey: 'hockey',
  hockeysticks: 'hockeysticks',
  hockeyschoenen: 'hockeyschoenen',
};
/** "op het hele assortiment", only when the shop states it. */
export const categoryText = (promo: ShopPromo) =>
  promo.categories.length ? `op ${promo.categories.map((c) => CATEGORY_TEXT[c]).join(' en ')}` : null;

const joinNl = (items: readonly string[]) =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} en ${items[items.length - 1]}`;

/** The urgent part of a line on the card: "stopt over 5 dagen (t/m 15 nov)", "begint 20 nov". */
export function cardTimingText(timing: CampaignCard['urgent'][number]['timing']): string {
  switch (timing.kind) {
    case 'laatste-dag':
      return 'laatste dag';
    case 'stopt':
      return timing.days === 1 ? 'stopt morgen' : `stopt over ${timing.days} dagen (t/m ${shortDate(timing.endsAt)})`;
    case 'begint':
      return timing.days === 1 ? 'begint morgen' : `begint ${shortDate(timing.startsAt)}`;
  }
}

export type CardText = {
  eyebrow: string;
  heading: string;
  /** The first line shows on every screen, the rest from tablet width. */
  lines: string[];
  /** "Nagekeken op 10 november bij de winkels zelf.", or null without a check of the last 14 days. */
  checked: string | null;
};

/** The texts of the homepage card, from campaignCard(). Shops without a Black Friday action are never named. */
export function cardText(card: CampaignCard, label: (retailer: RetailerId) => string): CardText {
  const total = card.running + card.announced;
  const band = BLACK_FRIDAY.homeBand;
  if (total === 0 || !card.lastCheck) {
    return { eyebrow: band.eyebrow.datum, heading: band.emptyHeading, lines: [band.emptyLine], checked: null };
  }
  const shops = total === 1 ? 'hockeywinkel' : 'hockeywinkels';
  const has = total === 1 ? 'heeft' : 'hebben';
  const heading =
    card.running === total
      ? `${total} ${shops} ${has} nu een Black Friday-actie`
      : card.running === 0
        ? `${total} ${shops} ${has} een Black Friday-actie aangekondigd`
        : `${total} ${shops} ${has} een Black Friday-actie`;
  const urgent = card.urgent.map(({ promo, timing }) => {
    const shop = label(promo.retailer);
    const who = timing.kind === 'begint' ? shop : actionName(promo, shop);
    const sep = timing.kind === 'laatste-dag' ? ': ' : ' ';
    return `${who}${sep}${cardTimingText(timing)}${promo.audience ? `, ${promo.audience}` : ''}`;
  });
  const shopLine = `${card.running > 0 ? 'Nu bezig bij' : 'Bij'} ${joinNl(card.shops.map(label))}.`;
  return {
    eyebrow: card.running > 0 ? band.eyebrow.bezig : band.eyebrow.datum,
    heading,
    lines: urgent.length ? [urgent[0] ?? '', ...urgent.slice(1, 2), shopLine] : [shopLine],
    checked: `Nagekeken op ${dayMonth(card.lastCheck)} bij de winkels zelf.`,
  };
}

/** The status of a shop on /black-friday-hockey: "Nu bezig, stopt over 5 dagen (t/m 15 november)". */
export function pageTimingText(timing: PromoTiming): string {
  switch (timing.kind) {
    case 'laatste-dag':
      return 'Nu bezig, laatste dag';
    case 'stopt':
      return `Nu bezig, stopt ${timing.days === 1 ? 'morgen' : `over ${timing.days} dagen`} (t/m ${dayMonth(timing.endsAt)})`;
    case 'loopt':
      return 'Nu bezig';
    case 'begint':
      return timing.days === 1 ? 'Begint morgen' : `Begint op ${dayMonth(timing.startsAt)}`;
    case 'aangekondigd':
      return 'Aangekondigd';
    case 'afgelopen':
      return 'Afgelopen';
    case 'geen':
      return 'Geen actie gevonden';
    case 'onbekend':
      return 'Nog niet nagekeken';
  }
}
