import type { Product } from '../types';

// Specs from a bol.com listing (seller: Best Only), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/csign-sports-hockeystick-senior-40-carbon-10-twaron-50-fiberglass-low-bow-24mm/9300000008476394/';
const CHECKED = '2026-10-10';

export const csign40CarbonLowBow: Product = {
  slug: 'csign-40-carbon-low-bow',
  brand: 'Csign',
  name: 'Csign Sports Senior 40% Carbon Low Bow',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/csign-sports-hockeystick-senior-40-carbon-10-twaron-50-fiberglass-low-bow-24mm/9300000008476394/',
  imageAlt: 'Csign Sports Senior 40% Carbon Low Bow hockeystick',
  imageUrl: 'https://media.s-bol.com/79KxnlN7Dy6j/550x493.jpg',
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
    value: 'lowbow',
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Low bow" met een kromming van 24 mm.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 40,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 40 %" (40% carbon, 10% twaron, 50% fiberglass).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [37.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 37,5 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 49.99,
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
    'Een low bow-veldstick met 40% carbon voor rond de €50, voor spelers die de basis beheersen.',
  strengths: {
    value: [
      'Een betaalbare eerste low bow',
      'Vult het gat tussen instapsticks en sticks vanaf €125',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen in 37,5 inch gevonden',
      'Gegevens komen van een listing op bol.com; geen officiële merksite gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
