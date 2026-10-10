import type { Product } from '../types';

// Specs from a bol.com listing (seller: Best Only), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/osaka-stick-1-series-1-0-neon-white-standard-bow-hockeystick-junior-outdoor-34-inch/9300000049502885/';
const CHECKED = '2026-10-10';

export const osakaStick1SeriesJunior: Product = {
  slug: 'osaka-stick-1-series-junior',
  brand: 'Osaka',
  name: 'Osaka Stick 1 Series 1.0 Junior',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/osaka-stick-1-series-1-0-neon-white-standard-bow-hockeystick-junior-outdoor-34-inch/9300000049502885/',
  imageAlt: 'Osaka Stick 1 Series 1.0 Junior hockeystick',
  imageUrl: 'https://media.s-bol.com/OJxNA8px952Q/Nx3GYrm/550x314.jpg',
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
  // bowProfile left out: De titel noemt "Standard Bow", de specificaties "Mid bow" (17 mm); omdat die elkaar tegenspreken, vullen we geen bow-profiel in.
  // carbonPercentage left out: De listing vermeldt geen carbonpercentage.
  lengthsInches: {
    value: [34],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 34 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 26.99,
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
    'Een eenvoudige junior-veldstick van Osaka voor beginners, op bol.com in 34 inch.',
  strengths: {
    value: [
      'Een van de goedkoopste juniorsticks in onze catalogus',
      'Bedoeld voor beginnende kinderen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Bow-profiel en carbonpercentage zijn niet eenduidig vermeld',
      'Alleen in 34 inch gevonden; gegevens van een listing op bol.com',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
