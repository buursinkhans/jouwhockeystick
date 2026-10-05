import type { Product } from '../types';

// Specs from a bol.com listing (seller: Best Only), not from the brand's own
// site. Values are copied as printed on the listing; package weight, "was"
// prices and contradicting fields are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/stag-magic-hockeystick-jr-bow-junior-blauw-33-inch/9300000066814940/';
const CHECKED = '2026-10-05';

export const stagMagicJrBowJunior: Product = {
  slug: 'stag-magic-jr-bow-junior',
  brand: 'Stag',
  name: 'Stag Magic Hockeystick Jr-Bow Junior',
  dataStatus: 'verified',
  imageAlt: 'Stag Magic Hockeystick Jr-Bow Junior hockeystick',
  imageUrl: 'https://media.s-bol.com/7GNMqQrRm9M1/W7PwGgX/282x840.jpg',
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
    value: 'beginner',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Niveau: Beginner" en noemt het de "ideale hockeystick voor de jongere generatie hockeyers".',
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
    value: 'ultrabow',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Jr-Bow (Straight bow)" met een kromming van 22 mm; in onze indeling het rustigste profiel (standaard).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 0%" en "Materiaal: Hout/Glasvezel".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [33],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 33".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 19.99,
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
      'Bol.com toonde op de controledatum "Voor 23:59 uur besteld, morgen in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een eenvoudige houten junior-veldstick met een rechte, rustige kromming, op bol.com in 33 inch.',
  strengths: {
    value: [
      'Laagste prijs van alle veldsticks in onze catalogus',
      'Verkrijgbaar in 33 inch, een maat die verder weinig voorkomt',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com; geen modeljaar vermeld',
      'Alleen in 33" gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
