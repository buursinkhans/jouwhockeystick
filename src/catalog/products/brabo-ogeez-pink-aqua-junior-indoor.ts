import type { Product } from '../types';

// Specs from a bol.com listing, not from the brand's own site (brabo.nl was
// not reachable). Values are copied as printed on the listing.
const SOURCE =
  'https://www.bol.com/nl/nl/p/brabo-it-o-geez-pink-aqua-junior-indoor-hockeystick/9300000432928124/';
const CHECKED = '2026-10-27';

export const braboOgeezPinkAquaJuniorIndoor: Product = {
  slug: 'brabo-ogeez-pink-aqua-junior-indoor',
  brand: 'Brabo',
  name: "Brabo IT O'GEEZ Pink/Aqua Junior Indoor Hockeystick",
  dataStatus: 'verified',
  bolProductUrl: SOURCE,
  imageAlt: "Brabo IT O'GEEZ Pink/Aqua Junior Indoor hockeystick",
  imageUrl: 'https://media.s-bol.com/rADx26mlYDKW/LZ2Vxxr/550x507.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'zaal',
    source: 'partner-shop',
    sourceLabel:
      'De bol.com-listing vermeldt "Geschikt voor type hockey: Zaalhockey".',
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
  // No bowProfile: de listing vermeldt "Straight bow" met een kromming van 24 mm; die twee gegevens passen niet eenduidig op onze bow-indeling, daarom niet ingevuld.
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 0 %" en "Materiaal: Hout".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [35],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 35 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 48.95,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs zoals op bol.com getoond op de controledatum (geen adviesprijs van het merk).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Op voorraad. Voor 15:00 uur besteld, donderdag in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een houten junior-zaalstick van Brabo (O\'Geez-lijn) zonder carbon, bedoeld voor beginnende zaalspelers.',
  strengths: {
    value: [
      'Houten zaalstick zonder carbon, een logische eerste zaalstick voor jeugdspelers',
      'Volgens de omschrijving licht en wendbaar in kleine ruimtes',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com, niet van Brabo zelf; geen modeljaar vermeld',
      'Alleen in 35 inch gevonden; controleer de lengte bij de winkel',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
