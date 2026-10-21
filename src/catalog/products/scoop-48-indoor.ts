import type { Product } from '../types';

// Specs from a bol.com listing (seller: ACM Products B.V.), not from the brand's
// own site. Values are copied as printed on the listing; package weight is left
// out because it is not the weight of the stick. The listing contradicts
// itself on bow and carbon (title: "Ultra Bow" and "20% Carbon"; specification:
// "Mid bow" and "30 %"; description: "30% carbon", bowpoint 300 mm), so
// bowProfile and carbonPercentage are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/48-zaalhockeystick-indoor-ultra-bow-30-carbon-hockeystick-senior/9300000127587970/';
const CHECKED = '2026-10-20';

export const scoop48Indoor: Product = {
  slug: 'scoop-48-indoor',
  brand: 'Scoop',
  name: 'Scoop #48 Zaalhockeystick Indoor',
  dataStatus: 'verified',
  bolProductUrl: SOURCE,
  imageAlt: 'Scoop #48 zaalhockeystick',
  imageUrl: 'https://media.s-bol.com/gDx61P9KMpgZ/Gwy9Dy/318x840.jpg',
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
    value: 'gevorderd',
    source: 'partner-shop',
    sourceLabel:
      'De bol.com-listing vermeldt "Niveau: Gevorderde"; de beschrijving noemt "de technische indoor speler".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel: 'De listing noemt geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5, 37.5],
    source: 'partner-shop',
    sourceLabel: 'De listing vermeldt "Size (inch): 36,5" / 37,5"".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 39.99,
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
      'Bol.com toonde op de controledatum "Op voorraad. Voor 23:59 uur besteld, morgen in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een betaalbare zaalstick van Scoop die op bol.com als gevorderdenniveau staat omschreven, met een midi-kop en 19 mm kromming. Kan passen bij een technische zaalspeler met een klein budget.',
  strengths: {
    value: [
      'Lage prijs voor een zaalstick die op niveau "gevorderd" is omschreven',
      'Beschikbaar in twee lengtes (36,5" en 37,5")',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'De listing is op een aantal punten tegenstrijdig (bow en carbonpercentage), daarom tonen we die niet',
      'Gegevens komen van een winkel-listing op bol.com; Scoop vermeldt geen modeljaar',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
