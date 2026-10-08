import type { Product } from '../types';

// Specs sourced from a bol.com listing, not adidas's own site — adidas.nl/.de/.com
// block automated access. bol.com is this site's designated retail partner, so
// it's an explicitly allowed source for price/availability (source-policy.md §2);
// technical specs here are exactly as printed on the listing, never invented.
export const adidasEstro75Le: Product = {
  slug: 'adidas-estro-75-le',
  brand: 'adidas',
  name: 'adidas Estro .75 LE 26/27',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/adidas-estro-75-le-26-27-hockey-hockeysticks-sticks-senior-kunst-veld/9300000383206272/',
  imageAlt: 'adidas Estro .75 LE hockeystick',
  imageUrl: 'https://media.s-bol.com/yLPlK7Y2MKon/81PzAnj/550x558.jpg',
  imageSourceUrl:
    'https://www.bol.com/nl/nl/p/adidas-estro-75-le-26-27-hockey-hockeysticks-sticks-senior-kunst-veld/9300000383206272/',
  experienceLevel: {
    value: 'ervaren',
    source: 'editorial-estimate',
    sourceLabel:
      'Bol.com-listing (verkoper: Hockey- en Padelbrouwerij) noemt alleen "Volwassenen/Senior, kunstgras" — geen ervaringsniveau. Ingeschat als ervaren op basis van de hoogste prijs van de drie gevonden adidas-modellen en de "LE" (limited edition)-aanduiding.',
    sourceUrl:
      'https://www.bol.com/nl/nl/p/adidas-estro-75-le-26-27-hockey-hockeysticks-sticks-senior-kunst-veld/9300000383206272/',
    lastVerifiedAt: '2026-09-27',
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'Geen specifieke veldpositie vermeld op de bol.com-listing.',
    lastVerifiedAt: '2026-09-27',
  },
  lengthsInches: {
    value: [36.5],
    source: 'partner-shop',
    sourceLabel:
      'Alleen deze lengtevariant (36.5") actief gevonden als bol.com-listing.',
    sourceUrl:
      'https://www.bol.com/nl/nl/p/adidas-estro-75-le-26-27-hockey-hockeysticks-sticks-senior-kunst-veld/9300000383206272/',
    lastVerifiedAt: '2026-09-27',
  },
  priceIndicativeEur: {
    value: 229.95,
    source: 'partner-shop',
    sourceLabel:
      'Momentopname van de bol.com-verkoopprijs (verkoper: Hockey- en Padelbrouwerij) op 27-09-2026 — geen adviesprijs van adidas zelf, kan wijzigen.',
    sourceUrl:
      'https://www.bol.com/nl/nl/p/adidas-estro-75-le-26-27-hockey-hockeysticks-sticks-senior-kunst-veld/9300000383206272/',
    lastVerifiedAt: '2026-09-27',
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op controledatum "Voor 23:59 besteld, woensdag in huis".',
    sourceUrl:
      'https://www.bol.com/nl/nl/p/adidas-estro-75-le-26-27-hockey-hockeysticks-sticks-senior-kunst-veld/9300000383206272/',
    lastVerifiedAt: '2026-09-27',
  },
  summary:
    'Een carbon senior-stick voor kunstgras, via bol.com gevonden als het duurste van drie beschikbare adidas-modellen. Specs komen van de bol.com-listing, niet van adidas zelf.',
  strengths: {
    value: [
      'Carbon materiaal voor meer power dan een basisstick',
      'Specifiek gericht op kunstgras-gebruik voor volwassenen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: '2026-09-27',
  },
  pointsOfAttention: {
    value: [
      'Carbonpercentage en bow-profielnaam worden niet vermeld op de listing — alleen een curve van 24mm',
      'Specs zijn niet rechtstreeks bij adidas geverifieerd — adidas.nl is niet te raadplegen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: '2026-09-27',
  },
};
