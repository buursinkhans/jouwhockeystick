import type { Product } from '../types';

// Specs from a bol.com listing (seller: Ravi), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/ravi-hockeystick-junior-30-carbon-black-35/9300000194200419/';
const CHECKED = '2026-10-10';

export const raviJunior30Carbon: Product = {
  slug: 'ravi-junior-30-carbon',
  brand: 'Ravi',
  name: 'RAVI Hockeystick Junior 30% Carbon',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/ravi-hockeystick-junior-30-carbon-black-35/9300000194200419/',
  imageAlt: 'RAVI Hockeystick Junior 30% Carbon hockeystick',
  imageUrl: 'https://media.s-bol.com/NoPXKnOLzBPL/2kqk5ZP/550x572.jpg',
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
      'De listing vermeldt "Niveau: Gevorderde" en "Doelgroep: Kinderen".',
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
    sourceLabel: 'De listing vermeldt "Mid bow" met een kromming van 24 mm.',
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
    value: [35],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 35 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 89,
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
    'Een junior-veldstick van Ravi met 30% carbon en mid bow, voor kinderen die de basis beheersen.',
  strengths: {
    value: [
      'Een volgende stap na een eerste stick: wat carbon, maar nog een rustige mid bow',
      'Een van de weinige gevorderde juniorsticks onder €100 in onze catalogus',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen in 35 inch gevonden',
      'Gegevens komen van een listing op bol.com (verkoper: Ravi zelf); geen modeljaar vermeld',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
