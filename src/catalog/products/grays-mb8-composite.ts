import type { Product } from '../types';

// Grays mid-range field stick. Shape, lengths, price, image and (where stated)
// level from Grays' own product page; carbon only where shops state it
// explicitly. bol.com supplies stock and the shop link only (its Grays
// listings show default values that contradict Grays). See decision log
// 2026-10-13.
const PAGE =
  'https://www.grays-hockey.eu/collections/mb-midbow-composite-hockey-sticks/products/mb8-composite-hockey-stick';
const BOL =
  'https://www.bol.com/nl/nl/p/grays-midbow-8-hockeystick/9300000233683785/';
const CHECKED = '2026-10-13';

export const graysMb8Composite: Product = {
  slug: 'grays-mb8-composite',
  brand: 'Grays',
  name: 'Grays MB 8 Composite',
  dataStatus: 'verified',
  bolProductUrl: BOL,
  passaSportsProductUrl: 'https://www.passasports.nl/grays-midbow-8-23266',
  imageAlt: 'Grays MB 8 Composite hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HADA25Composite_20Sticks_20MB8_20Midbow_20MC_20Black_20White_20Main.jpg?v=1744210776',
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
      'Grays noemt geen niveau ("for athletes striving for excellence"). Ingeschat als gevorderd: in de Midbow-lijn is de MB 7 "intermediate power", de MB 8 zit daarboven.',
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
      'Grays plaatst dit model in de Midbow-familie (Bow: 24.75 @ 300 mm, Micro-kop, "Midbow profile with a concaved spine for stability and control").',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 70,
    source: 'partner-shop',
    sourceLabel:
      'PassaHockey (PassaSports) vermeldt "Carbonpercentage: 70%"; Grays noemt zelf geen percentage. bol.com toont 0%, een standaardwaarde die niet klopt voor een composietstick; die gebruiken we niet.',
    sourceUrl: 'https://www.passasports.nl/grays-midbow-8-23266',
    lastVerifiedAt: '2026-10-19',
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
      'Leverbaar bij bol.com op de controledatum (verkoper: Pertina).',
    sourceUrl: BOL,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een Midbow-stick van Grays met de nadruk op stabiliteit en controle, voor spelers die de basis beheersen.',
  strengths: {
    value: [
      'Midbow: rustig en voorspelbaar bij aannemen en passen',
      'Ook in 38,5 inch',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Grays vermeldt het carbonpercentage zelf niet; het komt van PassaHockey',
      'Grays noemt geen niveau; dat is onze inschatting',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
};
