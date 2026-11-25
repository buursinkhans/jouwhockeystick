import type { Product } from '../types';

// Specs from a bol.com listing (seller: THW Sport), not from the brand's own
// site. Values are copied as printed on the listing; package weight and
// contradicting fields are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/adidas-estro-10-indoor-hockeystick/9300000405598065/';
const CHECKED = '2026-11-24';

export const adidasEstro10Indoor: Product = {
  slug: 'adidas-estro-10-indoor',
  brand: 'adidas',
  name: 'adidas Estro .10 Zaalhockeystick',
  dataStatus: 'verified',
  bolProductUrl: SOURCE,
  imageAlt: 'adidas Estro .10 Zaalhockeystick',
  imageUrl: 'https://media.s-bol.com/lrVDBmK9pvGl/46YKlg1/550x557.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'zaal',
    source: 'partner-shop',
    sourceLabel: 'De bol.com-listing vermeldt "Geschikt voor type hockey: Zaalhockey".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Niveau: Beginner" en omschrijft de stick als geschikt voor beginners en recreatieve zaalspelers.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'De listing noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  // No bowProfile: de listing vermeldt een kromming van 24 mm en een midi-kop, maar geen bow-type.
  carbonPercentage: {
    value: 10,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 10 %".',
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
    value: 42.95,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum (geen adviesprijs van het merk).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Voor 18:00 uur besteld, donderdag in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een zaalstick van adidas met 10% carbon en een midi-kop, op bol.com in 36,5 inch. Kan passen bij beginnende zaalspelers.',
  strengths: {
    value: [
      'Instapprijs voor een zaalstick met een beetje carbon',
      'Midi-kop die door de listing wordt genoemd',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Geen bow-type vermeld',
      'Alleen 36,5 inch gevonden; de listing noemt "Kinderen" als doelgroep, wat niet bij deze lengte past',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
