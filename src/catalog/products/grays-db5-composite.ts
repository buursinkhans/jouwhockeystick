import type { Product } from '../types';

// Specs from the official Grays product page; the bol.com listing is only used
// for bolProductUrl and the stock indication. The listing's carbon percentage
// (50 %), "Kinderen" target group and 32 inch length are not copied: the
// brand page does not state a carbon percentage and lists 36.5/37.5 inch.
const SOURCE = 'https://www.grays-hockey.eu/products/db5-composite-hockey-stick';
const BOL_SOURCE =
  'https://www.bol.com/nl/nl/p/grays-db-5-hockeystick-oceaanblauw-zilver/9300000304766066/';
const CHECKED = '2026-10-12';

export const graysDb5Composite: Product = {
  slug: 'grays-db5-composite',
  brand: 'Grays',
  name: 'Grays DB 5 Composite Hockey Stick',
  dataStatus: 'verified',
  bolProductUrl: BOL_SOURCE,
  imageAlt: 'Grays DB 5 Composite hockeystick',
  imageUrl:
    'https://www.grays-hockey.eu/cdn/shop/files/HAGE26Composite_20Sticks_20DB5_20Dynabow_20Hockey_20Stick_20Ocean_20Blue_20_20Silver.jpg?v=1779972181&width=1024',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'brand-website',
    sourceLabel:
      'Grays voert dit model in de collectie "DB Dynabow Composite Hockey Sticks" (veld).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'brand-website',
    sourceLabel:
      'Grays noemt een gemiddeld vermogen en "intermediate control" en omschrijft de stick als geschikt voor spelers in ontwikkeling en gevorderde spelers.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Grays noemt geen specifieke positie voor dit model.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'dynabow',
    source: 'brand-website',
    sourceLabel:
      'Grays noemt het "Dynabow" met een curvepositie van 24.75 @ 250mm.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'brand-website',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 120,
    source: 'brand-website',
    sourceLabel: 'Adviesprijs zoals vermeld op de officiële Grays-website.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum een levertijd ("Uiterlijk 21 oktober in huis").',
    sourceUrl: BOL_SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een Grays-veldstick met Dynabow-profiel en gemiddeld vermogen, die Grays omschrijft als geschikt voor spelers in ontwikkeling en gevorderde spelers.',
  strengths: {
    value: [
      'Dynabow-profiel: een middenweg tussen controle en slagkracht',
      'Kan passen bij spelers die van beginner richting gevorderd groeien',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Carbonpercentage en gewicht worden door Grays niet vermeld',
      'Alleen in 36,5" en 37,5" verkrijgbaar',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door Grays vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
