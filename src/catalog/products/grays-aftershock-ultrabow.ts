import type { Product } from '../types';

// Specs from a bol.com listing (seller: Sporthuis.nl), not from the brand's own
// site. Values are copied as printed on the listing; contradicting fields are
// left out and explained in the source label.
const SOURCE =
  'https://www.bol.com/nl/nl/p/grays-aftershock-ultrabow-senior-hockeystick/9300000186027370/';
const CHECKED = '2026-10-10';

export const graysAftershockUltrabow: Product = {
  slug: 'grays-aftershock-ultrabow',
  brand: 'Grays',
  name: 'Grays Aftershock Ultrabow Senior',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/grays-aftershock-ultrabow-senior-hockeystick/9300000186027370/',
  imageAlt: 'Grays Aftershock Ultrabow Senior hockeystick',
  imageUrl: 'https://media.s-bol.com/Y94147XzwwQW/M8oXKYR/397x840.jpg',
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
      'De listing vermeldt "Niveau: Beginner". De doelgroep "Kinderen" nemen we niet over, omdat die niet past bij de seniormaat.',
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
      'De listing vermeldt "Straight bow" met een kromming van 22 mm (Grays noemt het Ultrabow).',
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
    value: [36.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont 36,5 inch.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 49.38,
    source: 'partner-shop',
    sourceLabel: 'Verkoopprijs op bol.com op de controledatum.',
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
    'Een instapstick van Grays voor volwassenen, zonder carbon en met de rustige Ultrabow, voor rond de €50.',
  strengths: {
    value: [
      'Een van de weinige sticks voor volwassen beginners onder €100',
      'Ultrabow zonder carbon: het rustigste profiel dat Grays maakt',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'De listing noemt als doelgroep "Kinderen" terwijl het een seniorstick is',
      'Gegevens komen van een listing op bol.com, niet van Grays zelf',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
