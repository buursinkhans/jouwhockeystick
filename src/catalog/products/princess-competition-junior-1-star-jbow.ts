import type { Product } from '../types';

// Specs from a bol.com listing (seller: Sporthuis.nl), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/princess-competition-junior-1-star-j-bow-light-pink-white-hockeystick/9300000317136640/';
const CHECKED = '2026-10-10';

export const princessCompetitionJunior1StarJbow: Product = {
  slug: 'princess-competition-junior-1-star-jbow',
  brand: 'Princess',
  name: 'Princess Competition Junior 1 STAR J-Bow',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/princess-competition-junior-1-star-j-bow-light-pink-white-hockeystick/9300000317136640/',
  imageAlt: 'Princess Competition Junior 1 STAR J-Bow hockeystick',
  imageUrl: 'https://media.s-bol.com/gzYY2WlWD0L6/kZAz9mE/550x512.jpg',
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
    sourceLabel:
      'De listing vermeldt "Mid bow" met een kromming van 19 mm (Princess noemt het J-Bow).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 15,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 15 %".',
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
    value: 64.9,
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
    'De instapstick uit de Competition-juniorlijn van Princess, met 15% carbon en een rustige kromming.',
  strengths: {
    value: [
      'Rustige kromming en weinig carbon: een logische eerste of tweede juniorstick',
      'Princess gebruikt een sterrensysteem dat oploopt met het carbonpercentage',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen in 35 inch gevonden',
      'Gegevens komen van een listing op bol.com, niet van Princess zelf',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
