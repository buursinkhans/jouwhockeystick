import type { Product } from '../types';

// Specs from a bol.com listing (seller: Plutosport.nl), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/indian-maharadja-swift-junior-indoor-hockeystick/9300000399903068/';
const CHECKED = '2026-10-10';

export const indianMaharadjaSwiftJuniorIndoor: Product = {
  slug: 'indian-maharadja-swift-junior-indoor',
  brand: 'The Indian Maharadja',
  name: 'The Indian Maharadja Swift Junior Indoor',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/indian-maharadja-swift-junior-indoor-hockeystick/9300000399903068/',
  passaSportsProductUrl:
    'https://www.passasports.nl/indian-maharadja-swift-indoor-junior-10261082',
  imageAlt: 'The Indian Maharadja Swift Junior Indoor hockeystick',
  imageUrl: 'https://media.s-bol.com/A3ov8y5pOnRz/16BjLjZ/264x840.jpg',
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
  bowProfile: {
    value: 'midbow',
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Mid bow".',
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
    value: [28, 29, 30, 33, 34, 35],
    source: 'partner-shop',
    sourceLabel:
      'Maten waarvoor we op de controledatum een leverbare bol.com-listing vonden; PassaSports had ook 31 en 32 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 42.95,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs op bol.com voor 30 inch op de controledatum; andere maten €42,45 tot €45,61 (PassaSports: €34,95).',
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
    'Een junior-zaalstick van The Indian Maharadja zonder carbon en met mid bow, van 28 tot 35 inch.',
  strengths: {
    value: [
      'Rustig profiel zonder carbon voor kinderen die beginnen in de zaal',
      'Modeljaar bekend (collectie 2026/2027)',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Elke maat is een aparte listing; prijzen verschillen per maat',
      'Gegevens komen van listings op bol.com en PassaSports',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
