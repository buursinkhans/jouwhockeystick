import type { Product } from '../types';

// Specs from a bol.com listing (seller: THW Sport), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields
// (material "Glasvezel" vs "Wood" in the description, curve 22 mm vs 24 mm,
// target audience "Kinderen" vs length 36.5 inch) are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/adidas-estro-6-indoor-hockeystick/9300000242935965/';
const CHECKED = '2026-11-13';

export const adidasEstro60Indoor: Product = {
  slug: 'adidas-estro-60-indoor',
  brand: 'adidas',
  name: 'adidas Estro .6 Indoor',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/adidas-estro-6-indoor-hockeystick/9300000242935965/',
  imageAlt: 'adidas Estro .6 Indoor hockeystick',
  imageUrl: 'https://media.s-bol.com/x30rz3yLykDl/pgrGBGQ/492x840.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'zaal',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Geschikt voor type hockey: Zaalhockey".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Niveau: Beginner".',
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
      'De listing vermeldt "Type kromming: Mid bow" en de omschrijving noemt een Mid Bow-design.',
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
    value: [36.5],
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Sticklengte: 36.5 Inch".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 34.95,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel: 'Bol.com toonde op de controledatum een levertijd van 6 dagen.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een zaalstick van adidas met mid bow en zonder carbon, in 36,5 inch, voor een betaalbare start in de zaal.',
  strengths: {
    value: [
      'Mid bow zonder carbon: een rustig, vergevingsgezind profiel',
      'Gericht op zaalhockey',
      'Lage prijs voor een zaalstick',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen 36,5 inch gevonden',
      'De listing spreekt zichzelf tegen over materiaal en kromming; die zijn niet overgenomen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
