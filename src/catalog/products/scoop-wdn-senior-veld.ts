import type { Product } from '../types';

// Specs from a bol.com listing (manufacturer: ACM Products B.V.), not from a
// brand site. Values are copied as printed on the listing. The packaging
// weight ("Verpakkingsgewicht") is not a stick weight, so weightGrams is left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/wdn-stick-scoop-design-1-mid-bow-purple-hockeystick-senior-37-5-inch/9300000049502842/';
const CHECKED = '2026-10-13';

export const scoopWdnSeniorVeld: Product = {
  slug: 'scoop-wdn-senior-veld',
  brand: 'Scoop',
  name: 'Scoop Houten Hockeystick Mid Bow Senior',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/wdn-stick-scoop-design-1-mid-bow-purple-hockeystick-senior-37-5-inch/9300000049502842/',
  imageAlt: 'Scoop Houten Hockeystick Mid Bow Senior hockeystick',
  imageUrl: 'https://media.s-bol.com/Rq2vOqAJw0OK/xG2GXVq/319x840.jpg',
  imageSourceUrl: SOURCE,
  discipline: {
    value: 'veld',
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Geschikt voor type hockey: Veldhockey".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  experienceLevel: {
    value: 'beginner',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Niveau: Beginner" en "Doelgroep: Volwassenen".',
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
    sourceLabel: 'De listing vermeldt een mid bow van 24 mm en een Maxi-krul.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 0 %" (Mulberry hout met Kevlar-elementen).',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [37.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 37,5 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 27.99,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  stock: {
    value: 'available',
    source: 'partner-shop',
    sourceLabel:
      'Bol.com toonde op de controledatum "Op voorraad. Voor 23:59 uur besteld, morgen in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een voordelige houten senior-veldstick van Scoop met mid bow en Maxi-krul.',
  strengths: {
    value: [
      'Lage prijs: kan passen bij volwassenen die net beginnen',
      'Maxi-krul maakt aannemen volgens de listing makkelijker',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Alleen in 37,5 inch gevonden',
      'Gegevens komen van een listing op bol.com, niet van een merksite',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
