import type { Product } from '../types';

// Grays mid-range field stick. Shape, lengths, price, image and (where stated)
// level from Grays' own product page; carbon only where shops state it
// explicitly. bol.com supplies stock and the shop link only (its Grays
// listings show default values that contradict Grays). See decision log
// 2026-10-13.
const PAGE =
  'https://www.grays-hockey.eu/collections/ac-aerocore-composite-hockey-sticks/products/ac500-dynabow-s-composite-hockey-stick';
const BOL =
  'https://www.bol.com/nl/nl/p/grays-ac500-dynabow-s-hockeystick/9300000235099902/';
const CHECKED = '2026-10-13';

export const graysAc500DynabowS: Product = {
  slug: 'grays-ac500-dynabow-s',
  brand: 'Grays',
  name: 'Grays AC500 Dynabow-S',
  dataStatus: 'verified',
  bolProductUrl: BOL,
  imageAlt: 'Grays AC500 Dynabow-S hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HAAG25Composite_20Sticks_20AC500_20Dynabow-S_20Black_20Orange_20Main.jpg?v=1744209359',
  imageSourceUrl: PAGE,
  discipline: {
    value: 'veld',
    source: 'brand-website',
    sourceLabel: 'Grays plaatst dit model bij de composiet-veldhockeysticks.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  // Also sold at PassaSports (checked 2026-10-16): second shop button.
  passaSportsProductUrl:
    'https://www.passasports.nl/grays-ac500-dynabow-s-23246',
  experienceLevel: {
    value: 'gevorderd',
    source: 'brand-website',
    sourceLabel:
      'Grays noemt de AC500 "intermediate power with flexible composition for superior control".',
    sourceUrl: PAGE,
    modelYear: 2025,
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
      'Grays plaatst dit model in de Dynabow-familie (Bow: 24.75 @ 250 mm, Vertex-kop, Dynabow-S-profiel).',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  // carbonPercentage left out: Grays en de gevonden winkels noemen geen carbonpercentage.
  lengthsInches: {
    value: [36.5, 37.5],
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
      'Leverbaar bij bol.com op de controledatum (verkoper: Sporthuis.nl).',
    sourceUrl: BOL,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'De instap in de AeroCore-lijn van Grays: gemiddelde power met een soepele opbouw voor controle.',
  strengths: {
    value: [
      'Soepele opbouw voor controle, volgens Grays',
      'Een middenprijs met schuimkern',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: ['Carbonpercentage onbekend'],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
};
