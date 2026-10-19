import type { Product } from '../types';

// Grays mid-range field stick. Shape, lengths, price, image and (where stated)
// level from Grays' own product page; carbon only where shops state it
// explicitly. bol.com supplies stock and the shop link only (its Grays
// listings show default values that contradict Grays). See decision log
// 2026-10-13.
const PAGE =
  'https://www.grays-hockey.eu/collections/db-dynabow-composite-hockey-sticks/products/db8-composite-hockey-stick-blue';
const BOL =
  'https://www.bol.com/nl/nl/p/grays-dynabow-8-hockeystick/9300000233640910/';
const CHECKED = '2026-10-13';

export const graysDb8Composite: Product = {
  slug: 'grays-db8-composite',
  brand: 'Grays',
  name: 'Grays DB 8 Composite',
  dataStatus: 'verified',
  bolProductUrl: BOL,
  imageAlt: 'Grays DB 8 Composite hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HABD25Composite_20Sticks_20DB8_20Dynabow_20MC_20Black_20Blue_20Main.jpg?v=1744209993',
  imageSourceUrl: PAGE,
  discipline: {
    value: 'veld',
    source: 'brand-website',
    sourceLabel: 'Grays plaatst dit model bij de composiet-veldhockeysticks.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'editorial-estimate',
    sourceLabel:
      'Grays noemt op de productpagina geen niveau. Ingeschat als gevorderd: in de Dynabow-lijn zit de DB 8 tussen de DB 6 en de DB 10 ("preferred by top international players"), en winkels noemen 70% carbon.',
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Grays noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'dynabow',
    source: 'brand-website',
    sourceLabel:
      'Grays plaatst dit model in de Dynabow-familie (Bow: 24.75 @ 250 mm, Micro-kop).',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 70,
    source: 'partner-shop',
    sourceLabel:
      'Twee gespecialiseerde winkels (HockeyDirect en De Hockeywinkel) noemen expliciet 70% carbon; Grays zelf vermeldt geen percentage. PassaHockey vermeldt ook 70% (gecontroleerd 2026-10-19).',
    sourceUrl: 'https://www.hockeydirect.nl/grays-dynabow-8-27035',
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5, 37.5, 38.5],
    source: 'brand-website',
    sourceLabel: 'Maten die Grays op de productpagina aanbiedt.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 240,
    source: 'brand-website',
    sourceLabel:
      'Adviesprijs van Grays op de controledatum; bij bol.com kan de prijs afwijken.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Leverbaar bij bol.com op de controledatum (verkoper: Hockey- en Padelbrouwerij, "Voor 23:59 uur besteld, woensdag in huis").',
    sourceUrl: BOL,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een allround Dynabow-stick van Grays met 70% carbon, voor spelers die de basis beheersen en een directere stick zoeken.',
  strengths: {
    value: [
      'Dynabow: een allround profiel tussen mid en low bow in',
      'Carbonpercentage bevestigd door twee winkels',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Grays noemt geen niveau; dat is onze inschatting',
      'Geen modeljaar op de productpagina',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
};
