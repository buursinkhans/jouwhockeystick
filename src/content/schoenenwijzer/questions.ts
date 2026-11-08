import type { ShoeAnswers } from '@/shoe-advice/answers';
import type { FitParticular } from '@/shoe-advice/fitNotes';

/**
 * The questions of the schoenenwijzer (docs/spec/hockeyschoenen-keuzemodel.md
 * §5): the eight main questions, follow-ups only where the answer changes the
 * selection or the explanation, and the shoe size. Copy only; the rules are in
 * src/shoe-advice. The follow-ups about the current shoe (brand, model, what
 * fits) are left out in v1: they change neither the selection nor the
 * explanation yet (decision log 2026-11-01).
 */

/** Answers while filling in, question 7 included (it stays in the browser). */
export type ShoeQuizState = Partial<ShoeAnswers> & { fitParticulars?: FitParticular[] };

type Option = { value: string; label: string };

export type ShoeQuestion = {
  id: keyof ShoeQuizState;
  /** Main question number in the keuzemodel; follow-ups share it. */
  number: number;
  question: string;
  helpText?: string;
  kind: 'single' | 'multi' | 'boolean' | 'size';
  /** For multi: at most this many choices. */
  max?: number;
  /** Optional questions can be skipped. */
  optional?: boolean;
  options: Option[];
  /** Shown only when this returns true. */
  showIf?: (state: ShoeQuizState) => boolean;
};

const field = (s: ShoeQuizState) => s.purpose === 'veld' || s.purpose === 'beide';
const notKeeper = (s: ShoeQuizState) => s.player !== 'keeper';

