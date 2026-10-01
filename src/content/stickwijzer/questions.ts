import type {
  AdviceAnswers,
  AdviceRoute,
  QuestionId,
} from '@/advice-engine/answers';

type Option = {
  value: string;
  label: string;
  /** When present the option is shown as a card that explains itself. */
  details?: Array<{ term: string; text: string }>;
};

export type QuestionInput =
  | { kind: 'single'; options: Option[] }
  | { kind: 'multi'; max: number; options: Option[] }
  | { kind: 'number'; min: number; max: number; unit: string }
  | {
      kind: 'scale';
      min: number;
      max: number;
      minLabel: string;
      maxLabel: string;
    };

export type QuestionDef = {
  id: QuestionId;
  question: string;
  /** Short name used when a result explains which answers an advice rule used. */
  shortLabel: string;
  helpText?: string;
  /** What the answer is used for — shown under "Waarom vragen we dit?". */
  dataUse: string;
  input: QuestionInput;
  /** Only shown when this returns true. */
  showWhen?: (answers: Partial<AdviceAnswers>) => boolean;
  /** Spread the options over the full width, with the explanation underneath. */
  fullWidth?: boolean;
};

const CONFIDENCE_SCALE: QuestionInput = {
  kind: 'scale',
  min: 1,
  max: 5,
  minLabel: 'nog onzeker',
  maxLabel: 'heel zeker',
};

const hasCurrentStick = (answers: Partial<AdviceAnswers>) =>
  answers.has_current_stick === 'yes';

