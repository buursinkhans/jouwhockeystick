import type { Product } from '../types';

// Specs from a bol.com listing (seller: Hockey- en Padelbrouwerij), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/grays-200i-ultrabow-senior-indoor-hockeystick/9300000194376662/';
const CHECKED = '2026-10-10';

export const grays200iUltrabowIndoor: Product = {
  slug: 'grays-200i-ultrabow-indoor',
  brand: 'Grays',
  name: 'Grays 200i Ultrabow Senior Indoor',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/grays-200i-ultrabow-senior-indoor-hockeystick/9300000194376662/',
  imageAlt: 'Grays 200i Ultrabow Senior Indoor hockeystick',
  imageUrl: 'https://media.s-bol.com/mWLnzpXy4X79/gJDZyRk/385x840.jpg',
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
      'De listing vermeldt "Niveau: Beginner". De doelgroep "Kinderen" nemen we niet over, omdat die niet past bij de seniormaat.',
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
    value: 'ultrabow',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Straight bow" met een kromming van 22 mm (Grays noemt het Ultrabow).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 0 %".',
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
    value: 53.5,
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
  summary:
    'Een instap-zaalstick van Grays voor volwassenen, zonder carbon en met Ultrabow.',
  strengths: {
    value: [
      'Betaalbare zaalstick voor volwassen beginners',
      'Het rustigste profiel van Grays',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'De listing noemt als doelgroep "Kinderen" terwijl het een seniorstick is',
      'Gegevens komen van een listing op bol.com, niet van Grays zelf',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
