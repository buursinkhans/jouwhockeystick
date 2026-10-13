import type { Product } from '../types';

// Grays mid-range field stick. Shape, lengths, price, image and (where stated)
// level from Grays' own product page; carbon only where shops state it
// explicitly. bol.com supplies stock and the shop link only (its Grays
// listings show default values that contradict Grays). See decision log
// 2026-10-13.
const PAGE =
  'https://www.grays-hockey.eu/collections/pb-probow-composite-hockey-sticks/products/pb8-composite-hockey-stick';
const BOL =
  'https://www.bol.com/nl/nl/p/grays-probow-8-hockeystick/9300000236708019/';
const CHECKED = '2026-10-13';

export const graysPb8Composite: Product = {
  slug: 'grays-pb8-composite',
  brand: 'Grays',
  name: 'Grays PB 8 Composite',
  dataStatus: 'verified',
  bolProductUrl: BOL,
  imageAlt: 'Grays PB 8 Composite hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HAEC25Composite_20Sticks_20PB8_20Probow_20MC_20Black_20Hot_20Red_20Main.jpg?v=1744211488',
  imageSourceUrl: PAGE,
  discipline: {
    value: 'veld',
    source: 'brand-website',
    sourceLabel: 'Grays plaatst dit model bij de composiet-veldhockeysticks.',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'ervaren',
    source: 'brand-website',
    sourceLabel:
      'Grays noemt de PB 8 "tailored for athletes mastering advanced 3D skills".',
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
      'Grays plaatst dit model in de Probow-familie (Bow: 24.75 @ 200 mm, Micro-kop, "high-intensity bow layout").',
    sourceUrl: PAGE,
    lastVerifiedAt: CHECKED,
  },
  // carbonPercentage left out: Eén winkeloverzicht noemt 70%, maar dat is beperkt bevestigd; daarom niet ingevuld.
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
      'Leverbaar bij bol.com op de controledatum (verkoper: Pertina (37,5 inch; de 36,5-inchlisting was niet leverbaar)).',
    sourceUrl: BOL,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een Probow-stick van Grays voor spelers die 3D-vaardigheden beheersen.',
  strengths: {
    value: ['Probow: gemaakt voor 3D-acties', 'Ook in 38,5 inch'],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Carbonpercentage niet bevestigd',
      'Bij bol.com was op de controledatum alleen 37,5 inch leverbaar',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de productpagina van Grays.',
    lastVerifiedAt: CHECKED,
  },
};
