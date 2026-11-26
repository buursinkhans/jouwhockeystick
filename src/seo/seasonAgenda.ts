/**
 * The season agenda: a plain Dutch page (docs/marketing/seizoensagenda.md) generated from the
 * imported Google Trends exports, for the Orchestrator and the owner. It holds no figures of the
 * site: only the patterns of public Trends indexes (months, directions), so a public file is fine.
 * It is generated, never edited by hand: a test fails when the file and the data disagree.
 *
 * Pure functions; scripts/trends-agenda.ts writes the file.
 */
import {
  ANCHOR_TERM,
  PEAK_INDEX,
  PREPARE_WEEKS,
  WAVE_STEP,
  seasonFromExports,
  seasonProfile,
  type SeasonTheme,
  type TrendExport,
} from './trends';

export const MONTHS_NL = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'] as const;
const SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'] as const;

/** A year without a leap day, so the dates in the agenda are the same every year. */
const REFERENCE_YEAR = 2027;
const DAY_MS = 86_400_000;

/** Runs of consecutive months around the year (12 and 1 are neighbours), each in calendar order, ordered by start. */
export function runsOf(months: readonly number[]): number[][] {
  const set = new Set(months);
  if (set.size === 0) return [];
  if (set.size === 12) return [Array.from({ length: 12 }, (_, i) => i + 1)];
  const starts = [...set].filter((m) => !set.has(m === 1 ? 12 : m - 1));
  return starts
    .map((start) => {
      const run = [start];
      let next = start === 12 ? 1 : start + 1;
      while (set.has(next)) {
        run.push(next);
        next = next === 12 ? 1 : next + 1;
      }
      return run;
    })
    .sort((a, b) => (a[0] as number) - (b[0] as number));
}

const rangeText = (run: readonly number[]): string =>
  run.length === 1 ? (MONTHS_NL[(run[0] as number) - 1] as string) : `${MONTHS_NL[(run[0] as number) - 1]} tot en met ${MONTHS_NL[(run.at(-1) as number) - 1]}`;

function dayText(time: number): string {
  const d = new Date(time);
  return `${d.getUTCDate()} ${SHORT[d.getUTCMonth()]}`;
}

/** "4 jan t/m 1 feb": 8 to 4 weeks before the first day of the month. */
export function prepareWindow(month: number): string {
  const first = Date.UTC(REFERENCE_YEAR, month - 1, 1);
  return `${dayText(first - PREPARE_WEEKS.from * 7 * DAY_MS)} t/m ${dayText(first - PREPARE_WEEKS.to * 7 * DAY_MS)}`;
}

const READABLE = new Set(['goed', 'richting']);

function themeLines(theme: SeasonTheme): string[] {
  const readable = theme.termen.filter((t) => READABLE.has(t.betrouwbaarheid));
  const unreadable = theme.termen.filter((t) => !READABLE.has(t.betrouwbaarheid)).map((t) => t.term);
  const lines = [`### ${theme.thema}`, ''];
  if (readable.length === 0) {
    lines.push('Geen term met een vast jaarpatroon. Voor dit thema geeft Trends geen seizoen; gebruik Search Console.', '');
  } else {
    lines.push('| Term | Piekmaanden | Betrouwbaarheid |', '|---|---|---|');
    for (const t of readable) lines.push(`| ${t.term} | ${runsOf(t.piekmaanden).map(rangeText).join('; ') || 'geen duidelijke piek'} | ${t.betrouwbaarheid} |`);
    const union = runsOf([...new Set(readable.flatMap((t) => t.piekmaanden))]);
    lines.push('');
    for (const run of union) {
      lines.push(`- **Golf van ${rangeText(run)}.** Voorbereiden ongeveer ${prepareWindow(run[0] as number)}, zodat het klaar staat voor ${MONTHS_NL[(run[0] as number) - 1]}.`);
    }
    lines.push('');
  }
  if (unreadable.length) lines.push(`Te klein of zonder vast patroon (niet gelezen): ${unreadable.join(', ')}.`, '');
  return lines;
}

