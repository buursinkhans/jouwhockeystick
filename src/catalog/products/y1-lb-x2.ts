import type { Product } from '../types';

// Specs from a bol.com listing (seller: ekwip), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/y1-lb-x-2-hockeystick/9300000238225582/';
const CHECKED = '2026-10-10';

export const y1LbX2: Product = {
  slug: 'y1-lb-x2',
  brand: 'Y1',
  name: 'Y1 LB X.2',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/y1-lb-x-2-hockeystick/9300000238225582/',
  imageAlt: 'Y1 LB X.2 hockeystick',
  imageUrl: 'https://media.s-bol.com/VM8Or6JJQYLW/oYAp21z/492x840.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'bol.com plaatst deze stick bij veldhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'ervaren',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Niveau: Professional" en "Voor gevorderde spelers - Drag flicks" in de titel.',
    sourceUrl: SOURCE,
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
    sourceLabel: 'De listing vermeldt "Low bow" met een kromming van 24 mm.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 90,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 90 %".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [37.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 37,5 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 287.99,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum.',
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
    'Een low bow-topstick van Y1 met 90% carbon, volgens de listing bedoeld voor gevorderde spelers en sleeppushes.',
  strengths: {
    value: [
      'Veel carbon en een lage kromming voor technische spelers',
      'Y1 is een van de grotere merken bij Nederlandse hockeywinkels',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Stijf en specialistisch: geen logische eerste stick',
      'Alleen in 37,5 inch gevonden; levertijd volgens bol.com ruim een week',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
