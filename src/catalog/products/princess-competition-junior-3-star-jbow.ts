import type { Product } from '../types';

// Specs from a bol.com listing (seller: Plutosport.nl), not from the brand's own
// site. Values are copied as printed on the listing; package weight, "was"
// prices and contradicting fields are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/princess-competition-junior-3-star-j-bow-light-blue-white-hockeystick/9300000317136532/';
const CHECKED = '2026-10-05';

export const princessCompetitionJunior3StarJbow: Product = {
  slug: 'princess-competition-junior-3-star-jbow',
  brand: 'Princess',
  name: 'Princess Competition Junior 3 STAR J-Bow',
  dataStatus: 'verified',
  imageAlt: 'Princess Competition Junior 3 STAR J-Bow hockeystick',
  imageUrl: 'https://media.s-bol.com/5YnnLx73RKlX/APvJq2z/550x517.jpg',
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
      'De listing vermeldt "Niveau: Beginner"; volgens de beschrijving "ondersteunt [de mid bow] je bij het leren van de juiste slagtechniek".',
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
      'De listing vermeldt "Mid Bow (MB)" met een kromming van 19 mm en een J-vormige kop.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 15,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 15%" en "Materiaal: Glasvezel".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 36".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 76.42,
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
      'Bol.com toonde op de controledatum "Voor 22:00 uur besteld, morgen in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een junior-veldstick van Princess met 15% carbon en mid bow (19 mm); volgens de listing zorgt dat "voor controle en comfort".',
  strengths: {
    value: [
      'Laag carbonpercentage (15%), wat doorgaans past bij een zacht, controlegericht gevoel',
      'Rustige mid bow (19 mm)',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com, niet van Princess zelf; geen modeljaar vermeld',
      'Alleen in 36" gevonden',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