export const QUESTIONS: Record<QuestionId, QuestionDef> = {
  advice_goal: {
    id: 'advice_goal',
    question: 'Voor wie zoek je een stick?',
    shortLabel: 'voor wie',
    dataUse: 'Hiermee stemmen we de toon van het advies af.',
    fullWidth: true,
    input: {
      kind: 'single',
      options: [
        { value: 'self', label: 'Voor mezelf' },
        { value: 'child', label: 'Voor mijn kind' },
        { value: 'other', label: 'Voor iemand anders' },
      ],
    },
  },
  route_self_select: {
    id: 'route_self_select',
    question: 'Welke route past het best?',
    shortLabel: 'situatie',
    dataUse:
      'De route bepaalt hoeveel we vragen en welke sticks in beeld komen. Twijfel je? Kies de eenvoudigere route; na de vragen over leeftijd en ervaring stellen we een andere route voor als die beter past, en je kunt altijd teruggaan.',
    input: {
      kind: 'single',
      options: [
        {
          value: 'first_stick',
          label: 'Start — eerste stick',
          details: [
            {
              term: 'Voor wie',
              text: 'Beginnende kinderen en nieuwe hockeyers die hun eerste stick kiezen.',
            },
            {
              term: 'Waar we op letten',
              text: 'Juiste maat, hanteerbaarheid, controle en budget. Plezier in het spel telt mee; techniek per actie vragen we niet.',
            },
            {
              term: 'Wat je krijgt',
              text: 'Alleen startmodellen. Geen extreme low bow en geen sticks met heel veel carbon.',
            },
          ],
        },
        {
          value: 'next_stick',
          label: 'Ontwikkel — volgende stick',
          details: [
            {
              term: 'Voor wie',
              text: 'Spelers die de basis kennen en ontdekken wat voor speler ze zijn.',
            },
            {
              term: 'Waar we op letten',
              text: 'Naast maat en budget ook de eerste aanname, de ontwikkeldoelen en het gewenste stickgevoel.',
            },
            {
              term: 'Wat je krijgt',
              text: 'Een logische volgende stap, met de afweging tussen controle en bijvoorbeeld 3D erbij.',
            },
          ],
        },
        {
          value: 'advanced_compare',
          label: 'Prestatie — gericht vergelijken',
          details: [
            {
              term: 'Voor wie',
              text: 'Gevorderde jeugd en senioren die precies weten wat ze in wedstrijden doen.',
            },
            {
              term: 'Waar we op letten',
              text: 'Wedstrijdacties, techniek per actie, ervaring met bow-profielen, stijfheid en gevoeligheid voor trilling.',
            },
            {
              term: 'Wat je krijgt',
              text: 'Een gedetailleerde match, ook op sticks voor ervaren spelers, met de trade-off per stick.',
            },
          ],
        },
      ],
    },
  },
  age_band: {
    id: 'age_band',
    question: 'In welke leeftijdsgroep valt de speler?',
    shortLabel: 'leeftijdsgroep',
    dataUse:
      'We vragen bewust geen geboortedatum; een leeftijdsgroep is genoeg voor het advies.',
    input: {
      kind: 'single',
      options: [
        { value: 'under_8', label: 'Onder 8' },
        { value: '8_10', label: '8–10' },
        { value: '11_12', label: '11–12' },
        { value: '13_15', label: '13–15' },
        { value: '16_18', label: '16–18' },
        { value: '18_plus', label: '18+' },
      ],
    },
  },
  experience_seasons: {
    id: 'experience_seasons',
    question: 'Hoe lang speelt de speler hockey?',
    shortLabel: 'ervaring',
    dataUse:
      'Ervaring bepaalt hoe eenvoudig of juist gedetailleerd het advies moet zijn.',
    input: {
      kind: 'single',
      options: [
        { value: 'trial', label: 'Proeflessen' },
        { value: 'lt_1', label: 'Minder dan 1 seizoen' },
        { value: '1', label: '1 seizoen' },
        { value: '2_3', label: '2–3 seizoenen' },
        { value: '4_plus', label: '4 seizoenen of meer' },
      ],
    },
  },
  height_cm: {
    id: 'height_cm',
    question: 'Hoe lang is de speler met schoenen aan?',
    shortLabel: 'lichaamslengte',
    helpText:
      'Koop niet extra groot ‘op de groei’; een te lange stick kan balcontrole en houding bemoeilijken.',
    dataUse: 'Lichaamslengte is de basis voor de sticklengte.',
    input: { kind: 'number', min: 95, max: 210, unit: 'cm' },
  },
  height_uncertain: {
    id: 'height_uncertain',
    question: 'Weet je de lengte niet precies?',
    shortLabel: 'lengte onzeker',
    helpText:
      'Meten: laat de speler met hockeyschoenen aan rechtop tegen een muur staan en meet van de vloer tot de kruin.',
    dataUse:
      'Bij een geschatte lengte geven we het lengteadvies met een ruimere marge.',
    input: {
      kind: 'single',
      options: [
        { value: 'yes', label: 'Het is een schatting' },
        { value: 'no', label: 'Ik heb gemeten' },
      ],
    },
  },
  current_length_inch: {
    id: 'current_length_inch',
    question: 'Welke sticklengte gebruikt de speler nu?',
    shortLabel: 'huidige sticklengte',
    dataUse:
      'Hiermee controleren we of het lengteadvies aansluit op de huidige stick.',
    input: {
      kind: 'single',
      options: [
        ...[
          '24',
          '26',
          '27',
          '28',
          '29',
          '30',
          '31',
          '32',
          '33',
          '34',
          '35',
          '36.5',
        ].map((value) => ({
          value,
          label: `${value.replace('.', ',')}"`,
        })),
        { value: 'unknown', label: 'Onbekend' },
      ],
    },
  },
  junior_grip_needed: {
    id: 'junior_grip_needed',
    question: 'Is een smallere juniorgrip wenselijk?',
    shortLabel: 'juniorgrip',
    dataUse:
      'We hebben nog geen geverifieerde gripgegevens per stick; dit antwoord gebruiken we nu alleen om te zien of daar behoefte aan is.',
    input: {
      kind: 'single',
      options: [
        { value: 'yes', label: 'Ja' },
        { value: 'no', label: 'Nee' },
        { value: 'unknown', label: 'Weet ik niet' },
      ],
    },
  },
  first_touch_confidence: {
    id: 'first_touch_confidence',
    question: 'Hoe gaat het aannemen van een harde bal?',
    shortLabel: 'eerste aanname',
    dataUse:
      'De eerste aanname bepaalt hoe stijf een stick mag zijn: een heel stijve stick is minder vergevingsgezind.',
    input: {
      kind: 'single',
      options: [
        { value: 'learning', label: 'Dat leer ik nog' },
        { value: 'mostly_good', label: 'Meestal goed' },
        { value: 'good_under_pressure', label: 'Ook onder druk goed' },
        { value: 'very_confident', label: 'Heel zeker' },
      ],
    },
  },
  core_skills_stage: {
    id: 'core_skills_stage',
    question: 'Wat past het best bij de basis?',
    shortLabel: 'basisvaardigheden',
    dataUse: 'Zo zien we of controle of juist verfijning voorop moet staan.',
    input: {
      kind: 'single',
      options: [
        {
          value: 'practicing_basics',
          label: 'Aannemen, passen en dribbelen oefenen',
        },
        { value: 'basics_mostly_good', label: 'De basis gaat meestal goed' },
        { value: 'refining_actions', label: 'Acties verfijnen' },
      ],
    },
  },
  playing_level: {
    id: 'playing_level',
    question: 'Op welk niveau speelt de speler?',
    shortLabel: 'speelniveau',
    dataUse: 'Alleen als achtergrond; het niveau bepaalt het advies niet.',
    input: {
      kind: 'single',
      options: [
        { value: 'training_trial', label: 'Training / proef' },
        { value: 'youth_recreational', label: 'Jeugd, recreatief' },
        { value: 'breedte', label: 'Breedteteam' },
        { value: 'selection', label: 'Selectieteam' },
        { value: 'senior_recreational', label: 'Senioren, recreatief' },
        { value: 'senior_competitive', label: 'Senioren, competitief' },
        { value: 'top', label: 'Tophockey' },
      ],
    },
  },
  training_frequency: {
    id: 'training_frequency',
    question: 'Hoe vaak hockeyt de speler per week?',
    shortLabel: 'trainingsfrequentie',
    dataUse: 'Alleen als achtergrond bij ontwikkeling en gebruik.',
    input: {
      kind: 'single',
      options: [
        { value: '1', label: '1 keer' },
        { value: '2', label: '2 keer' },
        { value: '3', label: '3 keer' },
        { value: '4_plus', label: '4 keer of vaker' },
      ],
    },
  },
  primary_goals: {
    id: 'primary_goals',
    question: 'Wat wil de speler vooral leren of verbeteren?',
    shortLabel: 'ontwikkeldoelen',
    dataUse:
      'Dit is de belangrijkste factor in de match: het doel weegt zwaarder dan de positie.',
    input: {
      kind: 'multi',
      max: 2,
      options: [
        { value: 'first_touch', label: 'Aannemen en controleren' },
        { value: 'passing', label: 'Passen en flats' },
        { value: 'hit', label: 'Harde slag' },
        { value: 'dribble_3d', label: 'Dribbelen en 3D' },
        { value: 'backhand', label: 'Backhand' },
        { value: 'aerial', label: 'Aerials' },
        { value: 'dragflick', label: 'Dragflick' },
        { value: 'allround', label: 'Allround' },
      ],
    },
  },
  fun_style: {
    id: 'fun_style',
    question: 'Waar heeft de speler het meeste plezier in?',
    shortLabel: 'speelplezier',
    dataUse:
      'Plezier zegt veel over de speelstijl, ook als die nog niet vastligt.',
    input: {
      kind: 'single',
      options: [
        { value: 'build_pass', label: 'Opbouwen en passen' },
        { value: 'join_everywhere', label: 'Overal meedoen' },
        { value: 'dribble_actions', label: 'Dribbels en acties' },
        { value: 'finishing', label: 'Afronden' },
        { value: 'defend_intercept', label: 'Verdedigen en onderscheppen' },
      ],
    },
  },
  positions: {
    id: 'positions',
    question: 'Waar speelt de speler meestal?',
    shortLabel: 'positie',
    dataUse: 'Positie is alleen een verfijning en nooit de beslissende factor.',
    input: {
      kind: 'single',
      options: [
        { value: 'defence', label: 'Verdediging' },
        { value: 'midfield', label: 'Middenveld' },
        { value: 'attack', label: 'Aanval' },
        { value: 'varying', label: 'Wisselend / nog onbekend' },
      ],
    },
  },
  match_actions_frequency: {
    id: 'match_actions_frequency',
    question: 'Welke acties komen vaak voor in wedstrijden?',
    shortLabel: 'wedstrijdacties',
    dataUse:
      'Hiermee verfijnen we de match op wat de speler in wedstrijden echt doet.',
    input: {
      kind: 'multi',
      max: 3,
      options: [
        { value: 'hard_flats', label: 'Harde flats' },
        { value: 'tempo_passes', label: 'Passes op tempo' },
        { value: 'hit', label: 'Slag' },
        { value: 'backhand', label: 'Backhand' },
        { value: 'three_d', label: '3D-acties' },
        { value: 'lift', label: 'Lift' },
        { value: 'aerial', label: 'Aerial' },
        { value: 'dragflick', label: 'Dragflick' },
      ],
    },
  },
  skill_flat_pass: {
    id: 'skill_flat_pass',
    question: 'Hoe zeker zijn flats en harde passes?',
    shortLabel: 'flats en passes',
    dataUse: 'Zegt iets over hoeveel stabiliteit en directheid passend is.',
    input: CONFIDENCE_SCALE,
  },
  skill_hit: {
    id: 'skill_hit',
    question: 'Hoe zeker is de harde slag?',
    shortLabel: 'slag',
    dataUse: 'Zegt iets over de gewenste balans tussen power en controle.',
    input: CONFIDENCE_SCALE,
  },
  skill_dribble_3d: {
    id: 'skill_dribble_3d',
    question: 'Hoe zeker zijn dribbels, lifts en 3D?',
    shortLabel: 'dribbels en 3D',
    dataUse: 'Zegt iets over welk bow-profiel aansluit.',
    input: CONFIDENCE_SCALE,
  },
  skill_aerial: {
    id: 'skill_aerial',
    question: 'Welke rol hebben aerials?',
    shortLabel: 'aerials',
    dataUse: 'Aerials wegen mee in de keuze van het bow-profiel.',
    input: {
      kind: 'single',
      options: [
        { value: 'never', label: 'Nooit' },
        { value: 'developing', label: 'In ontwikkeling' },
        { value: 'regular', label: 'Regelmatig' },
        { value: 'key_weapon', label: 'Belangrijk wapen' },
      ],
    },
  },
  skill_backhand: {
    id: 'skill_backhand',
    question: 'Hoe belangrijk is de backhand?',
    shortLabel: 'backhand',
    dataUse: 'De backhand weegt mee in de match op acties.',
    input: {
      kind: 'single',
      options: [
        { value: 'rarely', label: 'Nauwelijks' },
        { value: 'sometimes', label: 'Soms' },
        { value: 'regular', label: 'Regelmatig' },
        { value: 'very_important', label: 'Heel belangrijk' },
      ],
    },
  },
  skill_dragflick: {
    id: 'skill_dragflick',
    question: 'Welke rol heeft de dragflick?',
    shortLabel: 'dragflick',
    dataUse:
      'Een uitgesproken dragflickstick adviseren we alleen als de dragflick ook echt een rol speelt.',
    input: {
      kind: 'single',
      options: [
        { value: 'none', label: 'Geen' },
        { value: 'practicing', label: 'Aan het oefenen' },
        { value: 'sometimes', label: 'Neemt hem soms' },
        { value: 'specialist', label: 'Vaste specialist' },
      ],
    },
  },
  feel_preference: {
    id: 'feel_preference',
    question: 'Welk gevoel zoekt de speler?',
    shortLabel: 'stickgevoel',
    helpText:
      'Zacht en controlegericht: vaak prettiger bij aannemen en voor verdere basisontwikkeling. In balans: een combinatie van controle en directe passing. Direct en krachtig: een stijver, sneller gevoel; vooral passend als de eerste aanname op tempo betrouwbaar is.',
    dataUse:
      'Het gewenste gevoel vergelijken we met de stijfheid van de stick.',
    input: {
      kind: 'single',
      options: [
        { value: 'soft', label: 'Zacht en controlegericht' },
        { value: 'balanced', label: 'In balans' },
        { value: 'direct', label: 'Direct en krachtig' },
        { value: 'unknown', label: 'Weet ik niet' },
      ],
    },
  },
  stick_weight_preference: {
    id: 'stick_weight_preference',
    question: 'Welke handling voelt prettig?',
    shortLabel: 'gewichtsvoorkeur',
    dataUse:
      'Niet elk merk vermeldt het gewicht; dit antwoord telt daarom nog niet mee in de score.',
    input: {
      kind: 'single',
      options: [
        { value: 'light', label: 'Zo licht mogelijk' },
        { value: 'balanced', label: 'In balans' },
        { value: 'sturdy', label: 'Steviger en stabieler' },
        { value: 'unknown', label: 'Weet ik niet' },
      ],
    },
  },
  bow_experience: {
    id: 'bow_experience',
    question: 'Met welk bow-profiel heeft de speler ervaring?',
    shortLabel: 'bow-ervaring',
    helpText:
      'De bow is de kromming van de stick. Hoe lager en uitgesprokener de kromming, hoe meer de stick op liften en 3D is gericht.',
    dataUse:
      'Zo voorkomen we een te grote overstap naar een heel ander profiel.',
    input: {
      kind: 'single',
      options: [
        { value: 'standard', label: 'Standaard' },
        { value: 'pro_late', label: 'Pro / late bow' },
        { value: 'low', label: 'Low bow' },
        { value: 'extreme_low', label: 'Extreme low bow' },
        { value: 'unknown', label: 'Weet ik niet' },
      ],
    },
  },
  vibration_sensitivity: {
    id: 'vibration_sensitivity',
    question: 'Stoort trilling bij aannemen of harde passes?',
    shortLabel: 'trillingsgevoeligheid',
    dataUse:
      'Bij gevoeligheid voor trilling wegen we een zachter gevoel zwaarder.',
    input: {
      kind: 'single',
      options: [
        { value: 'yes', label: 'Ja' },
        { value: 'sometimes', label: 'Soms' },
        { value: 'no', label: 'Nee' },
        { value: 'unknown', label: 'Weet ik niet' },
      ],
    },
  },
  has_current_stick: {
    id: 'has_current_stick',
    question: 'Heeft de speler al een stick?',
    shortLabel: 'huidige stick',
    dataUse: 'Bij een bestaande stick vragen we wat er anders moet.',
    input: {
      kind: 'single',
      options: [
        { value: 'yes', label: 'Ja' },
        { value: 'no', label: 'Nee' },
      ],
    },
  },
  current_stick_like: {
    id: 'current_stick_like',
    question: 'Wat bevalt aan de huidige stick?',
    shortLabel: 'wat bevalt',
    dataUse: 'Sterke punten van de huidige stick willen we behouden.',
    showWhen: hasCurrentStick,
    input: {
      kind: 'multi',
      max: 2,
      options: [
        { value: 'control', label: 'Controle' },
        { value: 'power', label: 'Power' },
        { value: 'weight', label: 'Gewicht' },
        { value: 'dribbling', label: 'Dribbelen' },
        { value: 'looks', label: 'Uiterlijk' },
        { value: 'nothing_special', label: 'Niets bijzonders' },
      ],
    },
  },
  current_stick_problem: {
    id: 'current_stick_problem',
    question: 'Wat wil de speler anders?',
    shortLabel: 'wat anders moet',
    dataUse: 'Dit geeft de richting van de verandering aan.',
    showWhen: hasCurrentStick,
    input: {
      kind: 'multi',
      max: 2,
      options: [
        { value: 'too_heavy', label: 'Te zwaar' },
        { value: 'too_light', label: 'Te licht' },
        { value: 'too_hard', label: 'Te hard' },
        { value: 'too_soft', label: 'Te zacht' },
        { value: 'hard_to_receive', label: 'Lastig aannemen' },
        { value: 'little_power', label: 'Weinig power' },
        { value: 'hard_to_lift', label: 'Lastig liften' },
        { value: 'too_short', label: 'Te kort' },
        { value: 'too_long', label: 'Te lang' },
        { value: 'damaged', label: 'Beschadigd' },
        { value: 'outgrown', label: 'Uitgegroeid' },
        { value: 'unknown', label: 'Weet ik niet' },
      ],
    },
  },
  replacement_reason: {
    id: 'replacement_reason',
    question: 'Waarom zoek je nu een stick?',
    shortLabel: 'aanleiding',
    dataUse: 'Hiermee stemmen we de uitleg bij het advies af.',
    input: {
      kind: 'single',
      options: [
        { value: 'first_stick', label: 'Eerste stick' },
        { value: 'outgrown', label: 'Uit de maat gegroeid' },
        { value: 'damaged', label: 'Beschadigd' },
        { value: 'next_step', label: 'Volgende stap' },
        { value: 'new_season', label: 'Nieuw seizoen' },
        { value: 'other', label: 'Anders' },
      ],
    },
  },
  budget_band: {
    id: 'budget_band',
    question: 'Welk bedrag is passend voor alleen de stick?',
    shortLabel: 'budget',
    helpText: 'We rekenen met richtprijzen, geen live winkelprijzen.',
    dataUse:
      'Sticks boven je budget laten we weg, tenzij je eerst wilt vergelijken.',
    input: {
      kind: 'single',
      options: [
        { value: 'lt_75', label: 'Tot €75' },
        { value: '75_125', label: '€75–125' },
        { value: '125_175', label: '€125–175' },
        { value: '175_250', label: '€175–250' },
        { value: 'gt_250', label: 'Meer dan €250' },
        { value: 'compare_first', label: 'Eerst vergelijken' },
      ],
    },
  },
  purchase_timing: {
    id: 'purchase_timing',
    question: 'Wanneer is de stick nodig?',
    shortLabel: 'timing',
    dataUse: 'Alleen als achtergrond; we hebben geen live levertijden.',
    input: {
      kind: 'single',
      options: [
        { value: 'this_week', label: 'Deze week' },
        { value: 'within_2_weeks', label: 'Binnen 2 weken' },
        { value: 'before_season', label: 'Voor het seizoen' },
        { value: 'orienting', label: 'Ik oriënteer me' },
      ],
    },
  },
  availability_preference: {
    id: 'availability_preference',
    question: 'Wat is belangrijker?',
    shortLabel: 'beschikbaarheid',
    helpText:
      'Onze voorraadstatus is een indicatie, geen live koppeling. Controleer de beschikbaarheid altijd bij de winkel.',
    dataUse:
      'Bij "alleen direct leverbaar" tonen we alleen sticks die als beschikbaar zijn gemarkeerd.',
    input: {
      kind: 'single',
      options: [
        { value: 'only_direct', label: 'Alleen direct leverbaar' },
        {
          value: 'best_match_later',
          label: 'De beste match, ook als die later komt',
        },
        { value: 'no_preference', label: 'Geen voorkeur' },
      ],
    },
  },
  left_handed_requirement: {
    id: 'left_handed_requirement',
    question: 'Is een linkshandige (omgekeerde) stick nodig?',
    shortLabel: 'linkshandige stick',
    helpText:
      'Twijfel je? Kies dan "Weet ik niet"; je krijgt gewoon een advies voor een reguliere stick.',
    dataUse:
      'Bij een uitzondering tonen we geen verkeerde stick, maar verwijzen we naar persoonlijke hulp.',
    input: {
      kind: 'single',
      options: [
        { value: 'no', label: 'Nee' },
        { value: 'yes', label: 'Ja' },
        { value: 'unknown', label: 'Weet ik niet' },
      ],
    },
  },
};

