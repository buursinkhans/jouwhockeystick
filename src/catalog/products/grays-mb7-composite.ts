import type { Product } from '../types';

// Grays mid-range field stick. Shape, lengths, price, image and (where stated)
// level from Grays' own product page; carbon only where shops state it
// explicitly. bol.com supplies stock and the shop link only (its Grays
// listings show default values that contradict Grays). See decision log
// 2026-10-13.
const PAGE =
  'https://www.grays-hockey.eu/collections/mb-midbow-composite-hockey-sticks/products/mb7-composite-hockey-stick';
const BOL =
  'https://www.bol.com/nl/nl/p/grays-mb-7-hockeystick-36-5-inch/9300000233402088/';
const CHECKED = '2026-10-13';

export const graysMb7Composite: Product = {
  slug: 'grays-mb7-composite',
  brand: 'Grays',
  name: 'Grays MB 7 Composite',
  dataStatus: 'verified',
  bolProductUrl: BOL,
  passaSportsProductUrl:
    'https://www.passasports.nl/grays-midbow-7-23267',
  imageAlt: 'Grays MB 7 Composite hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HADB25Composite_20Sticks_20MB7_20Midbow_20MC_20Black_20Blue_20Main.jpg?v=1744210985',
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
    source: 'brand-website',
    sourceLabel:
      'Grays noemt de MB 7 "intermediate power paired with exceptional control".',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Grays noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'midbow',
    source: 'brand-website',
    sourceLabel:
      'Grays plaatst dit model in de Midbow-familie (Bow: 24.75 @ 300 mm, Micro-kop, "Midbow blade for maximum stability").',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  // carbonPercentage left out: Winkels spreken elkaar tegen (50% en 70%); daarom niet ingevuld.
  lengthsInches: {
    value: [36.5, 37.5, 38.5],
    source: 'brand-website',
    sourceLabel: 'Maten die Grays op de productpagina aanbiedt.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 180,
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
      'Leverbaar bij bol.com op de controledatum (verkoper: Recs Sport).',
    sourceUrl: BOL,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een Midbow-stick van Grays met gemiddelde power en veel controle: een rustige stap omhoog.',
  strengths: {
    value: [
      'Midbow met veel controle',
      'Een middenprijs voor een composietstick van Grays',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: ['Carbonpercentage niet eenduidig'],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
};
