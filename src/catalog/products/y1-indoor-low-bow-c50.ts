import type { Product } from '../types';

// Specs from PassaHockey (product page, later its TradeTracker product feed),
// not from the brand's own site. bol.com does not sell this model (checked
// 2026-10-10). On 2026-10-17 the 2026/2027 version (st-inl-c-26) had left the
// feed; on the owner's instruction the stick now points to the 2025/2026
// version "Y1 Indoor IL.C50" (st-inl-c5-25), with its sizes, price and photo.
const SOURCE = 'https://www.passasports.nl/y1-indoor-ilc50-st-inl-c5-25';
const OLD_SOURCE = 'https://www.passasports.nl/y1-indoor-low-bow-c50-st-inl-c-26';
const CHECKED = '2026-10-17';
const BOL_CHECKED = '2026-10-10';

export const y1IndoorLowBowC50: Product = {
  slug: 'y1-indoor-low-bow-c50',
  brand: 'Y1',
  name: 'Y1 Indoor Low Bow C50',
  dataStatus: 'verified',
  bolNotSold: { checkedAt: BOL_CHECKED },
  passaSportsProductUrl: SOURCE,
  imageAlt: 'Y1 Indoor Low Bow C50 (IL.C50) zaalhockeystick',
  imageUrl: 'https://cdn.sportshop.com/catalog/product/600/600/2/4/241672_1.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'zaal',
    source: 'partner-shop',
    sourceLabel: 'PassaSports plaatst deze stick bij zaalhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'editorial-estimate',
    sourceLabel:
      'PassaHockey vermeldt geen niveau. Ingeschat als gevorderd op basis van de low bow en de prijs.',
    modelYear: 2025,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'De productpagina noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'lowbow',
    source: 'partner-shop',
    sourceLabel:
      'De pagina van de 2026/2027-uitvoering vermeldde "Type Kromming: Low Bow"; de 2025/2026-uitvoering heet IL.C50 (Indoor Low).',
    sourceUrl: OLD_SOURCE,
    lastVerifiedAt: '2026-10-10',
  },
  // carbonPercentage left out: PassaSports vermeldt geen carbonpercentage; "C50" in de naam nemen we niet over als percentage.
  lengthsInches: {
    value: [37.5],
    source: 'partner-shop',
    sourceLabel:
      'Maten die PassaHockey volgens de productfeed op de controledatum leverbaar had.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 124.95,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs bij PassaHockey volgens de productfeed op de controledatum.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'De productfeed van PassaHockey meldde op de controledatum "in stock".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een low bow-zaalstick van Y1 (IL.C50, collectie 2025/2026), voor spelers die in de zaal willen liften en slepen.',
  strengths: {
    value: [
      'Lage kromming voor technische zaalspelers',
      'Modeljaar bekend (collectie 2025/2026)',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door PassaHockey vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Carbonpercentage niet vermeld',
      'Niet bij bol.com te koop, wel bij PassaHockey',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de door PassaHockey vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
