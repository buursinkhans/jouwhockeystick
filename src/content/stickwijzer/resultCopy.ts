import type { AdviceRoute, Goal } from '@/advice-engine/answers';
import { feelFromCarbon } from '@/advice-engine/carbon';
import type { SizeAdvice } from '@/advice-engine/sizeAdvice';
import type {
  AdviceReason,
  CautionCode,
  NoMatchReason,
  ResultRole,
  StickFeel,
} from '@/advice-engine/types';
import { BOW_LABELS } from '@/catalog/labels';
import type { ExperienceLevel, Product } from '@/catalog/types';

export function formatInch(inch: number): string {
  return `${String(inch).replace('.', ',')} inch`;
}

export const ROUTE_RESULT_COPY: Record<
  AdviceRoute,
  { title: string; summary: string }
> = {
  START: {
    title: 'Een goede start begint met een stick die makkelijk hanteert.',
    summary:
      'Voor een beginnende speler zijn passende lengte, hanteerbaarheid en controle belangrijker dan maximale slagkracht of een specialistische kromming.',
  },
  ONTWIKKEL: {
    title: 'Een stick die past bij wat de speler nu wil leren.',
    summary:
      'We hebben eerst gekeken naar maat, ervaring en budget en daarna naar de doelen en het gewenste stickgevoel. Zo zie je een logische volgende stap, met de afweging erbij.',
  },
  PRESTATIE: {
    title: 'Een gerichte match op acties, techniek en stickgevoel.',
    summary:
      'Maat, ervaring en budget zijn vaste voorwaarden. Daarna wegen de acties die vaak voorkomen, het bow-profiel en het gewenste gevoel het zwaarst. Elke keuze heeft een afweging; die staat erbij.',
  },
};

/** Fixed closing line for the START route (spec §4.3). */
export const START_FOOTNOTE =
  'Een stick maakt een speler niet automatisch beter. De juiste maat en een stick waarmee aannemen, passen en dribbelen prettig voelen, geven de beste basis om te leren.';

export const ADVICE_DISCLAIMER =
  'Dit advies is een hulpmiddel. De juiste maat, techniek, speelstijl en het gevoel in de hand bepalen samen wat de beste keuze is; een stick even vasthouden of testen blijft de moeite waard.';

/** Short version of the fixed transparency text (spec addendum §11). */
export const TRANSPARENCY_NOTE =
  'We vertellen niet alleen wát we adviseren, maar ook waarop dat is gebaseerd. Per stick maken we onderscheid tussen gegevens van de fabrikant en onze eigen redactionele adviesregels. Eigen metingen en praktijktests hebben we nog niet; dat staat er dan ook bij.';

export const SELLER_NOTE =
  'jouwhockeystick.nl verkoopt zelf geen sticks. Je koopt bij de winkel waar je naartoe klikt; die winkel is de verkoper. De getoonde prijs is een richtprijs, geen actuele winkelprijs.';

export const GROWTH_WARNING =
  'Koop niet extra groot ‘op de groei’; een te lange stick kan balcontrole en houding bemoeilijken.';

const ROLE_LABELS: Record<ResultRole, string> = {
  best_match: 'Beste match',
  safe_choice: 'Veilige keuze',
  ambitious_choice: 'Ambitieuze keuze',
  closest_option: 'Dichtstbijzijnde optie',
  other_size: 'Alternatief in een andere maat',
};

const START_ROLE_LABELS: Partial<Record<ResultRole, string>> = {
  best_match: 'Beste start',
  ambitious_choice: 'Iets ambitieuzer',
};

export function roleLabel(role: ResultRole, route: AdviceRoute): string {
  return (
    (route === 'START' ? START_ROLE_LABELS[role] : undefined) ??
    ROLE_LABELS[role]
  );
}

export const ROLE_INTRO: Record<ResultRole, string> = {
  best_match: 'Een sterke match voor deze antwoorden.',
  safe_choice:
    'Een rustiger of gelijkwaardig alternatief dat niet lastiger speelt dan de beste match.',
  ambitious_choice:
    'Eén stap vooruit — passend als de basis er staat, maar niet noodzakelijk.',
  closest_option:
    'Geen duidelijke match: dit komt het dichtst in de buurt, maar past op meerdere punten minder goed.',
  other_size:
    'Niet in de geadviseerde maat beschikbaar; dit is één maat korter.',
};