/** The whole page, or null when there is no usable reference export. */
export function agendaMarkdown(exports: readonly TrendExport[]): string | null {
  const input = seasonFromExports(exports);
  const reference = [...exports].filter((e) => e.rol === 'referentie').sort((a, b) => b.geexporteerd.localeCompare(a.geexporteerd))[0];
  const anchor = reference?.termen.find((t) => t.term === ANCHOR_TERM);
  if (!input || !reference || !anchor) return null;
  const profile = seasonProfile(anchor.punten, reference.geexporteerd.slice(0, 7));
  if (!profile) return null;

  const out: string[] = [
    '# Seizoensagenda (uit Google Trends)',
    '',
    'Dit bestand wordt gemaakt met `npm run trends:agenda` uit `data/trends/`. Pas het niet met de hand aan: een test faalt als het niet klopt met de gegevens. Handboek: `docs/seo-trends-import.md`.',
    '',
    `**Bron:** Google Trends, Nederland, Google Zoeken, een relatieve index (0 tot 100), geen zoekaantallen. Export van ${reference.geexporteerd}. Het patroon komt uit de volledige jaren ${profile.jaren[0]} tot en met ${profile.jaren.at(-1)}.`,
    '',
    '**Zo lees je het:** een golf is een maand waarin een gemiddeld jaar minstens ' + WAVE_STEP + ' indexpunten stijgt ten opzichte van de maand ervoor. Het voorbereidingsvenster van ' + PREPARE_WEEKS.from + ' tot ' + PREPARE_WEEKS.to + ' weken vóór een golf is een hypothese die we na een jaar eigen data toetsen. Per term gelezen, nooit opgeteld. Wat Trends niet kan zeggen: hoeveel mensen zoeken, en of een zoekopdracht koopintentie heeft. Daarvoor is er Search Console.',
    '',
    `## Het jaar volgens ${ANCHOR_TERM} (het anker)`,
    '',
    '| Maand | Index (jaargemiddelde is 100) | Wat er gebeurt |',
    '|---|---|---|',
  ];
  profile.index.forEach((value, i) => {
    const previous = profile.index[(i + 11) % 12] as number;
    const rise = value - previous;
    const what = [rise >= WAVE_STEP ? `golf: stijgt met ${rise}` : '', value >= PEAK_INDEX ? 'hoog' : ''].filter(Boolean).join(', ');
    out.push(`| ${MONTHS_NL[i]} | ${value} | ${what || '-'} |`);
  });

  out.push('', '## Golven en voorbereiding', '');
  const waves = profile.index.map((value, i) => ({ i, rise: value - (profile.index[(i + 11) % 12] as number) })).filter((w) => w.rise >= WAVE_STEP);
  for (const w of waves) out.push(`- **${MONTHS_NL[w.i]}:** de index stijgt met ${w.rise} punten. Voorbereiden ongeveer ${prepareWindow(w.i + 1)}.`);
  out.push('', 'Opeenvolgende golven (augustus en september) zijn één opbouw: begin met voorbereiden voor de eerste.', '', '## Per thema (per term, nooit opgeteld)', '');
  for (const theme of input.themas) out.push(...themeLines(theme));

  out.push(
    '## Wat dit betekent voor de planning',
    '',
    '- Content voor een golf maak en publiceer je binnen het voorbereidingsvenster, zodat Google de pagina kan oppikken voordat de golf begint.',
    '- Het koopseizoen voor zaal begint vroeger dan het speelseizoen: let op de piek van `zaalhockeystick` en niet alleen op die van `zaalhockey`.',
    '- Voor termen met koopintentie ("kopen", "sale", "beste") geeft Trends geen seizoen. Gebruik daarvoor Search Console.',
    '- Een thema zonder leesbare term krijgt geen seizoen uit deze agenda.',
    '- Maak elk kwartaal nieuwe exports (zie het handboek). Een export van meer dan 100 dagen oud is verouderd.',
    '',
  );
  return out.join('\n');
}
