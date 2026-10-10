import type { Product } from '../types';

// Specs from a bol.com listing (seller: Sporthuis.nl), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/the-indian-maharadja-pro-10-jr-hockey-hockeysticks-sticks-junior-kunst-veld/9300000232353351/';
const CHECKED = '2026-10-10';

export const indianMaharadjaPro10Junior: Product = {
  slug: 'indian-maharadja-pro-10-junior',
  brand: 'The Indian Maharadja',
  name: 'The Indian Maharadja Pro 10 Junior',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/the-indian-maharadja-pro-10-jr-hockey-hockeysticks-sticks-junior-kunst-veld/9300000232353351/',
  imageAlt: 'The Indian Maharadja Pro 10 Junior hockeystick',
  imageUrl: 'https://media.s-bol.com/0zoVVygqjnnv/mwylljR/492x840.jpg',
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
    sourceLabel: 'De listing vermeldt "Mid bow" met een kromming van 24 mm.',
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
    value: [35],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 35 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 100.95,
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
    'Een junior-veldstick van The Indian Maharadja zonder carbon en met mid bow, op bol.com in 35 inch.',
  strengths: {
    value: [
      'Mid bow zonder carbon: een rustig, vergevingsgezind profiel',
      'Maxi-krul volgens de listing',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Relatief duur voor een stick zonder carbon',
      'Alleen in 35 inch gevonden; gegevens van een listing op bol.com',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
