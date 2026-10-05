import type { Product } from '../types';

// Specs from a bol.com listing (seller: Best Only), not from the brand's own
// site. Values are copied as printed on the listing; package weight is left
// out because it is not the weight of the stick.
const SOURCE =
  'https://www.bol.com/nl/nl/p/zaalhockeystick-19-indoor-mid-bow-20-carbon-hockeystick-senior-36-5-inch/9300000049502863/';
const CHECKED = '2026-10-05';

export const scoopIndoorMidBow20Carbon: Product = {
  slug: 'scoop-indoor-mid-bow-20-carbon',
  brand: 'Scoop',
  name: 'Scoop Zaalhockeystick Indoor Mid Bow 20% Carbon',
  dataStatus: 'verified',
  imageAlt: 'Scoop Zaalhockeystick Indoor Mid Bow 20% Carbon',
  imageUrl: 'https://media.s-bol.com/3nGoxvqw3Jkn/QWpV3jM/228x840.jpg',
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
    value: 'beginner',
    source: 'partner-shop',
    sourceLabel:
      'De bol.com-listing vermeldt "Niveau: Beginner" en "Doelgroep: Volwassenen"; de beschrijving noemt "de indoorhockeyspeler die houdt van controle, snelheid en nauwkeurigheid".',
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
    sourceLabel:
      'De listing vermeldt "Mid Bow" met een kromming van 19 mm op 300 mm en een "Midi"-kop.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 20,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "20% Carbon, 70% Fiberglass, 10% Aramid".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5],
    source: 'partner-shop',
    sourceLabel:
      'De listing toont ook 37,5", maar die maat was op de controledatum "Niet leverbaar".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 34.99,
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
    'Een betaalbare composiet-zaalstick met 20% carbon en een rustige mid bow (19 mm). Volgens de listing gemaakt voor spelers die "houden van controle, snelheid en nauwkeurigheid".',
  strengths: {
    value: [
      'Laagste prijs van de senior zaalsticks in onze catalogus',
      'Rustig mid bow-profiel (19 mm) met weinig carbon, een logische richting voor beginnende zaalspelers',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com; Scoop vermeldt geen modeljaar',
      'Op de controledatum alleen in 36,5" leverbaar',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
