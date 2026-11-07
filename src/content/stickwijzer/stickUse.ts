/**
 * The first question of the stickwijzer and its exits (2026-11-08). The
 * stickwijzer advises field sticks only; there are no checked rules for a
 * keeper stick, so a keeper gets personal advice instead.
 */
export type StickUse = 'veld' | 'zaal' | 'keeper';

export const STICK_USE_TEXT = {
  question: 'Waarvoor zoek je een stick?',
  options: [
    { value: 'veld', label: 'Veldhockey' },
    { value: 'zaal', label: 'Zaalhockey' },
    { value: 'keeper', label: 'Keeper' },
  ] as const satisfies readonly { value: StickUse; label: string }[],
  exits: {
    zaal: {
      title: 'Voor de zaal hebben we een eigen keuzehulp',
      body: 'Een zaalstick is lichter en dunner dan een veldstick, en deze stickwijzer adviseert alleen veldsticks. De zaalkeuze vraagt naar de speler, de lengte en het budget, en toont de zaalsticks die passen.',
      cta: 'Naar de zaalkeuze',
      href: '/zaalsticks#zaal-selector-heading',
    },
    keeper: {
      title: 'Voor keepers geven we persoonlijk advies',
      body: 'Een keepersstick kies je op andere punten dan een veldstick, en daar hebben we nog geen gecontroleerde adviesregels voor. Stel je vraag, dan denken we met je mee.',
      cta: 'Stel je vraag',
      href: '/interesse?source=stickwijzer-keeper',
    },
  },
} as const;
