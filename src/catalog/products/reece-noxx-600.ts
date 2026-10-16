import type { Product } from '../types';

// Specs from a bol.com listing (seller: Sporthuis.nl), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/reece-noxx-600-hockey-stick-hockeystick-maat-36-5/9300000227058830/';
const CHECKED = '2026-10-10';

export const reeceNoxx600: Product = {
  slug: 'reece-noxx-600',
  brand: 'Reece',
  name: 'Reece Noxx 600',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/reece-noxx-600-hockey-stick-hockeystick-maat-36-5/9300000227058830/',
  imageAlt: 'Reece Noxx 600 hockeystick',
  imageUrl: 'https://media.s-bol.com/BW9yBWOovjJX/98VpB0J/550x550.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'bol.com plaatst deze stick bij veldhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  // Also sold at PassaSports (checked 2026-10-16): second shop button.
  passaSportsProductUrl:
    'https://www.passasports.nl/reece-noxx-600-889287-8550',
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
    value: 'lowbow',
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Low bow" met een kromming van 24 mm.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 60,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 60 %".',
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
    value: 143.7,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel: 'Bol.com toonde op de controledatum "Sneller in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een low bow-veldstick van Reece met 60% carbon voor gevorderde spelers.',
  strengths: {
    value: [
      'Low bow met een middelhoog carbonpercentage',
      'Reece is in Nederland ook breed in juniormaten',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen in 36,5 inch gevonden',
      'Gegevens komen van een listing op bol.com, niet van Reece zelf',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
