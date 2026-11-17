import type { Product } from '../types';

// Specs from a bol.com listing, not from the brand's own site. Values are
// copied as printed on the listing; package weight is left out because it is
// not the weight of the stick. The listing names a 22 mm curve in its text and
// 24 mm in its specification table; only the bow type (mid bow) is used.
const SOURCE =
  'https://www.bol.com/nl/nl/p/indian-maharadja-iron-blue-indoor-hockeystick/9300000242642558/';
const CHECKED = '2026-11-17';

export const indianMaharadjaIronBlueIndoor: Product = {
  slug: 'indian-maharadja-iron-blue-indoor',
  brand: 'The Indian Maharadja',
  name: 'Indian Maharadja Iron Blue Indoor Hockeystick',
  dataStatus: 'verified',
  bolProductUrl: SOURCE,
  imageAlt: 'Indian Maharadja Iron Blue Indoor hockeystick',
  imageUrl: 'https://media.s-bol.com/p19w3NEy6Dy1/Q1l60QL/250x200.jpg',
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
      'De listing vermeldt "Niveau: Beginner" en noemt de stick "speciaal ontworpen voor beginnende en recreatieve spelers".',
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
      'De listing vermeldt "Type kromming: Mid bow". De kromming staat als 22 mm in de omschrijving en als 24 mm in de specificaties; die maat nemen we niet over.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 0 %" en "Materiaal: Hout" (Mulberry).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 36,5 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 45.95,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs in de productgegevens van bol.com op de controledatum (geen adviesprijs van het merk). De prijslijst van dezelfde week toonde €36,25; de actuele prijs staat bij de winkel.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Op voorraad. Voor 23:59 uur besteld, zaterdag in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een houten zaalstick met mid bow en zonder carbon, volgens de listing bedoeld voor beginnende en recreatieve spelers die hun basisvaardigheden in de zaal willen ontwikkelen.',
  strengths: {
    value: [
      'Uitdrukkelijk gericht op beginnende en recreatieve zaalspelers',
      'Houten stick zonder carbon, wat doorgaans past bij een zacht, controlegericht gevoel',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'De listing noemt twee verschillende krommingsmaten (22 en 24 mm)',
      'Gegevens komen van een winkel-listing op bol.com; geen modeljaar vermeld. Alleen in 36,5" gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
