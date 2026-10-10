import type { Product } from '../types';

// Specs from a bol.com listing (seller: Sporthuis.nl), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/adidas-estro-10-junior-indoor-hockeystick/9300000405598041/';
const CHECKED = '2026-10-10';

export const adidasEstro10JuniorIndoor: Product = {
  slug: 'adidas-estro-10-junior-indoor',
  brand: 'adidas',
  name: 'adidas Estro .10 Junior Indoor',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/adidas-estro-10-junior-indoor-hockeystick/9300000405598041/',
  passaSportsProductUrl:
    'https://www.passasports.nl/adidas-estro-10-indoor-junior-km1378',
  imageAlt: 'adidas Estro .10 Junior Indoor hockeystick',
  imageUrl: 'https://media.s-bol.com/gmV6wGkWnLN6/79WJolj/550x557.jpg',
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
    sourceLabel: 'De listing vermeldt "Niveau: Beginner".',
    sourceUrl: SOURCE,
    modelYear: 2026,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'De listing noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  // bowProfile left out: De bol.com-listing en PassaSports vermelden geen bow-profiel.
  carbonPercentage: {
    value: 10,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 10 %".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [26, 28, 30, 32, 34, 35],
    source: 'partner-shop',
    sourceLabel:
      'Maten waarvoor we op de controledatum een leverbare bol.com-listing vonden; PassaSports had ook 24, 31 en 33 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 46.39,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs op bol.com voor 30 inch op de controledatum; andere maten €43,80 tot €49,95 (PassaSports: €34,95).',
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
    'Een junior-zaalstick van adidas met 10% carbon, verkrijgbaar van 26 tot 35 inch.',
  strengths: {
    value: [
      'Breed in juniormaten voor de zaal',
      'Modeljaar bekend (collectie 2026/2027)',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Geen bow-profiel vermeld',
      'Elke maat is een aparte listing; prijzen verschillen per maat',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
