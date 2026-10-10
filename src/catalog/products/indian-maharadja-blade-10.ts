import type { Product } from '../types';

// Specs from a bol.com listing (seller: Plutosport.nl), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/the-indian-maharadja-blade-10-hockeystick/9300000154316375/';
const CHECKED = '2026-10-10';

export const indianMaharadjaBlade10: Product = {
  slug: 'indian-maharadja-blade-10',
  brand: 'The Indian Maharadja',
  name: 'The Indian Maharadja Blade 10',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/the-indian-maharadja-blade-10-hockeystick/9300000154316375/',
  imageAlt: 'The Indian Maharadja Blade 10 hockeystick',
  imageUrl: 'https://media.s-bol.com/87PY9pAQWVv2/B3kDKY/508x840.jpg',
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
      'De listing vermeldt "Niveau: Beginner". De doelgroep "Kinderen" nemen we niet over, omdat die niet past bij 36,5 inch.',
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
    value: 77.74,
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
    'Een instapstick van The Indian Maharadja met 10% carbon en mid bow, in 36,5 inch.',
  strengths: {
    value: [
      'Mid bow met weinig carbon voor onder €80',
      'Maxi-krul volgens de listing',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'De listing noemt als doelgroep "Kinderen" terwijl het 36,5 inch is',
      'Gegevens komen van een listing op bol.com',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
