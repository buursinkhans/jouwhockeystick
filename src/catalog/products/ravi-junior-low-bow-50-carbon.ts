import type { Product } from '../types';

// Specs from a bol.com listing (seller: Ravi), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/ravi-hockeystick-junior-low-bow-50-carbon-black-35/9300000196450129/';
const CHECKED = '2026-10-10';

export const raviJuniorLowBow50Carbon: Product = {
  slug: 'ravi-junior-low-bow-50-carbon',
  brand: 'Ravi',
  name: 'RAVI Hockeystick Junior Low Bow 50% Carbon',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/ravi-hockeystick-junior-low-bow-50-carbon-black-35/9300000196450129/',
  imageAlt: 'RAVI Hockeystick Junior Low Bow 50% Carbon hockeystick',
  imageUrl: 'https://media.s-bol.com/gqkqP7lLJPkD/lYL8gjr/550x418.jpg',
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
      'De listing vermeldt "Niveau: Professional" en "Doelgroep: Kinderen".',
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
    sourceLabel: 'De listing vermeldt "Low bow" met een kromming van 24,75 mm.',
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
    value: [35],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 35 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 120,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Uiterlijk 15 oktober in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een junior-veldstick van Ravi met 50% carbon en low bow, bedoeld voor ervaren jeugdspelers.',
  strengths: {
    value: [
      'Een van de weinige juniorsticks voor ervaren spelers in onze catalogus',
      'Low bow voor jeugdspelers die liften en 3D-acties oefenen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Stijver en minder vergevingsgezind dan een eerste stick',
      'Alleen in 35 inch gevonden; gegevens van een listing op bol.com, geen modeljaar vermeld',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
