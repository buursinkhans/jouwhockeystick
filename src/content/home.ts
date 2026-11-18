/**
 * Homepage blocks under the hero. Copy lives here, not in the components.
 * Two variants are being compared; HOME_INTRO_VARIANT picks the live one.
 */
export type HomeIntroVariant = 'season' | 'buying';

export const HOME_INTRO_VARIANT: HomeIntroVariant = 'season';

/**
 * The indoor season band is shown from October through February (the
 * Dutch indoor competition usually runs December–February; parents orient
 * themselves before that). Months are 1-based.
 */
const INDOOR_SEASON_MONTHS = [10, 11, 12, 1, 2];

export function isIndoorSeason(date: Date = new Date()): boolean {
  return INDOOR_SEASON_MONTHS.includes(date.getMonth() + 1);
}

/**
 * The compact indoor block under the hero (owner, 2026-11-18): the direct way
 * to /zaalsticks and to the advice for parents. Independent of the Black
 * Friday campaign: the campaign card sits below it.
 */
export const SEASON_BAND = {
  heading: 'Een zaalhockeystick kiezen',
  body: 'Vind zaalsticks in de juiste maat en binnen je budget.',
  cta: { label: 'Vergelijk zaalhockeysticks', href: '/zaalsticks' },
  readMore: {
    label: 'Zaalstick voor je kind kiezen',
    href: '/kennis/zaalstick-voor-kinderen',
  },
} as const;

export const BUYING_INTRO = {
  heading: 'Een goede stick begint bij jouw spel',
  paragraphs: [
    'Een goede hockeystick hoeft niet de duurste te zijn. Begin bij de speler: je ervaring, de acties die je het meest maakt en je budget. Kijk daarna naar kromming en stickgevoel, en controleer als laatste de lengte.',
  ],
  readMore: {
    label: 'Welke hockeystick kopen? Kies in drie stappen',
    href: '/kennis/hoe-kies-je-de-juiste-hockeystick',
  },
  special: {
    heading: 'Een bijzondere stick: de zaalstick',
    body: 'In de zaal speel je laag en kort en mag je niet slaan. Daar tellen een lichte stick en balcontrole meer dan slagkracht.',
    link: { label: 'Zo kies je een zaalhockeystick', href: '/zaalsticks' },
  },
} as const;
