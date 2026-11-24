import type { Product } from '../types';

// Specs from a bol.com listing (seller: LiWell B.V. as manufacturer), not from the
// brand's own site. Values are copied as printed on the listing; package weight
// is left out because it is not the weight of the stick. The listing text
// names a different model (Aqua Glass) and 22 mm curve; the spec table says 24 mm.
const SOURCE =
  'https://www.bol.com/nl/nl/p/indian-maharadja-black-mono-indoor-hockeystick/9300000399902892/';
const CHECKED = '2026-11-24';

export const indianMaharadjaBlackMonoIndoor: Product = {
  slug: 'indian-maharadja-black-mono-indoor',
  brand: 'The Indian Maharadja',
  name: 'The Indian Maharadja Black Mono Zaalhockeystick',
  dataStatus: 'verified',
  bolProductUrl: SOURCE,
  imageAlt: 'The Indian Maharadja Black Mono Zaalhockeystick',
  imageUrl: 'https://media.s-bol.com/4Mw1W5kNr2Pg/99L8WrJ/255x840.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'zaal',
    source: 'partner-shop',
    sourceLabel: 'De bol.com-listing vermeldt "Geschikt voor type hockey: Zaalhockey".',
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
    sourceLabel: 'De listing vermeldt "Type kromming: Mid bow".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 0 %" en "Materiaal: Hout".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 36,5 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 51.65,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum (geen adviesprijs van het merk).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Voor 22:00 uur besteld, morgen in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een houten zaalstick van The Indian Maharadja met mid bow, op bol.com in 36,5 inch. Kan passen bij beginnende zaalspelers.',
  strengths: {
    value: [
      'Houten stick zonder carbon, een instapkeuze voor de zaal',
      'Mid bow met een gebruiksvriendelijk profiel',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen 36,5 inch gevonden',
      'De listing is op onderdelen tegenstrijdig (kromming 22 of 24 mm), dus controleer de details bij de winkel',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
