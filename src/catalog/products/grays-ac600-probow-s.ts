import type { Product } from '../types';

// Grays mid-range field stick. Shape, lengths, price, image and (where stated)
// level from Grays' own product page; carbon only where shops state it
// explicitly. bol.com supplies stock and the shop link only (its Grays
// listings show default values that contradict Grays). See decision log
// 2026-10-13.
const PAGE =
  'https://www.grays-hockey.eu/collections/ac-aerocore-composite-hockey-sticks/products/ac600-probow-s-composite-hockey-stick';
const BOL =
  'https://www.bol.com/nl/nl/p/grays-ac600-probow-s-hockeystick/9300000237647664/';
const CHECKED = '2026-10-13';

export const graysAc600ProbowS: Product = {
  slug: 'grays-ac600-probow-s',
  brand: 'Grays',
  name: 'Grays AC600 Probow-S',
  dataStatus: 'verified',
  bolProductUrl: BOL,
  imageAlt: 'Grays AC600 Probow-S hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HAAF25Composite_20Sticks_20AC600_20Probow-S_20Black_20Pink_20Main.jpg?v=1744209337',
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
    'https://www.passasports.nl/grays-ac600-probow-s-23245',
  experienceLevel: {
    value: 'ervaren',
    source: 'brand-website',
    sourceLabel:
      'Grays noemt de schuimkern van de AC600 "ideal for advanced gameplay" en de stick "designed for dynamic players".',
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
    value: 'probow',
    source: 'brand-website',
    sourceLabel:
      'Grays plaatst dit model in de Probow-familie (Bow: 24.75 @ 200 mm, Apex-kop, Probow-S-profiel voor 3D, sleeppush en aerial/scoopen).',
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
    value: 200,
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
      'Leverbaar bij bol.com op de controledatum (verkoper: Pertina).',
    sourceUrl: BOL,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een AeroCore-stick van Grays met Probow-S-profiel, voor 3D-acties, aerial/scoopen en de sleeppush.',
  strengths: {
    value: [
      'Probow-S: gemaakt voor 3D en aerial/scoopen',
      'Schuimkern voor stabiliteit, volgens Grays',
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
