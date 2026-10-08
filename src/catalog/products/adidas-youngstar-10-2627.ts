import type { Product } from '../types';

// Specs from a bol.com listing (seller: Leerentveld Vrijetijd), not from the brand's own
// site. Values are copied as printed on the listing; package weight, "was"
// prices and contradicting fields are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/adidas-youngstar-10-26-27-hockey-hockeysticks-sticks-junior-hout-veld/9300000306901371/';
const CHECKED = '2026-10-05';

export const adidasYoungstar102627: Product = {
  slug: 'adidas-youngstar-10-2627',
  brand: 'adidas',
  name: 'adidas Youngstar .10 26/27 Junior',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/adidas-youngstar-10-26-27-hockey-hockeysticks-sticks-junior-hout-veld/9300000306901371/',
  imageAlt: 'adidas Youngstar .10 26/27 Junior hockeystick',
  imageUrl: 'https://media.s-bol.com/65Do1LDANqgO/Q0Mz4ZZ/550x558.jpg',
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
    source: 'editorial-estimate',
    sourceLabel:
      'De listing noemt geen niveau, alleen "Doelgroep: Kinderen" en "Junior" in de titel. Ingeschat als instapstick. Het seizoen "26/27" staat in de titel.',
    sourceUrl: SOURCE,
    modelYear: 2026,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'De listing noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  // No bowProfile: De listing vermeldt een kromming van 24 mm maar geen bow-type; daarom niet ingevuld.
  lengthsInches: {
    value: [28, 30, 31, 32],
    source: 'partner-shop',
    sourceLabel: 'Maten zoals in de maatkeuze van de listing.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 46.5,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs op bol.com voor 30 inch op de controledatum (31" en 32" kostten €43,90).',
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
    'Een junior-veldstick van adidas uit het seizoen 26/27, op bol.com verkrijgbaar in 28" tot 32". Een van de weinige sticks in onze catalogus in 31 inch.',
  strengths: {
    value: [
      'Verkrijgbaar in 28", 30", 31" en 32", waaronder de lastig te vinden 31 inch',
      'Seizoen 26/27 staat in de listing',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'De listing vermeldt geen bow-type en geen carbonpercentage; titel ("Hout") en specificatie ("Composiet") spreken elkaar tegen',
      'Gegevens komen van een winkel-listing op bol.com, niet van adidas zelf',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
