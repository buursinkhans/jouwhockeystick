import type { Product } from '../types';

// Specs from a bol.com listing (seller: Plutosport.nl), not from the brand's own
// site. Values are copied as printed on the listing; package weight, "was"
// prices and contradicting fields are left out.
const SOURCE =
  'https://www.bol.com/nl/nl/p/the-indian-maharadja-red-jr-hockeystick/9300000112645904/';
const CHECKED = '2026-10-05';

export const indianMaharadjaRedJunior: Product = {
  slug: 'indian-maharadja-red-junior',
  brand: 'The Indian Maharadja',
  name: 'The Indian Maharadja Red Jr Kinder Veldhockeystick',
  dataStatus: 'verified',
  bolProductUrl:
    'https://www.bol.com/nl/nl/p/the-indian-maharadja-red-jr-hockeystick/9300000112645904/',
  imageAlt: 'The Indian Maharadja Red Jr Kinder Veldhockeystick hockeystick',
  imageUrl: 'https://media.s-bol.com/JjGmlKA4YKvK/R6kRP4z/539x840.jpg',
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
      'De listing vermeldt "Niveau: Beginner" en noemt het een stick "voor jongere allround speler die uit de houten sticks groeien".',
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
      'De listing vermeldt "Mid bow" met een kromming van 24 mm en een "Midi"-kop.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  carbonPercentage: {
    value: 0,
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Percentage carbon: 0%" en "Materiaal: Glasvezel".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [33, 34, 35],
    source: 'partner-shop',
    sourceLabel: 'Maten zoals in de maatkeuze van de listing.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 45.37,
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
    'Een junior-veldstick van glasvezel met mid bow, volgens de listing voor de "jongere allround speler die uit de houten sticks groeien".',
  strengths: {
    value: [
      'Verkrijgbaar in 33", 34" en 35", waaronder de lastig te vinden 33 inch',
      'Glasvezel zonder carbon: een logische stap na een houten stick',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing op bol.com; geen modeljaar vermeld',
      'Een vermelde "van"-prijs nemen we niet over',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