export const SHOE_QUESTIONS: ShoeQuestion[] = [
  {
    id: 'purpose',
    number: 1,
    question: 'Waarvoor zoek je schoenen?',
    kind: 'single',
    options: [
      { value: 'veld', label: 'Veldhockey' },
      { value: 'zaal', label: 'Zaalhockey' },
      { value: 'beide', label: 'Voor beide een apart paar' },
    ],
  },
  {
    id: 'player',
    number: 2,
    question: 'Voor wie zoek je?',
    kind: 'single',
    options: [
      { value: 'kind', label: 'Kind dat nog groeit' },
      { value: 'jeugd', label: 'Jeugdspeler' },
      { value: 'volwassene', label: 'Volwassene' },
      { value: 'keeper', label: 'Keeper' },
    ],
  },
  {
    id: 'surface',
    number: 3,
    question: 'Op welke ondergrond speel je meestal?',
    helpText: 'Denk aan trainingen én uitwedstrijden, niet alleen aan je thuisveld.',
    kind: 'single',
    showIf: (s) => notKeeper(s) && field(s),
    options: [
      { value: 'bijna-alleen-water', label: 'Bijna alleen waterveld' },
      { value: 'vooral-water', label: 'Vooral waterveld, soms zand- of semi-waterveld' },
      { value: 'gemengd', label: 'Ongeveer even vaak op verschillende veldtypen' },
      { value: 'vooral-zand-semi', label: 'Vooral zand- of semi-waterveld' },
      { value: 'weet-niet', label: 'Weet ik niet' },
    ],
  },
  {
    id: 'secondSurface',
    number: 3,
    question: 'Welke tweede ondergrond gebruik je regelmatig?',
    kind: 'single',
    optional: true,
    showIf: (s) => notKeeper(s) && field(s) && (s.surface === 'vooral-water' || s.surface === 'vooral-zand-semi'),
    options: [
      { value: 'water', label: 'Waterveld' },
      { value: 'zand', label: 'Zandveld' },
      { value: 'semi-water', label: 'Semi-waterveld' },
      { value: 'geen', label: 'Geen tweede ondergrond' },
    ],
  },
  {
    id: 'frequency',
    number: 4,
    question: 'Hoe vaak gebruik je de schoenen?',
    kind: 'single',
    showIf: notKeeper,
    options: [
      { value: '1x', label: 'Ongeveer één keer per week' },
      { value: '2-3x', label: 'Twee tot drie keer per week' },
      { value: '4x-plus', label: 'Vier keer per week of vaker' },
    ],
  },
  {
    id: 'session',
    number: 4,
    question: 'Zijn het meestal korte sessies of vaak trainingen en wedstrijden van een uur of langer?',
    kind: 'single',
    optional: true,
    showIf: notKeeper,
    options: [
      { value: 'kort', label: 'Meestal korte sessies' },
      { value: 'lang', label: 'Vaak een uur of langer' },
    ],
  },
  {
    id: 'fitIssues',
    number: 5,
    question: 'Hoe sluiten sportschoenen meestal aan?',
    helpText: 'Meerdere antwoorden mogelijk. Voorvoet, hiel en wreef bekijken we apart.',
    kind: 'multi',
    showIf: notKeeper,
    options: [
      { value: 'goed', label: 'Meestal goed; geen duidelijke pasproblemen' },
      { value: 'krap-voorvoet', label: 'Vaak te krap bij de voorvoet' },
      { value: 'ruim-hiel', label: 'Vaak te ruim bij de hiel' },
      { value: 'druk-wreef', label: 'Vaak druk boven op de voet of wreef' },
      { value: 'schuiven', label: 'Mijn voeten schuiven regelmatig in de schoen' },
      { value: 'weet-niet', label: 'Ik weet het niet' },
    ],
  },
  {
    id: 'movements',
    number: 6,
    question: 'Wat beschrijft jouw spel het beste?',
    helpText: 'Kies maximaal twee.',
    kind: 'multi',
    max: 2,
    showIf: notKeeper,
    options: [
      { value: 'sprints', label: 'Veel korte sprints en plotseling stoppen' },
      { value: 'zijwaarts', label: 'Veel zijwaarts bewegen en draaien' },
      { value: 'loopmeters', label: 'Veel loopmeters gedurende de wedstrijd' },
      { value: 'allround', label: 'Afwisselend of allround' },
      { value: 'beginner', label: 'Ik ben beginner of weet het nog niet' },
    ],
  },
  {
    id: 'position',
    number: 6,
    question: 'Op welke positie speel je meestal?',
    helpText: 'Alleen ter informatie: je positie verandert de selectie niet, je bewegingen wel.',
    kind: 'single',
    optional: true,
    showIf: notKeeper,
    options: [
      { value: 'aanval', label: 'Aanval' },
      { value: 'middenveld', label: 'Middenveld' },
      { value: 'verdediging', label: 'Verdediging' },
      { value: 'wisselend', label: 'Wisselend' },
    ],
  },
  {
    id: 'fitParticulars',
    number: 7,
    question: 'Zijn er bijzonderheden voor het passen?',
    helpText: 'Meerdere antwoorden mogelijk. Dit antwoord blijft in je browser: het gaat niet naar ons, niet in de statistieken en niet in de deellink.',
    kind: 'multi',
    showIf: notKeeper,
    options: [
      { value: 'inlegzool-brace', label: 'Ik gebruik eigen inlegzolen of een brace' },
      { value: 'pijn-blessure', label: 'Ik heb terugkerende pijn of een recente blessure' },
      { value: 'blaren-schuiven', label: 'Ik heb vooral blaren, drukplekken of schuiven' },
      { value: 'geen', label: 'Geen bijzonderheden' },
    ],
  },
  {
    id: 'budget',
    number: 8,
    question: 'Wat is je budget voor één paar?',
    kind: 'single',
    showIf: notKeeper,
    options: [
      { value: 'tot-50', label: 'Tot € 50' },
      { value: '50-80', label: '€ 50 tot € 80' },
      { value: '80-110', label: '€ 80 tot € 110' },
      { value: '110-plus', label: 'Meer dan € 110' },
      { value: 'geen', label: 'Geen vast budget' },
    ],
  },
  {
    id: 'allowAboveBudget',
    number: 8,
    question: 'Mogen we ook een duurder alternatief laten zien?',
    kind: 'boolean',
    showIf: (s) => notKeeper(s) && s.budget !== undefined && s.budget !== 'geen' && s.budget !== '110-plus',
    options: [
      { value: 'true', label: 'Ja, als alternatief' },
      { value: 'false', label: 'Nee, alleen binnen mijn budget' },
    ],
  },
  {
    id: 'preferences',
    number: 8,
    question: 'Wat vind je daarnaast belangrijk?',
    helpText: 'Kies maximaal twee. Een voorkeur weegt pas mee als ondergrond en pasvorm kloppen.',
    kind: 'multi',
    max: 2,
    showIf: notKeeper,
    options: [
      { value: 'comfort', label: 'Comfort' },
      { value: 'stevig', label: 'Stevige aansluiting' },
      { value: 'licht', label: 'Licht gevoel' },
      { value: 'slijtvast', label: 'Slijtvastheid' },
      { value: 'vocht', label: 'Bescherming tegen vocht bij buitengebruik' },
      { value: 'geen', label: 'Geen voorkeur' },
    ],
  },
  {
    id: 'size',
    number: 9,
    question: 'Welke schoenmaat zoek je?',
    helpText: 'Een EU-maat is geen volledige pasvorm. Weet je het nog niet, kies dan "Maat nog bepalen".',
    kind: 'size',
    showIf: notKeeper,
    options: [],
  },
];

