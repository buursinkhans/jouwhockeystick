import type { Product } from '../types';

// Specs from a bol.com listing (seller: Ravi), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/ravi-hockeystick-junior-fluo-groen-31/9300000194200414/';
const CHECKED = '2026-10-10';

export const raviJuniorMidBow: Product = {
  slug: 'ravi-junior-mid-bow',
  brand: 'Ravi',
  name: 'RAVI Hockeystick Junior Mid Bow',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/ravi-hockeystick-junior-fluo-groen-31/9300000194200414/',
  imageAlt: 'RAVI Hockeystick Junior Mid Bow hockeystick',
  imageUrl: 'https://media.s-bol.com/7qlV6O2nYZg1/rkqkOyL/550x544.jpg',
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
    value: [31],
    source: 'partner-shop',
    sourceLabel:
      'Op de controledatum waren alleen de 31-inchuitvoeringen leverbaar; 27 tot 30 inch stond als niet leverbaar.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 47.99,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs op bol.com voor 31 inch op de controledatum (de witte uitvoering kostte €45).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Uiterlijk 15 oktober in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een junior-veldstick van Ravi zonder carbon en met mid bow, op bol.com nu alleen leverbaar in 31 inch.',
  strengths: {
    value: [
      'Verkrijgbaar in 31 inch, een maat waarin we weinig sticks hebben',
      'Mid bow zonder carbon: een rustig profiel voor beginners',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen 31 inch was leverbaar op de controledatum',
      'Gegevens komen van een listing op bol.com (verkoper: Ravi zelf); geen modeljaar vermeld',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
