import type { Product } from '../types';

// Specs from a bol.com listing (seller: Best Only), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/wdn-zaalhockeystick-junior-design-1-mid-bow-indoor-light-purple-26-inch/9300000049502843/';
const CHECKED = '2026-10-10';

export const scoopWdnZaalJunior: Product = {
  slug: 'scoop-wdn-zaal-junior',
  brand: 'Scoop',
  name: 'Scoop WDN Zaalhockeystick Junior Design 1',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/wdn-zaalhockeystick-junior-design-1-mid-bow-indoor-light-purple-26-inch/9300000049502843/',
  imageAlt: 'Scoop WDN Zaalhockeystick Junior Design 1 hockeystick',
  imageUrl: 'https://media.s-bol.com/g4YZ7ERk1pz9/oYjZkgY/321x840.jpg',
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
      'De listing vermeldt "Niveau: Beginner" en "Doelgroep: Kinderen".',
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
    sourceLabel: 'De listing vermeldt een mid bow van 24 mm en een Maxi-krul.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 0 %" (houten stick).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [26, 28],
    source: 'partner-shop',
    sourceLabel:
      'Maten waarvoor we op de controledatum een leverbare bol.com-listing vonden.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 24.99,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum (26 en 28 inch).',
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
  summary:
    'Een houten zaalstick voor jonge kinderen, in 26 en 28 inch, voor rond de €25.',
  strengths: {
    value: [
      'Een van de weinige zaalsticks in onze catalogus voor kinderen onder 1,25 meter',
      'Goedkoop, voor wie de zaal eerst wil proberen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een listing op bol.com; Scoop heeft geen officiële merksite die we konden raadplegen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
