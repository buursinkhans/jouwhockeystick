import type { Product } from '../types';

// Specs from a bol.com listing (seller: Hockey- en Padelbrouwerij), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/reece-in-alpha-jr-hockey-stick-hockeystick-maat-28/9300000239590864/';
const CHECKED = '2026-10-10';

export const reeceInAlphaJr: Product = {
  slug: 'reece-in-alpha-jr',
  brand: 'Reece',
  name: 'Reece IN-Alpha JR',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/reece-in-alpha-jr-hockey-stick-hockeystick-maat-28/9300000239590864/',
  imageAlt: 'Reece IN-Alpha JR hockeystick',
  imageUrl: 'https://media.s-bol.com/ozOYj90k4JMz/NxpByXm/550x550.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'zaal',
    source: 'partner-shop',
    sourceLabel: 'bol.com plaatst deze stick bij zaalhockey.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Niveau: Beginner" en "Doelgroep: Kinderen".',
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
      'De listing vermeldt "Straight bow" met een kromming van 22 mm.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Percentage carbon: 0 %".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [26, 27, 28, 29, 33, 35],
    source: 'partner-shop',
    sourceLabel:
      'Maten waarvoor we op de controledatum een leverbare bol.com-listing vonden (elke maat is een aparte listing).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 40.04,
    source: 'partner-shop',
    sourceLabel:
      'Verkoopprijs op bol.com voor 28 inch op de controledatum; andere maten kostten €40,04 tot €44,95.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Voor 23:59 uur besteld, woensdag in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een junior-zaalstick van Reece zonder carbon en met een rechte kromming, verkrijgbaar van 26 tot 35 inch.',
  strengths: {
    value: [
      'Vult het gat in junior-zaalsticks onder 32 inch',
      'Rustig profiel zonder carbon voor beginnende kinderen',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Elke maat is een aparte listing met een eigen verkoper en prijs',
      'Gegevens komen van listings op bol.com, niet van Reece zelf',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
