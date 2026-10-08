import type { Product } from '../types';

// Specs from a bol.com listing (seller: Leerentveld Vrijetijd), not from the brand's own
// site. Values are copied as printed on the listing; package weight, "was"
// prices and contradicting fields are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/adidas-fabela-30-26-27-hockey-hockeysticks-sticks-senior-kunst-veld/9300000306901325/';
const CHECKED = '2026-10-05';

export const adidasFabela302627: Product = {
  slug: 'adidas-fabela-30-2627',
  brand: 'adidas',
  name: 'adidas Fabela .30 26/27',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/adidas-fabela-30-26-27-hockey-hockeysticks-sticks-senior-kunst-veld/9300000306901325/',
  imageAlt: 'adidas Fabela .30 26/27 hockeystick',
  imageUrl: 'https://media.s-bol.com/VBwpG1P64O71/jq1rDoW/550x558.jpg',
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
      'De listing vermeldt "Niveau: Beginner" en noemt de stick "ideaal voor hockeyers die een comfortabele en gebruiksvriendelijke stick zoeken met veel controle". De listing noemt het seizoen "26/27" en de "Hockey 2026 collectie".',
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
    value: 30,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 30%".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [35],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 35".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 110,
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
    'Een stick uit de adidas Hockey 2026-collectie met 30% carbon en mid bow (22 mm), volgens de listing gericht op "gebruiksgemak" en "veel controle".',
  strengths: {
    value: [
      '30% carbon en een rustige mid bow: een controlegerichte opbouw',
      'Seizoen 26/27 staat in de listing',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com, niet van adidas zelf',
      'Alleen in 35" gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
