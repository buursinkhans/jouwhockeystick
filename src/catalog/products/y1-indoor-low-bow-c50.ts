import type { Product } from '../types';

// Specs from the PassaSports product page, not from the brand's own site.
// bol.com does not sell this model (checked 2026-10-10); the PassaSports
// affiliate link is still being set up, so there is no shop button yet.
const SOURCE = 'https://www.passasports.nl/y1-indoor-low-bow-c50-st-inl-c-26';
const CHECKED = '2026-10-10';

export const y1IndoorLowBowC50: Product = {
  slug: 'y1-indoor-low-bow-c50',
  brand: 'Y1',
  name: 'Y1 Indoor Low Bow C50',
  dataStatus: 'verified',
  bolNotSold: { checkedAt: CHECKED },
  passaSportsProductUrl:
    'https://www.passasports.nl/y1-indoor-low-bow-c50-st-inl-c-26',
  imageAlt: 'Y1 Indoor Low Bow C50 hockeystick',
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
      'PassaSports vermeldt geen niveau. Ingeschat als gevorderd op basis van de low bow en de prijs.',
    modelYear: 2026,
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
    sourceLabel: 'PassaSports vermeldt "Type Kromming: Low Bow".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  // carbonPercentage left out: PassaSports vermeldt geen carbonpercentage; "C50" in de naam nemen we niet over als percentage.
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'partner-shop',
    sourceLabel:
      'Maten die PassaSports op de controledatum als leverbaar toonde.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 139.95,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs bij PassaSports op de controledatum.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'PassaSports toonde op de controledatum leverbare maten ("Vandaag besteld, maandag in huis").',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een low bow-zaalstick van Y1 uit de collectie 2026/2027, voor spelers die in de zaal willen liften en slepen.',
  strengths: {
    value: [
      'Lage kromming voor technische zaalspelers',
      'Modeljaar bekend (collectie 2026/2027)',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Carbonpercentage niet vermeld',
      'Alleen bij PassaSports gevonden; nog geen bestelkoppeling',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op PassaSports vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
