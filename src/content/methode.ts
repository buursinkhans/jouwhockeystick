/**
 * De Jouwhockeystick-methode: the name and the one-sentence description of
 * how this site picks a stick (decision log 2026-11-11). Every page that
 * mentions the method imports its text from here, so the wording cannot
 * drift between pages. The text only describes what the advice engine does
 * (src/advice-engine/scoring.ts and docs in src/content/methodiek.ts);
 * methodiek.test.ts fails when the two stop matching.
 *
 * Deliberately not in the text: "bewezen", "gecertificeerd", "objectief",
 * "onafhankelijk", "beste", a trademark sign, or any claim of outside review
 * or testing. The method is an editorial way of working, and says so.
 *
 * This file has no imports on purpose: it is plain content.
 */
export const METHODE = {
  /** One spelling everywhere: capital J, hyphen. */
  name: 'Jouwhockeystick-methode',
  /** Memory aid, used as a caption next to the name. */
  tagline: 'speler, stick, maat',

  /** The official sentence. Quoted word for word on /methodiek only. */
  kernzin:
    'Volgens de Jouwhockeystick-methode kies je een hockeystick in de volgorde speler, stick, maat: eerst niveau, speelwensen en budget, dan bow-profiel en stickgevoel, en als laatste de lengte.',
  /** Shorter and longer versions of the same description. */
  s25: 'De Jouwhockeystick-methode kiest een hockeystick in de volgorde speler, stick, maat: eerst niveau, speelwensen en budget, dan bow-profiel en stickgevoel, en als laatste de lengte.',
  m50: 'De Jouwhockeystick-methode is de volgorde waarin jouwhockeystick.nl een hockeystick adviseert. Eerst de speler: niveau, speelwensen en budget. Dan de stick: bow-profiel en stickgevoel, waarvoor het carbonpercentage een indicatie is. Als laatste de maat: past de stick niet in de juiste lengte, dan adviseren we hem niet. Winkelvergoedingen tellen niet mee.',
  l100: 'De Jouwhockeystick-methode is de volgorde waarin jouwhockeystick.nl een hockeystick adviseert: eerst de speler, dan de stick, als laatste de maat. Bij de speler tellen niveau, speelwensen en budget; bij jeugd tot en met 15 jaar telt ook de leeftijd. Bij de stick tellen bow-profiel en stickgevoel, waarvoor het carbonpercentage een indicatie is. Positie is alleen een verfijning. Wat niet past, valt af, ook als de stick niet in de juiste lengte bestaat. Je krijgt maximaal drie sticks, met redenen en bron. Winkelvergoedingen tellen niet mee. Het is een redactionele werkwijze en niet wetenschappelijk getoetst; specificaties komen van merk of winkel.',

  /** /methodiek: page title (H1 and metadata). */
  h1: 'De Jouwhockeystick-methode: hoe wij een hockeystick adviseren',
  metaTitle: 'De Jouwhockeystick-methode: speler, stick, maat',
  metaDescription:
    'Zo adviseert jouwhockeystick.nl een hockeystick: eerst de speler, dan de stick, als laatste de maat. Met bronlabels, en winkelvergoedingen tellen niet mee.',
  howToName: 'De Jouwhockeystick-methode: speler, stick, maat',
  oneMinuteHeading: 'In 1 minuut',

  /** Homepage band. */
  home: {
    eyebrow: 'Onze methode',
    heading: 'Zo kiezen wij een stick: speler, stick, maat',
    body: 'Dit is de Jouwhockeystick-methode. Eerst kijken we naar de speler: niveau, speelwensen en budget. Daarna naar de stick: bow-profiel en stickgevoel. Als laatste controleren we de maat. Wat niet past, valt af. Winkelvergoedingen tellen niet mee.',
    cta: 'Lees hoe de methode werkt',
  },

  /** One sentence under the H1 of /stickwijzer. Contains `name` exactly once. */
  stickwijzer:
    'De stickwijzer past de Jouwhockeystick-methode toe: eerst de speler, dan de stick, als laatste de maat. Je krijgt maximaal drie sticks, elk met de redenen en de bron.',

  /** Extra question for the FAQ on /stickwijzer. */
  faq: {
    question: 'Hoe komt het advies tot stand?',
    link: '/methodiek#methode',
  },

  /** The three parts, in the order the engine weighs them. */
  partsHeading: 'Speler, stick, maat',
  parts: [
    {
      id: 'speler',
      title: 'Speler',
      lead: 'Eerst kijken we naar de speler: het niveau, de speelwensen (je speelstijl) en het budget. Bij jeugd tot en met 15 jaar telt ook de leeftijd.',
      counts: ['Niveau', 'Speelwensen (je speelstijl)', 'Budget'],
      origin:
        'Herkomst: jouw antwoorden en onze redactionele adviesregels. Positie is een verfijning en nooit de beslissende factor.',
      articles: ['hockeystick-kinderen-en-beginners'],
    },
    {
      id: 'stick',
      title: 'Stick',
      lead: 'Dan kijken we naar de stick: het bow-profiel en het stickgevoel. Het carbonpercentage is daarbij een indicatie van het stickgevoel.',
      counts: ['Bow-profiel', 'Stickgevoel (carbonpercentage als indicatie)'],
      origin:
        'Herkomst: fabrikantgegevens voor bow-profiel en carbonpercentage, met controledatum. Welk bow-profiel bij welk doel past, is een redactionele adviesregel.',
      articles: ['low-bow-vs-mid-bow', 'meer-carbon-hockeystick-beter'],
    },
    {
      id: 'maat',
      title: 'Maat',
      lead: 'Als laatste controleren we de maat. De lengte volgt uit je lichaamslengte zonder schoenen. Is de stick er niet in de juiste lengte, dan adviseren we hem niet.',
      counts: ['Lengte als harde voorwaarde'],
      origin:
        'Herkomst: de lengtetabel is een indicatie van onze redactie. Welke lengtes een stick heeft, komt van het merk of de winkel.',
      articles: ['hockeystick-lengte-tabel'],
    },
  ],

  /** "What the method does not do": the limits, stated by us. */
  limitsHeading: 'Wat de methode niet doet',
  limits: [
    'Ze is een redactionele werkwijze en niet wetenschappelijk getoetst.',
    'De regels zijn door de redactie opgesteld en niet extern beoordeeld.',
    'Er zijn geen eigen metingen of praktijktests. Specificaties komen van het merk of de winkel.',
    'Een advies is geen garantie en geen diagnose. Een stick even vasthouden blijft de moeite waard.',
    'Positie is een verfijning en geen reden op zich voor een advies.',
    'Winkelvergoedingen tellen niet mee in de score.',
  ],
} as const;

export type MethodePart = (typeof METHODE.parts)[number];
