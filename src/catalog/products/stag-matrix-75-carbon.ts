import type { Product } from '../types';

// Specs from a bol.com listing (seller: Best Only), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/stag-matrix-midbow-75-carbon-hockeystick-senior-outdoor/9300000153076100/';
const CHECKED = '2026-10-10';

export const stagMatrix75Carbon: Product = {
  slug: 'stag-matrix-75-carbon',
  brand: 'Stag',
  name: 'Stag Matrix MidBow 75% Carbon',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/stag-matrix-midbow-75-carbon-hockeystick-senior-outdoor/9300000153076100/',
  imageAlt: 'Stag Matrix MidBow 75% Carbon hockeystick',
  imageUrl: 'https://media.s-bol.com/N6oR0Gko1KKD/G6Qn7pK/550x557.jpg',
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
    sourceLabel: 'De listing vermeldt "Mid bow" (M-Bow).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 75,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 75 %".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5, 38.5],
    source: 'partner-shop',
    sourceLabel:
      'Maten waarvoor we op de controledatum een leverbare bol.com-listing vonden.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 89.99,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs op bol.com op de controledatum (36,5 en 38,5 inch).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Voor 23:59 uur besteld, maandag in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary: 'Een veldstick met 75% carbon en een mid bow, voor onder de €100.',
  strengths: {
    value: [
      'Veel carbon met een rustige mid bow',
      'Ook in 38,5 inch voor lange spelers',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Stijf door het hoge carbonpercentage',
      'Gegevens komen van een listing op bol.com; geen officiële merksite gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
