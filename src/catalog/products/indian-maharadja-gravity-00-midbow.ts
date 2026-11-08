import type { Product } from '../types';

// Specs from a bol.com listing, not from the brand's own site (not readable on
// the check date). Values are copied as printed on the listing; package weight
// and the struck-through price are left out. The listing contradicts itself on
// carbon (description mentions carbon/aramid reinforcement, spec says 0%), so no
// carbonPercentage is filled in. It also lists the target group as "Kinderen"
// while offering 36,5" only; that field is not used.
const SOURCE =
  'https://www.bol.com/nl/nl/p/the-indian-maharadja-gravity-00-midbow-hockeystick/9300000234269571/';
const CHECKED = '2026-11-03';

export const indianMaharadjaGravity00Midbow: Product = {
  slug: 'indian-maharadja-gravity-00-midbow',
  brand: 'The Indian Maharadja',
  name: 'The Indian Maharadja Gravity 00 Midbow',
  dataStatus: 'verified',
  bolProductUrl: SOURCE,
  imageAlt: 'The Indian Maharadja Gravity 00 Midbow hockeystick',
  imageUrl: 'https://media.s-bol.com/m3jvXvWGx25p/5Qv8vWY/550x382.jpg',
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
    sourceLabel: 'De listing vermeldt "Niveau: Beginner".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  recommendedPositions: {
    value: ['verdediger', 'middenvelder', 'aanvaller'],
    source: 'editorial-estimate',
    sourceLabel:
      'De listing noemt de stick geschikt voor de allround hockeyer; geen specifieke positie.',
    lastVerifiedAt: CHECKED,
  },
  bowProfile: {
    value: 'midbow',
    source: 'partner-shop',
    sourceLabel:
      'De listing vermeldt "Mid bow", 24 mm op 300 mm, met een micro haak.',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  lengthsInches: {
    value: [36.5],
    source: 'partner-shop',
    sourceLabel: 'De listing toont alleen 36,5".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  priceIndicativeEur: {
    value: 68.15,
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
      'Bol.com toonde op de controledatum "Op voorraad. Voor 22:00 uur besteld, morgen in huis".',
    sourceUrl: SOURCE,
    lastVerifiedAt: CHECKED,
  },
  summary:
    'Een glasvezelcomposiet veldstick met mid bow (24 mm) en micro haak, volgens de listing bedoeld voor de allround hockeyer die balcontrole en slagkracht wil combineren.',
  strengths: {
    value: [
      'Mid bow met micro haak: een allround profiel voor dribbelen, passen en slaan',
      'Volgens de listing beginnersniveau, wat kan passen bij een eerste composietstick',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
  pointsOfAttention: {
    value: [
      'Gegevens komen van een winkel-listing; de listing spreekt zichzelf tegen over carbon, dus geen percentage vermeld',
      'Alleen in 36,5" gevonden en geen modeljaar vermeld',
    ],
    source: 'editorial-estimate',
    sourceLabel:
      'Eigen inschatting op basis van de op bol.com vermelde specificaties.',
    lastVerifiedAt: CHECKED,
  },
};
