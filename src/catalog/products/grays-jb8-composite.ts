import type { Product } from '../types';

// Grays mid-range field stick. Shape, lengths, price, image and (where stated)
// level from Grays' own product page; carbon only where shops state it
// explicitly. bol.com supplies stock and the shop link only (its Grays
// listings show default values that contradict Grays). See decision log
// 2026-10-13.
const PAGE =
  'https://www.grays-hockey.eu/collections/jb-jumbow-composite-hockey-sticks/products/jb8-composite-hockey-stick';
const BOL =
  'https://www.bol.com/nl/nl/p/grays-jumbow-8-hockeystick/9300000233640918/';
const CHECKED = '2026-10-13';

export const graysJb8Composite: Product = {
  slug: 'grays-jb8-composite',
  brand: 'Grays',
  name: 'Grays JB 8 Composite',
  dataStatus: 'verified',
  bolProductUrl: BOL,
  imageAlt: 'Grays JB 8 Composite hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HACC25Composite_20Sticks_20JB8_20Jumbow_20MX_20Black_20Blue_20Main.jpg?v=1744210415',
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
      'Grays noemt geen niveau ("designed for players who demand the best"). Ingeschat als gevorderd op basis van de plek in de Jumbow-lijn en 70% carbon.',
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Grays noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'lowbow',
    source: 'brand-website',
    sourceLabel:
      'Grays plaatst dit model in de Jumbow-familie (Bow: 24.75 @ 200 mm, Maxi-kop, "ideal for drag-flicking and aerial techniques"); op deze site ingedeeld als low bow.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 70,
    source: 'partner-shop',
    sourceLabel:
      'Jumbo Sports noemt expliciet 70% carbon; Grays zelf vermeldt geen percentage.',
    sourceUrl: 'https://www.jumbosports.com/grays-jumbow-8-3453356802',
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
      'Leverbaar bij bol.com op de controledatum (verkoper: Sporthuis.nl).',
    sourceUrl: BOL,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een Jumbow-stick van Grays met 70% carbon: een lage kromming voor liften, aerials en de sleeppush.',
  strengths: {
    value: [
      'Jumbow-profiel voor liften en aerials',
      'Carbonpercentage bevestigd door een winkel',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Lage kromming vraagt meer techniek bij de aanname',
      'Grays noemt geen niveau; dat is onze inschatting',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
};
