import type { Product } from '../types';

// Specs sourced from a bol.com listing, not adidas's own site — adidas.nl/.de/.com
// block automated access. bol.com is this site's designated retail partner, so
// it's an explicitly allowed source for price/availability (source-policy.md §2);
// technical specs here are exactly as printed on the listing, never invented.
export const adidasEstro4: Product = {
  slug: 'adidas-estro-4',
  brand: 'adidas',
  name: 'adidas Estro .4 Hockeystick',
  dataStatus: 'verified',
  imageAlt: 'adidas Estro .4 hockeystick',
  experienceLevel: {
    value: 'gevorderd',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com-listing (verkoper: Hockeyzaak.nl) omschrijft dit model voor "allround hockeyers". adidas.nl is niet te raadplegen (blokkeert geautomatiseerde toegang), dus dit is niet rechtstreeks bij adidas geverifieerd.',
    sourceUrl: 'https://www.bol.com/nl/nl/p/adidas-estro-4-hockeystick/9300000111826384/',
    lastVerifiedAt: '2026-09-27',
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Geen specifieke veldpositie vermeld op de bol.com-listing, alleen "allround".',
    lastVerifiedAt: '2026-09-27',
  },
  bowProfile: {
    value: 'midbow',
    source: 'partner-shop',
    sourceLabel: 'Bol.com-listing vermeldt expliciet "Mid Bow" (curve 22mm op 25cm van de hoek).',
    sourceUrl: 'https://www.bol.com/nl/nl/p/adidas-estro-4-hockeystick/9300000111826384/',
    lastVerifiedAt: '2026-09-27',
  },
  carbonPercentage: {
    value: 70,
    source: 'partner-shop',
    sourceLabel: 'Bol.com-listing vermeldt expliciet "70% carbon, 30% glasvezel".',
    sourceUrl: 'https://www.bol.com/nl/nl/p/adidas-estro-4-hockeystick/9300000111826384/',
    lastVerifiedAt: '2026-09-27',
  },
  weightGrams: {
    value: 650,
    source: 'partner-shop',
    sourceLabel: 'Bol.com-listing vermeldt expliciet 650 gram.',
    sourceUrl: 'https://www.bol.com/nl/nl/p/adidas-estro-4-hockeystick/9300000111826384/',
    lastVerifiedAt: '2026-09-27',
  },
  lengthsInches: {
    value: [36.5],
    source: 'partner-shop',
    sourceLabel: 'Alleen deze lengtevariant (36.5", 92cm) actief gevonden als bol.com-listing.',
    sourceUrl: 'https://www.bol.com/nl/nl/p/adidas-estro-4-hockeystick/9300000111826384/',
    lastVerifiedAt: '2026-09-27',
  },
  priceIndicativeEur: {
    value: 179,
    source: 'partner-shop',
    sourceLabel:
      'Momentopname van de bol.com-verkoopprijs (verkoper: Hockeyzaak.nl) op 27-09-2026 — geen adviesprijs van adidas zelf, kan wijzigen.',
    sourceUrl: 'https://www.bol.com/nl/nl/p/adidas-estro-4-hockeystick/9300000111826384/',
    lastVerifiedAt: '2026-09-27',
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel: 'Bol.com toonde op controledatum "Leverbaar, uiterlijk 1 oktober in huis".',
    sourceUrl: 'https://www.bol.com/nl/nl/p/adidas-estro-4-hockeystick/9300000111826384/',
    lastVerifiedAt: '2026-09-27',
  },
  summary:
    'Een mid-bow stick met 70% carbon, via bol.com gevonden als allroundmodel voor gevorderde spelers. Specs komen van de bol.com-listing, niet van adidas zelf.',
  strengths: {
    value: [
      'Mid-bow profiel voor een balans tussen dribbelen en shot',
      'Relatief hoog carbonpercentage (70%) voor een responsieve, krachtige stick',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: '2026-09-27',
  },
  pointsOfAttention: {
    value: [
      'Specs zijn niet rechtstreeks bij adidas geverifieerd — adidas.nl is niet te raadplegen',
      'Slechts één lengtevariant (36.5") actief gevonden op bol.com',
    ],
    source: 'editorial-estimate',
    sourceLabel: 'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: '2026-09-27',
  },
};
