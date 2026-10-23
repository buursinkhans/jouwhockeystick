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

export const SEASON_BAND = {
  eyebrow: 'Zaalseizoen',
  heading: 'Zaalhockeystick kiezen voor het zaalseizoen',
  body: 'Een zaalhockeystick is gemaakt voor pushen en balcontrole in een kleine ruimte, en de stickwijzer adviseert alleen veldsticks. Kies daarom in 3 vragen een zaalstick in de juiste maat.',
  cta: { label: 'Zaalhockeystick kiezen', href: '/zaalsticks' },
  readMore: {
    prefix: 'Of lees eerst:',
    label: 'Zaalstick voor kinderen: waar let je op?',
    href: '/kennis/zaalstick-voor-kinderen',
  },
} as const;

export const BUYING_INTRO = {
  heading: 'Een goede stick begint bij jouw spel',
  paragraphs: [
    'Een goede hockeystick hoeft niet de duurste te zijn. Begin bij de juiste lengte, je ervaring en de acties die je het meest maakt. Carbon en kromming verfijnen daarna de keuze, niet andersom.',
  ],
  readMore: {
    label: 'Zo kies je een stick die bij je past',
    href: '/blog/hockeystick-kopen',
  },
  special: {
    heading: 'Een bijzondere stick: de zaalstick',
    body: 'In de zaal speel je laag en kort en mag je niet slaan. Daar tellen een lichte stick en balcontrole meer dan slagkracht.',
    link: { label: 'Zo kies je een zaalhockeystick', href: '/zaalsticks' },
  },
} as const;
