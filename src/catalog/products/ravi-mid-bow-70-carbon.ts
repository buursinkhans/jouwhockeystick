import type { Product } from '../types';

// Specs from a bol.com listing (seller: Ravi), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/ravi-hockeystick-mid-bow-70-carbon-black-36-5/9300000196468789/';
const CHECKED = '2026-10-10';

export const raviMidBow70Carbon: Product = {
  slug: 'ravi-mid-bow-70-carbon',
  brand: 'Ravi',
  name: 'RAVI Hockeystick Mid Bow 70% Carbon',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/ravi-hockeystick-mid-bow-70-carbon-black-36-5/9300000196468789/',
  imageAlt: 'RAVI Hockeystick Mid Bow 70% Carbon hockeystick',
  imageUrl: 'https://media.s-bol.com/JnPBDRkv61Xg/kRK69lx/550x418.jpg',
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
      'De listing vermeldt "Niveau: Gevorderde" en "Doelgroep: Volwassenen".',
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
    value: 'midbow',
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Mid bow" met een kromming van 24,5 mm.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 70,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 70 %".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 36,5 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 160,
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
    'Een veldstick van Ravi met 70% carbon en een mid bow, voor gevorderde spelers die een directe stick met een rustige kromming zoeken.',
  strengths: {
    value: [
      'Combinatie van veel carbon en een mid bow',
      'Verkocht door Ravi zelf via bol.com',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Stijf door het hoge carbonpercentage',
      'Alleen in 36,5 inch gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
