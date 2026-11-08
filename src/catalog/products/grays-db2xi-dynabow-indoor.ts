import type { Product } from '../types';

// Specs from a bol.com listing (seller: Hockey- en Padelbrouwerij), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/grays-db2xi-dynabow-senior-hockeystick-blauw-groen/9300000304766266/';
const CHECKED = '2026-10-10';

export const graysDb2xiDynabowIndoor: Product = {
  slug: 'grays-db2xi-dynabow-indoor',
  brand: 'Grays',
  name: 'Grays DB2Xi Dynabow Senior Indoor',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/grays-db2xi-dynabow-senior-hockeystick-blauw-groen/9300000304766266/',
  imageAlt: 'Grays DB2Xi Dynabow Senior Indoor hockeystick',
  imageUrl: 'https://media.s-bol.com/N3RoqEPKxEM6/k2DWmzx/550x543.jpg',
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
  // bowProfile left out: De titel noemt "Dynabow", de specificaties "Mid bow" (25 mm); omdat die niet hetzelfde profiel aanduiden, vullen we geen bow-profiel in.
  carbonPercentage: {
    value: 20,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 20 %".',
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
    value: 76.4,
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
    'Een zaalstick van Grays met 20% carbon voor volwassenen, voor onder de €80.',
  strengths: {
    value: [
      'Wat carbon voor een directer gevoel, voor een instapprijs',
      'Vult het gat tussen de goedkoopste en de duurdere zaalsticks',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Titel en specificaties noemen een verschillend bow-profiel',
      'De listing noemt als doelgroep "Kinderen" terwijl het een seniorstick is',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
