import type { Product } from '../types';

// Specs from a bol.com listing (seller: Hockey- en Padelbrouwerij), not from the brand's own
// site. Values are copied as printed on the listing; package weight, "was"
// prices and contradicting fields are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/grays-impulse-gt-jun-hockeystick-hockey-hockeysticks-sticks-junior-hout-veld/9300000320015163/';
const CHECKED = '2026-10-05';

export const graysImpulseGtJunior: Product = {
  slug: 'grays-impulse-gt-junior',
  brand: 'Grays',
  name: 'Grays Impulse GT Junior',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/grays-impulse-gt-jun-hockeystick-hockey-hockeysticks-sticks-junior-hout-veld/9300000320015163/',
  imageAlt: 'Grays Impulse GT Junior hockeystick',
  imageUrl: 'https://media.s-bol.com/K4rOlY76L8nY/YvzD7zW/550x547.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel:
      'De bol.com-listing vermeldt "Geschikt voor type hockey: Veldhockey".',
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
      'De listing vermeldt "Mid bow" met een kromming van 25 mm en een "Micro"-kop.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 0%" en "Materiaal: Hout".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [27],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 27".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 45.6,
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
      'Bol.com toonde op de controledatum "Voor 23:59 uur besteld, donderdag in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een houten junior-veldstick van Grays met mid bow, op bol.com in 27 inch.',
  strengths: {
    value: [
      'Verkrijgbaar in 27 inch, een maat die in onze catalogus verder ontbreekt',
      'Houten stick zonder carbon voor beginnende kinderen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com, niet van Grays zelf; geen modeljaar vermeld',
      'Alleen in 27" gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
