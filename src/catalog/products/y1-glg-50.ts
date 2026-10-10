import type { Product } from '../types';

// Specs from a bol.com listing (seller: ekwip), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/y1-glg-50-hockeystick/9300000238225574/';
const CHECKED = '2026-10-10';

export const y1Glg50: Product = {
  slug: 'y1-glg-50',
  brand: 'Y1',
  name: 'Y1 GLG 50',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/y1-glg-50-hockeystick/9300000238225574/',
  passaSportsProductUrl: 'https://www.passasports.nl/y1-glg-50-st-glg-50-26',
  imageAlt: 'Y1 GLG 50 hockeystick',
  imageUrl: 'https://media.s-bol.com/NAZkjqyqNXlN/qjAwx13/492x840.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'bol.com plaatst deze stick bij veldhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'gevorderd',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Niveau: Gevorderde". PassaSports noemt de stijfheid "Allround".',
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
    value: 50,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 50 %".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'partner-shop',
    sourceLabel:
      'Maten waarvoor we op de controledatum een leverbare bol.com-listing vonden.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 163.99,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs op bol.com voor 36,5 inch op de controledatum (PassaSports: €135,95).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Uiterlijk 19 oktober in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een low bow-veldstick van Y1 met 50% carbon uit de collectie 2026/2027, voor gevorderde spelers.',
  strengths: {
    value: [
      'Gemiddeld carbonpercentage met een low bow',
      'Modeljaar bekend (collectie 2026/2027)',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Levertijd via bol.com volgens de listing ruim een week',
      'Bij bol.com duurder dan bij PassaSports op de controledatum',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
