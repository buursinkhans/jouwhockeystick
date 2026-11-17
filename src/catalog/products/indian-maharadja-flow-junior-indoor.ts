import type { Product } from '../types';

// Specs from a bol.com listing, not from the brand's own site. Values are
// copied as printed on the listing. The listing says "Straight bow" in its
// specifications but "indoor midbow: 20 mm kromming" in its text; because
// those contradict each other, no bowProfile is filled in.
const SOURCE =
  'https://www.bol.com/nl/nl/p/indian-maharadja-flow-junior-indoor-hockeystick/9300000125260321/';
const CHECKED = '2026-11-17';

export const indianMaharadjaFlowJuniorIndoor: Product = {
  slug: 'indian-maharadja-flow-junior-indoor',
  brand: 'The Indian Maharadja',
  name: 'Indian Maharadja Flow Junior Indoor Hockeystick',
  dataStatus: 'verified',
  bolProductUrl: SOURCE,
  imageAlt: 'Indian Maharadja Flow Junior Indoor hockeystick',
  imageUrl: 'https://media.s-bol.com/VZ1xywoEgMzX/lvVx91/416x840.jpg',
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
      'De listing vermeldt "Niveau: Beginner" en "Doelgroep: Kinderen"; de stick is volgens de tekst "zeer geschikt voor jongere spelers van alle niveaus".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'De listing noemt geen specifieke positie.',
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
    value: [33],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 33 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 36.02,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs zoals op bol.com getoond op de controledatum (geen adviesprijs van het merk).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'limited',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Uiterlijk 24 november in huis", dus geen levering de volgende dag.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een houten junior-zaalstick zonder carbon in 33 inch, volgens de listing bedoeld om basisvaardigheden en techniek te ontwikkelen.',
  strengths: {
    value: [
      'Houten stick zonder carbon, wat doorgaans past bij een zacht, controlegericht gevoel',
      'Uitdrukkelijk gericht op jonge spelers, met extreme cushion grip volgens de listing',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'De listing noemt zowel "Straight bow" als "indoor midbow"; daarom vermelden we geen bow-type',
      'Gegevens komen van een winkel-listing op bol.com; geen modeljaar vermeld. Alleen in 33 inch gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
