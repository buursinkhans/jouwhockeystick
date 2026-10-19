import type { Product } from '../types';

// Grays mid-range field stick. Shape, lengths, price, image and (where stated)
// level from Grays' own product page; carbon only where shops state it
// explicitly. bol.com supplies stock and the shop link only (its Grays
// listings show default values that contradict Grays). See decision log
// 2026-10-13.
const PAGE =
  'https://www.grays-hockey.eu/collections/ac-aerocore-composite-hockey-sticks/products/ac800-jumbow-s-composite-hockey-stick';
const BOL =
  'https://www.bol.com/nl/nl/p/grays-ac800-jumbow-s-hockeystick/9300000237647661/';
const CHECKED = '2026-10-13';

export const graysAc800JumbowS: Product = {
  slug: 'grays-ac800-jumbow-s',
  brand: 'Grays',
  name: 'Grays AC800 Jumbow-S',
  dataStatus: 'verified',
  bolProductUrl: BOL,
  imageAlt: 'Grays AC800 Jumbow-S hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HAAC25Composite_20Sticks_20AC800_20Jumbow-S_20Stick_20Black_20Red_20Main.jpg?v=1744209181',
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
    'https://www.passasports.nl/grays-ac800-jumbow-s-23243',
  experienceLevel: {
    value: 'ervaren',
    source: 'editorial-estimate',
    sourceLabel:
      'Grays noemt geen niveau ("designed for power and precision"). Ingeschat als ervaren: in de AeroCore-lijn heet de AC600 al "ideal for advanced gameplay", de AC800 zit daarboven.',
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
      'Grays plaatst dit model in de Jumbow-familie (Bow: 24.75 @ 200 mm, Vertex-kop, Jumbow-S-profiel); op deze site ingedeeld als low bow.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 80,
    source: 'partner-shop',
    sourceLabel:
      'PassaHockey (PassaSports) vermeldt "Carbonpercentage: 80%"; Grays noemt zelf geen percentage. bol.com toont 0%, een standaardwaarde die niet klopt voor een composietstick; die gebruiken we niet.',
    sourceUrl: 'https://www.passasports.nl/grays-ac800-jumbow-s-23243',
    lastVerifiedAt: '2026-10-19',
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'brand-website',
    sourceLabel: 'Maten die Grays op de productpagina aanbiedt.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 300,
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
    'Een AeroCore-stick van Grays met schuimkern en Jumbow-S-profiel, voor power en technische acties.',
  strengths: {
    value: [
      'Schuimkern voor stabiliteit en balans, volgens Grays',
      'Lage kromming voor liften en aerial/scoopen',
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
