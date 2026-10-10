import type { Product } from '../types';

// Specs from a bol.com listing (seller: Hockey- en Padelbrouwerij), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/grays-jb3xi-jumbow-senior-hockeystick-navy-blauw-magenta/9300000304766257/';
const CHECKED = '2026-10-10';

export const graysJb3xiJumbowIndoor: Product = {
  slug: 'grays-jb3xi-jumbow-indoor',
  brand: 'Grays',
  name: 'Grays JB3Xi Jumbow Senior Indoor',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/grays-jb3xi-jumbow-senior-hockeystick-navy-blauw-magenta/9300000304766257/',
  imageAlt: 'Grays JB3Xi Jumbow Senior Indoor hockeystick',
  imageUrl: 'https://media.s-bol.com/nwPWpY2q739p/w0Z6BPJ/550x543.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'zaal',
    source: 'partner-shop',
    sourceLabel: 'bol.com plaatst deze stick bij zaalhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Niveau: Beginner" en "Doelgroep: Volwassenen".',
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
    sourceLabel:
      'De listing vermeldt "Low bow" met een kromming van 25 mm (Grays noemt het Jumbow).',
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
    value: [37.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 37,5 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 99.95,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum.',
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
  summary: 'Een low bow-zaalstick van Grays met 30% carbon, in 37,5 inch.',
  strengths: {
    value: [
      'Lage kromming voor wie in de zaal wil liften en slepen',
      'Onder €100',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'De listing noemt "Beginner", maar een low bow vraagt meer techniek',
      'Alleen in 37,5 inch gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