export const NO_SIZE = 'nog-bepalen';
export const NO_SIZE_LABEL = 'Maat nog bepalen';

export const visibleQuestions = (state: ShoeQuizState) => SHOE_QUESTIONS.filter((q) => !q.showIf || q.showIf(state));

/** The main question of each number: the first question with that number (keuzemodel §5). */
const MAIN_IDS = new Set(
  SHOE_QUESTIONS.filter((q, i) => q.kind !== 'size' && SHOE_QUESTIONS.findIndex((other) => other.number === q.number) === i).map((q) => q.id),
);

export type QuizProgress = {
  /** The real position: every screen counts, follow-ups and the size included. */
  step: number;
  steps: number;
  /** Which main question this screen belongs to, among the main questions shown for these answers. */
  main: number;
  mains: number;
  kind: 'hoofdvraag' | 'vervolgvraag' | 'maat';
};

/**
 * Where the player is (decision log 2026-11-01): "Vraag 3 van 8" counts the
 * main questions that are shown (7 for indoor, 2 for a keeper), a follow-up
 * keeps the number of its main question, the size is the last step, and the
 * real step count stays visible next to it. Recomputed from the answers on
 * every screen, so branching and going back keep it right.
 */
export function quizProgress(questions: readonly ShoeQuestion[], index: number): QuizProgress {
  const at = Math.max(0, Math.min(index, questions.length - 1));
  const question = questions[at]!;
  const mainsShown = questions.filter((q) => MAIN_IDS.has(q.id));
  const main = questions.slice(0, at + 1).filter((q) => MAIN_IDS.has(q.id)).length;
  return {
    step: at + 1,
    steps: questions.length,
    main: Math.max(main, 1),
    mains: mainsShown.length,
    kind: question.kind === 'size' ? 'maat' : MAIN_IDS.has(question.id) ? 'hoofdvraag' : 'vervolgvraag',
  };
}

/** "Vraag 3 van 8", "Vraag 3 van 8 · aanvullende vraag" or "Laatste stap: je maat". */
export function progressLabel(progress: QuizProgress): string {
  if (progress.kind === 'maat') return 'Laatste stap: je maat';
  const base = `Vraag ${progress.main} van ${progress.mains}`;
  return progress.kind === 'vervolgvraag' ? `${base} · aanvullende vraag` : base;
}

/**
 * The questions the progress counts: the ones shown, but while question 1
 * is still open as if it were field hockey (the longest path), so the count
 * does not jump from "van 7" to "van 8" after the first answer.
 */
export const progressQuestions = (state: ShoeQuizState) =>
  visibleQuestions(state.purpose === undefined ? { ...state, purpose: 'veld' } : state);
