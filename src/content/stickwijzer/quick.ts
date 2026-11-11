import { routeStepRange } from './progress';

/** Heading above the optional extra questions of the quick route. */
export const EXTRA_QUESTIONS_HEADING = 'Wil je nog meer meegeven?';

/** Texts of the two ways into the stickwijzer (UX phase 1, 2026-11-08). */
export const ADVICE_MODE_TEXT = {
  question: 'Hoe wil je kiezen?',
  options: [
    {
      value: 'quick',
      label: 'Snel advies · 2 stappen',
      description: 'Voor ouders en beginners: leeftijd, lengte, ervaring en budget. Geen vaktermen.',
    },
    {
      value: 'full',
      label: `Uitgebreid advies · ${routeStepRange()}`,
      description: 'Met speelwensen, techniek en stickgevoel: meer vragen, meer kenmerken in het advies.',
    },
  ] as const satisfies readonly { value: 'quick' | 'full'; label: string; description: string }[],
  /** Above a quick result: what it is based on, and the way to a more precise advice. */
  resultNote:
    'Dit snelle advies gaat uit van leeftijd, lengte, ervaring en budget. Speelwensen en techniek hebben we niet gevraagd; de uitgebreide stickwijzer kijkt daar wel naar.',
} as const;
