import type { Product } from '../types';

// Specs from a bol.com listing (seller: Best Only), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/wdn-stick-scoop-junior-design-1-mid-bow-hockeystick-junior-outdoor-32-inch/9300000049502904/';
const CHECKED = '2026-10-10';

export const scoopWdnJuniorVeld: Product = {
  slug: 'scoop-wdn-junior-veld',
  brand: 'Scoop',
  name: 'Scoop WDN Houten Hockeystick Junior',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/wdn-stick-scoop-junior-design-1-mid-bow-hockeystick-junior-outdoor-32-inch/9300000049502904/',
  imageAlt: 'Scoop WDN Houten Hockeystick Junior hockeystick',
  imageUrl: 'https://media.s-bol.com/EKEAzRkZpX8v/DR5j3Zx/318x840.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'bol.com plaatst deze stick bij veldhockey.',
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
    value: [32],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 32 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 27.99,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum.',
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
    'Een goedkope houten junior-veldstick van Scoop met mid bow en Maxi-krul.',
  strengths: {
    value: [
      'Een van de goedkoopste juniorsticks in onze catalogus',
      'Maxi-krul maakt aannemen volgens de listing makkelijker',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen in 32 inch gevonden',
      'Gegevens komen van een listing op bol.com; Scoop heeft geen officiële merksite die we konden raadplegen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
