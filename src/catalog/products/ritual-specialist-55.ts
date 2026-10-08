import type { Product } from '../types';

// Specs from a bol.com listing (seller: Leerentveld Vrijetijd), not from the brand's own
// site. Values are copied as printed on the listing; package weight, "was"
// prices and contradicting fields are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/ritual-specialist-55-hockey-hockeysticks-sticks-senior-kunst-veld/9300000264010081/';
const CHECKED = '2026-10-05';

export const ritualSpecialist55: Product = {
  slug: 'ritual-specialist-55',
  brand: 'Ritual',
  name: 'Ritual Specialist 55',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/ritual-specialist-55-hockey-hockeysticks-sticks-senior-kunst-veld/9300000264010081/',
  imageAlt: 'Ritual Specialist 55 hockeystick',
  imageUrl: 'https://media.s-bol.com/g3GPZgXY8x63/481z5z0/550x320.jpg',
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
    value: 'gevorderd',
    source: 'editorial-estimate',
    sourceLabel:
      'De listing noemt geen niveau, wel een stick "voor spelers die hun technische vaardigheden en dragflicks verder willen ontwikkelen". Ingeschat als gevorderd.',
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
    sourceLabel: 'De listing vermeldt "Low Bow" met een kromming van 24 mm.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 55,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "55% premium Japanese carbon".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 36,5".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 165,
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
    'Een seniorstick met 55% carbon en low bow, volgens de listing voor spelers "die hun technische vaardigheden en dragflicks verder willen ontwikkelen".',
  strengths: {
    value: [
      'Low bow met 55% carbon, gericht op techniek, 3D en de dragflick',
      'Verkrijgbaar in 36,5"',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Een lage kromming kan aannemen en vlak passen iets lastiger maken',
      'Gegevens komen van een winkel-listing op bol.com; geen modeljaar vermeld',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
