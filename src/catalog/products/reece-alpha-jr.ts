import type { Product } from '../types';

// Specs from a bol.com listing (seller: Hockey- en Padelbrouwerij), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/reece-alpha-jr-hockey-stick-hockeystick-maat-29/9300000236284951/';
const CHECKED = '2026-10-10';

export const reeceAlphaJr: Product = {
  slug: 'reece-alpha-jr',
  brand: 'Reece',
  name: 'Reece Alpha JR',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/reece-alpha-jr-hockey-stick-hockeystick-maat-29/9300000236284951/',
  imageAlt: 'Reece Alpha JR hockeystick',
  imageUrl: 'https://media.s-bol.com/Rzjz5poxv2WO/ElnK5P4/420x840.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'bol.com plaatst deze stick bij veldhockey.',
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
      'De listing vermeldt "Straight bow" met een kromming van 22 mm; de beschrijving noemt het een "Regular Bow".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 0 %"; de beschrijving noemt hout met fiberglass.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [24, 27, 29, 30, 32, 35],
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
      'Verkoopprijs op bol.com voor 29 inch op de controledatum; andere maten kostten €39,99 tot €44,95.',
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
    'Een houten junior-veldstick van Reece met een rustige, rechte kromming, op bol.com verkrijgbaar van 24 tot 35 inch.',
  strengths: {
    value: [
      'Verkrijgbaar in 24 en 29 inch, maten die in onze catalogus verder (bijna) ontbreken',
      'Houten stick zonder carbon voor de jongste spelers',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van winkel-listings op bol.com, niet van Reece zelf; geen modeljaar vermeld',
      'Elke maat is een aparte listing met een eigen verkoper en prijs',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
