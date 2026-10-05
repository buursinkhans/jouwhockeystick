import type { Product } from '../types';

// Specs from a bol.com listing (seller: Sporthuis.nl), not from the brand's own
// site. Values are copied as printed on the listing; package weight is left
// out because it is not the weight of the stick.
const SOURCE =
  'https://www.bol.com/nl/nl/p/grays-4i-dynabow-indoor-senior-zaalhockeystick-fluo-geel-wit-zwart/9300000365346444/';
const CHECKED = '2026-10-05';

export const grays4iDynabowIndoor: Product = {
  slug: 'grays-4i-dynabow-indoor',
  brand: 'Grays',
  name: 'Grays 4i Dynabow Indoor Senior Zaalhockeystick',
  dataStatus: 'verified',
  imageAlt: 'Grays 4i Dynabow Indoor Senior Zaalhockeystick',
  imageUrl: 'https://media.s-bol.com/X809ALng1D0o/LZn6wxD/550x550.jpg',
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
      'De bol.com-listing vermeldt "Niveau: Beginner". De doelgroep "Kinderen" in dezelfde listing nemen we niet over: de titel zegt "Senior" en de maten zijn 36,5" en 37,5".',
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
    value: 'dynabow',
    source: 'partner-shop',
    sourceLabel:
      'De titel noemt het Grays-profiel "Dynabow"; de specificaties vermelden "Mid bow" met een kromming van 25 mm.',
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
    value: [36.5, 37.5],
    source: 'partner-shop',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 64.73,
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
      'Bol.com toonde op de controledatum "Uiterlijk 15 oktober in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'De instap-zaalstick van Grays op bol.com: een houten stick met Dynabow-profiel die volgens de listing is gemaakt voor "control and technique in small spaces".',
  strengths: {
    value: [
      'Laagste prijs van de Grays-zaalsticks in onze catalogus',
      'Houten stick zonder carbon, wat doorgaans past bij een zacht, controlegericht gevoel',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com, niet van Grays zelf',
      'Geen modeljaar of stickgewicht vermeld',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
