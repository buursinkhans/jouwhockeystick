import type { Product } from '../types';

// Specs from a bol.com listing (seller: Ravi), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/ravi-hockeystick-pro-bow-50-carbon-green-36-5/9300000196464317/';
const CHECKED = '2026-10-10';

export const raviProBow50Carbon: Product = {
  slug: 'ravi-pro-bow-50-carbon',
  brand: 'Ravi',
  name: 'RAVI Hockeystick Pro Bow 50% Carbon',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/ravi-hockeystick-pro-bow-50-carbon-green-36-5/9300000196464317/',
  imageAlt: 'RAVI Hockeystick Pro Bow 50% Carbon hockeystick',
  imageUrl: 'https://media.s-bol.com/BMn0yPqLRqO2/L9DAKBj/550x433.jpg',
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
  // bowProfile left out: De titel noemt "Pro bow", de specificaties "Mid bow" (24,5 mm); omdat die elkaar tegenspreken, vullen we geen bow-profiel in.
  carbonPercentage: {
    value: 50,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 50 %".',
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
    'Een veldstick van Ravi met 50% carbon voor gevorderde spelers; het bow-profiel is in de listing niet eenduidig.',
  strengths: {
    value: [
      'Gemiddeld carbonpercentage voor €120',
      'Verkocht door Ravi zelf via bol.com',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Titel en specificaties noemen een verschillend bow-profiel',
      'Alleen in 36,5 inch gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