export type ScreenDef = {
  id: string;
  title: string;
  /** Always visible on the screen. */
  questions: QuestionId[];
  /** Shown below the required questions, marked as optional. */
  optional?: QuestionId[];
};

export const FIRST_SCREEN: ScreenDef = {
  id: 'who',
  title: 'Voor wie en welke route',
  questions: ['advice_goal', 'route_self_select'],
};
const AGE_EXPERIENCE: ScreenDef = {
  id: 'age_experience',
  title: 'Leeftijd en ervaring',
  questions: ['age_band', 'experience_seasons'],
};
const CURRENT_STICK: ScreenDef = {
  id: 'current_stick',
  title: 'Huidige stick',
  questions: ['has_current_stick', 'replacement_reason'],
  optional: ['current_stick_like', 'current_stick_problem'],
};
const BUDGET: ScreenDef = {
  id: 'budget',
  title: 'Budget',
  questions: ['budget_band'],
  optional: ['availability_preference', 'purchase_timing'],
};

/**
 * Screens per route. START is capped at six screens (spec §4.1); the longer
 * routes ask one required question per screen where that stays workable.
 */
export const SCREENS: Record<AdviceRoute, ScreenDef[]> = {
  START: [
    FIRST_SCREEN,
    AGE_EXPERIENCE,
    {
      id: 'height',
      title: 'Lengte',
      questions: ['height_cm', 'left_handed_requirement'],
      optional: ['height_uncertain', 'junior_grip_needed'],
    },
    {
      ...CURRENT_STICK,
      title: 'Eerste stick of vervanging',
      optional: ['current_stick_problem'],
    },
    {
      id: 'fun',
      title: 'Plezier en basis',
      questions: ['fun_style', 'core_skills_stage'],
    },
    BUDGET,
  ],
  ONTWIKKEL: [
    FIRST_SCREEN,
    AGE_EXPERIENCE,
    {
      id: 'height',
      title: 'Lengte',
      questions: ['height_cm', 'left_handed_requirement'],
      optional: [
        'height_uncertain',
        'current_length_inch',
        'junior_grip_needed',
      ],
    },
    {
      id: 'first_touch',
      title: 'Aannemen',
      questions: ['first_touch_confidence'],
      optional: ['playing_level', 'training_frequency'],
    },
    { id: 'core_skills', title: 'Basis', questions: ['core_skills_stage'] },
    { id: 'goals', title: 'Ontwikkeldoelen', questions: ['primary_goals'] },
    {
      id: 'fun',
      title: 'Speelstijl',
      questions: ['fun_style'],
      optional: ['positions'],
    },
    { id: 'feel', title: 'Stickgevoel', questions: ['feel_preference'] },
    CURRENT_STICK,
    BUDGET,
  ],
  PRESTATIE: [
    FIRST_SCREEN,
    AGE_EXPERIENCE,
    {
      id: 'height',
      title: 'Lengte',
      questions: ['height_cm', 'left_handed_requirement'],
      optional: ['height_uncertain', 'current_length_inch'],
    },
    {
      id: 'first_touch',
      title: 'Aannemen',
      questions: ['first_touch_confidence'],
      optional: ['playing_level', 'training_frequency'],
    },
    {
      id: 'goals',
      title: 'Doelen',
      questions: ['primary_goals'],
      optional: ['positions'],
    },
    {
      id: 'match_actions',
      title: 'Wedstrijdacties',
      questions: ['match_actions_frequency'],
    },
    {
      id: 'skills_ground',
      title: 'Techniek: passen, slag en 3D',
      questions: ['skill_flat_pass', 'skill_hit', 'skill_dribble_3d'],
    },
    {
      id: 'skills_special',
      title: 'Techniek: aerial, backhand en dragflick',
      questions: ['skill_aerial', 'skill_backhand', 'skill_dragflick'],
    },
    {
      id: 'feel',
      title: 'Stickgevoel',
      questions: ['feel_preference'],
      optional: [
        'bow_experience',
        'vibration_sensitivity',
        'stick_weight_preference',
      ],
    },
    CURRENT_STICK,
    BUDGET,
  ],
};

export const ROUTE_LABELS: Record<AdviceRoute, string> = {
  START: 'Startroute',
  ONTWIKKEL: 'Ontwikkelroute',
  PRESTATIE: 'Prestatieroute',
};
