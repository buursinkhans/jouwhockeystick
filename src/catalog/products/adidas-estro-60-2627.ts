import type { Product } from '../types';

// Specs from a bol.com listing (seller: Hockey- en Padelbrouwerij), not from the brand's own
// site. Values are copied as printed on the listing; package weight, "was"
// prices and contradicting fields are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/adidas-estro-60-26-27-hockey-hockeysticks-sticks-senior-kunst-veld/9300000335785756/';
const CHECKED = '2026-10-05';

export const adidasEstro602627: Product = {
  slug: 'adidas-estro-60-2627',
  brand: 'adidas',
  name: 'adidas Estro .60 26/27',
  dataStatus: 'verified',
  imageAlt: 'adidas Estro .60 26/27 hockeystick',
  imageUrl: 'https://media.s-bol.com/M4BG8M8v3Z5B/xn6nQ1z/550x558.jpg',
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
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Niveau: Gevorderde" en noemt de stick "ideaal voor hockeyers die een veelzijdige stick zoeken met veel controle". De listing noemt het seizoen "26/27" en de "Hockey 2026 collectie".',
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
  bowProfile: {
    value: 'midbow',
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Mid bow" met een kromming van 22 mm.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 60,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 60%".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [37.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 37,5".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 173.51,
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
    'Een veelzijdige seniorstick van adidas uit het seizoen 26/27 met 60% carbon en mid bow (22 mm).',
  strengths: {
    value: [
      '60% carbon met een rustige mid bow: direct gevoel zonder een lage kromming',
      'Seizoen 26/27 staat in de listing',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen in 37,5" gevonden; de stickwijzer adviseert voor volwassenen 36,5"',
      'Gegevens komen van een winkel-listing op bol.com, niet van adidas zelf',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