export const GOAL_LABELS: Record<Goal, string> = {
  first_touch: 'aannemen en controleren',
  passing: 'passen en flats',
  hit: 'de harde slag',
  dribble_3d: 'dribbelen en 3D',
  backhand: 'de backhand',
  aerial: 'aerials',
  dragflick: 'de dragflick',
  allround: 'allround spel',
};

const FEEL_LABELS: Record<StickFeel, string> = {
  soft: 'zacht en controlegericht',
  balanced: 'in balans',
  direct: 'direct en krachtig',
};

const EXPERIENCE_REASON: Record<ExperienceLevel, string> = {
  beginner:
    'Deze stick is gepositioneerd voor beginnende spelers; dat sluit aan bij de opgegeven ervaring.',
  gevorderd:
    'Deze stick is gepositioneerd voor spelers die de basis beheersen en zich verder ontwikkelen.',
  ervaren:
    'Deze stick is gepositioneerd voor ervaren spelers; dat sluit aan bij de opgegeven ervaring.',
};

function listGoals(goals: Goal[]): string {
  const labels = goals.map((goal) => GOAL_LABELS[goal]);
  return labels.length <= 1
    ? labels.join('')
    : `${labels.slice(0, -1).join(', ')} en ${labels.at(-1)}`;
}

/** Nuanced, Dutch reason text. Product facts are read from the catalog, never typed here. */
export function reasonText(
  reason: AdviceReason,
  product: Product,
  route: AdviceRoute,
): string {
  const bow = product.bowProfile
    ? BOW_LABELS[product.bowProfile.value]
    : 'bow-profiel';
  const carbon = product.carbonPercentage?.value;

  switch (reason.code) {
    case 'SIZE_AVAILABLE':
      return `Beschikbaar in de geadviseerde maat (${formatInch(reason.inch ?? 0)}).`;
    case 'SIZE_ALTERNATIVE':
      return `Beschikbaar in ${formatInch(reason.inch ?? 0)}, de tweede maat uit het lengteadvies.`;
    case 'EXPERIENCE_FIT':
      return EXPERIENCE_REASON[product.experienceLevel.value];
    case 'CONTROL_FOCUS':
      return `Met ${carbon}% carbon is dit een relatief zachte, controlegerichte opbouw; dat past doorgaans beter bij het leren aannemen en passen.`;
    case 'GOAL_FIT':
      return `Het profiel ${bow} is een logische richting voor ${listGoals(reason.goals ?? [])}.`;
    case 'BOW_FIT':
      return route === 'START'
        ? `Het profiel ${bow} is rustig en minder specialistisch dan een (extreme) low bow.`
        : `Het profiel ${bow} sluit aan bij deze route en de opgegeven voorkeuren.`;
    case 'FEEL_FIT': {
      const feel = feelFromCarbon(carbon);
      return feel === null
        ? 'De stijfheid sluit aan bij het gezochte gevoel.'
        : `Met ${carbon}% carbon sluit de stijfheid aan bij het gezochte gevoel (${FEEL_LABELS[feel]}).`;
    }
    case 'BUDGET_FIT':
      return 'De richtprijs valt binnen het opgegeven budget.';
    case 'BUDGET_BELOW':
      return 'De richtprijs blijft onder het opgegeven budget.';
    case 'SPECS_VERIFIED':
      return 'De kernspecificaties van deze stick zijn bij de bron gecontroleerd.';
  }
}

