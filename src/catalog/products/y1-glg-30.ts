import type { Product } from '../types';

// Specs from a bol.com listing (seller: Sporthuis.nl), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/y1-glg-30-hockeystick/9300000238225577/';
const CHECKED = '2026-10-10';

export const y1Glg30: Product = {
  slug: 'y1-glg-30',
  brand: 'Y1',
  name: 'Y1 GLG 30',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/y1-glg-30-hockeystick/9300000238225577/',
  passaSportsProductUrl: 'https://www.passasports.nl/y1-glg-30-st-glg-30-26',
  imageAlt: 'Y1 GLG 30 hockeystick',
  imageUrl: 'https://media.s-bol.com/7Kv3z5qzYLGy/Mj7O8rQ/492x840.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'bol.com plaatst deze stick bij veldhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Niveau: Beginner". PassaSports noemt de stijfheid "Allround".',
    sourceUrl: SOURCE,
    modelYear: 2026,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'De listing noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'lowbow',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Low bow"; PassaSports noemt een curve location van 21 cm.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 30,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 30 %".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5],
    source: 'partner-shop',
    sourceLabel: 'De bol.com-listing toont 36,5 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 129.95,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs op bol.com op de controledatum (PassaSports: €95,95).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Voor 23:59 uur besteld, woensdag in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een low bow-veldstick van Y1 met 30% carbon uit de collectie 2026/2027.',
  strengths: {
    value: [
      'Een low bow met weinig carbon: een rustige eerste kennismaking met een lage kromming',
      'Modeljaar bekend (collectie 2026/2027)',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Low bow vraagt meer techniek bij aannemen dan een mid bow',
      'Bij bol.com duurder dan bij PassaSports op de controledatum',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
