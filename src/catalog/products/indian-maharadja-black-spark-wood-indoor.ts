import type { Product } from '../types';

// Specs from a bol.com listing, not from the brand's own site (not readable on
// the check date). Values are copied as printed on the listing; package weight
// is left out because it is not the weight of the stick.
const SOURCE =
  'https://www.bol.com/nl/nl/p/the-indian-maharadja-black-spark-wood-zaalhockeystick-10251073-kleur-zwart-wit-maat-36-5/9300000242642560/';
const CHECKED = '2026-11-03';

export const indianMaharadjaBlackSparkWoodIndoor: Product = {
  slug: 'indian-maharadja-black-spark-wood-indoor',
  brand: 'The Indian Maharadja',
  name: 'The Indian Maharadja Black Spark Wood Zaalhockeystick',
  dataStatus: 'verified',
  bolProductUrl: SOURCE,
  imageAlt: 'The Indian Maharadja Black Spark Wood Zaalhockeystick',
  imageUrl: 'https://media.s-bol.com/8VX8Jpk4KA7L/nZ0grLW/250x200.jpg',
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
      'De bol.com-listing vermeldt "Niveau: Beginner" en noemt de stick ideaal voor beginnende spelers die hun basisvaardigheden willen ontwikkelen tijdens het zaalseizoen.',
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
    sourceLabel: 'De listing vermeldt "Mid bow" met een kromming van 22 mm.',
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
    value: [36.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 36,5".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 49.95,
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
      'Bol.com toonde op de controledatum "Op voorraad. Voor 23:59 uur besteld, vrijdag in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een houten zaalstick met mid bow (22 mm), volgens de listing bedoeld voor beginnende spelers die hun basisvaardigheden willen ontwikkelen tijdens het zaalseizoen.',
  strengths: {
    value: [
      'Uitdrukkelijk gericht op beginnende zaalspelers',
      'Houten stick zonder carbon, wat doorgaans past bij een zacht, controlegericht gevoel',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com; geen modeljaar vermeld',
      'Alleen in 36,5" gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