/** Always a possibility ("kan"), never an absolute warning or a guarantee. */
export const CAUTION_TEXT: Record<CautionCode, string> = {
  OTHER_SIZE:
    'Dit is niet de geadviseerde maat. Een maat korter kan werken, maar pas de stick bij voorkeur eerst in de hand of vraag persoonlijk advies.',
  AMBITIOUS_STEP:
    'Dit is een stap vooruit en is in de eerste maanden niet noodzakelijk. Kies deze alleen als aannemen en passen al betrouwbaar gaan.',
  HIGH_CARBON_STEP:
    'Deze stick heeft een hoger carbonpercentage. Dat kan stugger en minder vergevingsgezind aanvoelen bij het aannemen.',
  LOWBOW_TRADEOFF:
    'Een lage kromming is gericht op liften en 3D. Dat kan het aannemen en strak vlak passen iets lastiger maken dan met een rustiger profiel.',
  LESS_POWER:
    'Deze stick is minder gericht op maximale slagkracht dan een stijvere stick met veel carbon.',
  CARBON_UNKNOWN:
    'Er is geen carbonpercentage vermeld. De stijfheid is daardoor niet goed te vergelijken met andere sticks.',
  MODEL_YEAR_UNCONFIRMED:
    'Het modeljaar is niet bevestigd. Controleer bij de winkel welke uitvoering je krijgt; specificaties kunnen per seizoen verschillen.',
  BIG_BOW_CHANGE:
    'Dit profiel wijkt duidelijk af van het profiel waarmee de speler ervaring heeft. Reken op een gewenningsperiode.',
  DIRECT_FEEL_VIBRATION:
    'Een stijve, directe stick kan meer trilling doorgeven bij harde ballen.',
};

export const LESS_SUITABLE_FOR: Record<ExperienceLevel, string> = {
  beginner:
    'Minder passend als de speler aantoonbaar technisch verder is en een directere stick zoekt.',
  gevorderd: 'Minder passend als aannemen en passen nog niet stabiel gaan.',
  ervaren: 'Minder passend voor spelers die de basistechniek nog ontwikkelen.',
};

export const NO_MATCH_TEXT: Record<NoMatchReason, string> = {
  data: 'We hebben op dit moment geen sticks met volledig gecontroleerde gegevens om uit te adviseren.',
  length:
    'We hebben op dit moment geen passende stick in de geadviseerde maat. We tonen geen andere maat als beste match.',
  experience:
    'In de geadviseerde maat hebben we op dit moment geen stick die bij de opgegeven ervaring past.',
  safety:
    'De sticks in deze maat zijn te stijf of te specialistisch voor de opgegeven techniek. We adviseren ze daarom niet.',
  budget:
    'In de geadviseerde maat hebben we op dit moment geen passende stick binnen het opgegeven budget.',
  availability:
    'De sticks die verder passen zijn niet als direct leverbaar gemarkeerd. We tonen daarom geen stick in een verkeerde maat.',
};

export const LEFT_HANDED_REFERRAL =
  'Je gaf aan dat een linkshandige (omgekeerde) stick nodig is. Onze catalogus bevat alleen reguliere sticks; we tonen daarom geen product dat niet past. Geef je vraag door, dan helpen we je persoonlijk verder.';

export function sizeAdviceText(size: SizeAdvice): string[] {
  const lines: string[] = [];
  if (size.alternativeInch === undefined) {
    lines.push(
      `Op basis van de lichaamslengte is ${formatInch(size.primaryInch)} een logische maat.`,
    );
  } else if (size.basis === 'borderline') {
    lines.push(
      `De speler zit op de grens tussen twee maten: ${formatInch(size.primaryInch)} is het uitgangspunt, ${formatInch(size.alternativeInch)} kan ook passen. Pas bij twijfel beide in de hand.`,
    );
  } else {
    lines.push(
      `In deze lengtegroep komen twee maten voor: ${formatInch(size.primaryInch)} is het uitgangspunt, ${formatInch(size.alternativeInch)} kan ook passen.`,
    );
  }
  if (size.confidence === 'low') {
    lines.push(
      'De lengte is een schatting. Meet de speler na voordat je koopt.',
    );
  }
  if (size.differsFromCurrentInch !== undefined) {
    lines.push(
      `De huidige stick (${formatInch(size.differsFromCurrentInch)}) wijkt meer dan één maat af van dit advies. Controleer de lengte voordat je kiest.`,
    );
  }
  lines.push(GROWTH_WARNING);
  return lines;
}
