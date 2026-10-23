/**
 * Conversion report (read-only): turns weekly PostHog counts into a Dutch
 * report of where visitors drop off and what leads to a click to a shop (bol.com or PassaHockey).
 * Pure functions — the PostHog queries live in scripts/conversion-report.ts.
 *
 * PostHog runs cookieless on this site with a server-side hash that changes
 * every day. A visitor can therefore be followed within one day, not across
 * days: the funnel counts "visitor-days" (one visitor on one day), and a
 * visitor who comes back on three days counts three times.
 */

export type Period = { start: string; end: string };

/** One breakdown value with its count this week and the week before. */
export type Count = { key: string; now: number; before: number };

export type ConversionData = {
  current: Period;
  previous: Period;
  /** Events per name ($pageview, retailer_click). */
  events: Count[];
  /**
   * Visitor-days per funnel step: `visitors` (any visit), `started`,
   * `route`, `completed`, `clicked` (got advice and then clicked to a shop
   * that same day) and `clickers` (clicked to a shop at all).
   */
  funnel: Count[];
  /** Visitor-days that answered each question (`question_answered`). */
  questions: Count[];
  /** `question_answered` visitors per "ROUTE|questionId" (sent when a screen is left with Volgende). */
  questionsByRoute: Count[];
  /** `advice_completed` visitors per route. */
  adviceByRoute: Count[];
  /** `advice_completed` per answerKey: `match` or the no-match reason. */
  adviceOutcomes: Count[];
  /** `advice_feedback_submitted` per answerKey (`helpful` / `not_helpful`). */
  feedback: Count[];
  clicksByPlacement: Count[];
  clicksByLinkType: Count[];
  /** `retailer_click` per shop (bol.com, PassaHockey). */
  clicksByRetailer: Count[];
  /** `retailer_click` per "brand productName". */
  clicksByProduct: Count[];
  /** `retailer_click` per page path. */
  clicksByPage: Count[];
  pageviewsByPage: Count[];
  /** Visitors (per day) per "utm:<source>" or referring domain ("$direct" when none). */
  visitorsByReferrer: Count[];
  /** `home_block_click` per "block → target". */
  homeBlocks: Count[];
  deadClicksByPage: Count[];
  /** `$dead_click` per "page · element": which element looks clickable but is not. */
  deadClicksByElement: Count[];
  rageClicksByPage: Count[];
  /** Events this week from other hosts than the live site (e.g. Netlify previews). */
  otherHostEvents: number;
};

/** Thresholds are low on purpose: the site is young and data is sparse. */
export const THRESHOLDS = {
  /** Below this many stickwijzer starts the signals are only a direction. */
  minStarts: 20,
  /** Relative drop in completion rate that is worth a signal. */
  completionDrop: 0.25,
  /** Minimum count at a step before its drop-off is reported. */
  minStepCount: 10,
  /** Share of completed advice without a match that is worth a signal. */
  noMatchShare: 0.15,
  minCompleted: 10,
  minFeedback: 5,
  deadClicks: 5,
  rageClicks: 3,
  /** Stick pages with at least this many views and no click to a shop. */
  stickPageViews: 30,
};

const LIST_LIMIT = 10;

/**
 * Short utm_source values the apps add themselves (Instagram tags its bio
 * link with `utm_source=ig`), mapped to the full network name.
 */
const UTM_SOURCE_ALIASES: Record<string, string> = {
  ig: 'instagram',
  fb: 'facebook',
  yt: 'youtube',
};

/** Groups a referring domain (or "utm:<source>") into a channel a person recognises. */
export function sourceLabel(key: string): string {
  const k = key.toLowerCase();
  if (k.startsWith('utm:')) {
    const raw = k.slice(4);
    const source = UTM_SOURCE_ALIASES[raw] ?? raw;
    if (/tiktok|instagram|youtube|facebook/.test(source)) return `Social: ${source}`;
    return `Campagne: ${source}`;
  }
  if (k === '' || k === '$direct') return 'Direct';
  if (k.includes('jouwhockeystick')) return 'Eigen site';
  if (/(^|\.)google\./.test(k)) return 'Google';
  if (/(^|\.)(bing|duckduckgo|ecosia|yahoo)\./.test(k)) return 'Andere zoekmachine';
  if (/(^|\.)(instagram|facebook|tiktok|youtube|linkedin|pinterest|twitter|whatsapp)\.|(^|\.)(t\.co|x\.com)$/.test(k)) {
    return `Social: ${k.replace(/^(www|m|l|lm)\./, '').split('.')[0]}`;
  }
  if (/(^|\.)(chatgpt|openai|perplexity|copilot|gemini)\.|(^|\.)claude\.ai$/.test(k)) return 'AI-assistent';
  return `Andere site: ${k.replace(/^www\./, '')}`;
}

/** Adds up the counts per channel, largest first. */
export function groupSources(counts: readonly Count[]): Count[] {
  const totals = new Map<string, Count>();
  for (const count of counts) {
    const key = sourceLabel(count.key);
    const total = totals.get(key) ?? { key, now: 0, before: 0 };
    total.now += count.now;
    total.before += count.before;
    totals.set(key, total);
  }
  return [...totals.values()].sort((a, b) => b.now - a.now || b.before - a.before);
}

const FUNNEL_STEPS = [
  { key: 'started', label: 'Stickwijzer gestart' },
  { key: 'route', label: 'Route gekozen' },
  { key: 'completed', label: 'Advies gekregen' },
  { key: 'clicked', label: 'Daarna doorgeklikt naar een winkel' },
] as const;

const NO_MATCH_LABELS: Record<string, string> = {
  match: 'Met passende stick',
  verification: 'Geen match: geen geverifieerde sticks',
  length: 'Geen match: lengte',
  availability: 'Geen match: beschikbaarheid',
  budget: 'Geen match: budget',
};

export function countOf(counts: Count[], key: string): Count {
  return counts.find((count) => count.key === key) ?? { key, now: 0, before: 0 };
}

export function sum(counts: Count[]): { now: number; before: number } {
  return counts.reduce(
    (total, count) => ({ now: total.now + count.now, before: total.before + count.before }),
    { now: 0, before: 0 },
  );
}

export function rate(part: number, whole: number): number | null {
  return whole > 0 ? part / whole : null;
}

function percent(value: number | null): string {
  return value === null ? '–' : `${Math.round(value * 100)}%`;
}

function change(now: number, before: number): string {
  if (before === 0) return now === 0 ? '–' : 'nieuw';
  const delta = (now - before) / before;
  const rounded = Math.round(delta * 100);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

function cell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function table(header: string[], rows: string[][]): string {
  if (rows.length === 0) return '_Geen data._';
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map((_, index) => (index === 0 ? '---' : '---:')).join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(cell).join(' | ')} |`),
  ].join('\n');
}

function countRows(counts: Count[], label = (key: string) => key): string[][] {
  return [...counts]
    .sort((a, b) => b.now - a.now || b.before - a.before)
    .slice(0, LIST_LIMIT)
    .map((count) => [label(count.key || '(onbekend)'), String(count.now), String(count.before), change(count.now, count.before)]);
}

/**
 * Drop-off per question, in the order the stickwijzer asks them. Each step
 * is compared with the step before it; the first step with the stickwijzer
 * start. Steps with too few answers are left out of the "largest drop" pick.
 */
export function questionDropOff(
  data: Pick<ConversionData, 'funnel' | 'questions'>,
  stepOrder: string[],
): { questionId: string; now: number; fromPrevious: number | null }[] {
  let previous = countOf(data.funnel, 'started').now;
  return stepOrder.map((questionId) => {
    const now = countOf(data.questions, questionId).now;
    const fromPrevious = rate(now, previous);
    previous = now;
    return { questionId, now, fromPrevious };
  });
}

export function largestDropOff(
  steps: ReturnType<typeof questionDropOff>,
): { questionId: string; lost: number } | null {
  let worst: { questionId: string; lost: number } | null = null;
  for (const step of steps) {
    if (step.fromPrevious === null || step.now < THRESHOLDS.minStepCount) continue;
    const lost = 1 - step.fromPrevious;
    if (lost > 0 && (!worst || lost > worst.lost)) worst = { questionId: step.questionId, lost };
  }
  return worst;
}

/** Signals worth the owner's attention, most important first. */
export function signals(data: ConversionData, stepOrder: string[]): string[] {
  const found: string[] = [];
  const started = countOf(data.funnel, 'started');
  const completed = countOf(data.funnel, 'completed');

  const rateNow = rate(completed.now, started.now);
  const rateBefore = rate(completed.before, started.before);
  if (
    rateNow !== null &&
    rateBefore !== null &&
    started.now >= THRESHOLDS.minStarts &&
    rateBefore > 0 &&
    (rateBefore - rateNow) / rateBefore >= THRESHOLDS.completionDrop
  ) {
    found.push(
      `**Minder bezoekers maken de stickwijzer af:** ${percent(rateNow)} van wie start krijgt een advies, was ${percent(rateBefore)}.`,
    );
  }

  const worst = largestDropOff(questionDropOff(data, stepOrder));
  if (worst && worst.lost >= 0.2) {
    found.push(
      `**Grootste afhaakmoment:** bij \`${worst.questionId}\` haakt ${percent(worst.lost)} af ten opzichte van de stap ervoor.`,
    );
  }

  const outcomes = sum(data.adviceOutcomes);
  const noMatch = outcomes.now - countOf(data.adviceOutcomes, 'match').now;
  if (outcomes.now >= THRESHOLDS.minCompleted && noMatch / outcomes.now >= THRESHOLDS.noMatchShare) {
    const reasons = data.adviceOutcomes
      .filter((count) => count.key !== 'match' && count.now > 0)
      .sort((a, b) => b.now - a.now)
      .map((count) => `${NO_MATCH_LABELS[count.key] ?? count.key} (${count.now})`)
      .join(', ');
    found.push(
      `**Adviezen zonder passende stick:** ${percent(noMatch / outcomes.now)} (${noMatch} van ${outcomes.now}). ${reasons}. Mogelijk een gat in de catalogus.`,
    );
  }

  const helpful = countOf(data.feedback, 'helpful').now;
  const notHelpful = countOf(data.feedback, 'not_helpful').now;
  if (helpful + notHelpful >= THRESHOLDS.minFeedback && notHelpful > helpful) {
    found.push(`**Meer "niet nuttig" dan "nuttig"** bij het advies: ${notHelpful} tegen ${helpful}.`);
  }

  const search = countOf(data.clicksByLinkType, 'search').now;
  if (search > 0) {
    found.push(
      `**${search} klik(ken) naar een bol.com-zoekopdracht** in plaats van een productpagina. Alle sticks horen een directe link of "niet verkrijgbaar" te hebben.`,
    );
  }

  for (const page of data.deadClicksByPage.filter((count) => count.now >= THRESHOLDS.deadClicks)) {
    found.push(`**${page.now} dead clicks op \`${page.key}\`:** bezoekers klikken op iets wat niets doet.`);
  }
  for (const page of data.rageClicksByPage.filter((count) => count.now >= THRESHOLDS.rageClicks)) {
    found.push(`**${page.now} rage clicks op \`${page.key}\`:** herhaald snel klikken wijst op frustratie.`);
  }

  const clickedPages = new Set(data.clicksByPage.filter((count) => count.now > 0).map((count) => count.key));
  const quietStickPages = data.pageviewsByPage
    .filter(
      (count) =>
        count.key.startsWith('/sticks/') &&
        count.now >= THRESHOLDS.stickPageViews &&
        !clickedPages.has(count.key),
    )
    .sort((a, b) => b.now - a.now)
    .slice(0, 5);
  for (const page of quietStickPages) {
    found.push(`**\`${page.key}\` is ${page.now} keer bekeken, zonder klik naar de winkel.**`);
  }

  return found;
}

/** One screen of a route, recognised by a required question that is always asked. */
export type ScreenStep = { title: string; questionId: string };

const ROUTE_NAMES: Record<string, string> = { START: 'Start', ONTWIKKEL: 'Ontwikkel', PRESTATIE: 'Prestatie' };

/**
 * Per route: how many visitors finished each screen, and the share of the
 * screen before. Shows where in a route people stop, not only which question.
 */
export function routeFunnel(
  data: Pick<ConversionData, 'questionsByRoute' | 'adviceByRoute'>,
  route: string,
  steps: readonly ScreenStep[],
): { title: string; now: number; fromPrevious: number | null }[] {
  const rows = [
    ...steps.map((step) => ({ title: step.title, now: countOf(data.questionsByRoute, `${route}|${step.questionId}`).now })),
    { title: 'Advies gekregen', now: countOf(data.adviceByRoute, route).now },
  ];
  return rows.map((row, index) => {
    const previous = index === 0 ? null : (rows[index - 1]?.now ?? 0);
    return { ...row, fromPrevious: previous ? row.now / previous : null };
  });
}

export function formatReport(
  data: ConversionData,
  stepOrder: string[],
  routeSteps: Record<string, readonly ScreenStep[]> = {},
): string {
  const visitors = countOf(data.funnel, 'visitors');
  const started = countOf(data.funnel, 'started');
  const clickers = countOf(data.funnel, 'clickers');
  const pageviews = countOf(data.events, '$pageview');
  const clicks = countOf(data.events, 'retailer_click');
  const lowData = started.now < THRESHOLDS.minStarts;
  const found = signals(data, stepOrder);

  const funnel = FUNNEL_STEPS.map((step, index) => {
    const count = countOf(data.funnel, step.key);
    return [
      step.label,
      String(count.now),
      percent(rate(count.now, index === 0 ? visitors.now : started.now)),
      String(count.before),
      change(count.now, count.before),
    ];
  });

  const steps = questionDropOff(data, stepOrder).map((step) => [
    `\`${step.questionId}\``,
    String(step.now),
    percent(step.fromPrevious),
  ]);

  const lines = [
    '# Conversie-rapport',
    '',
    `Periode: ${data.current.start} t/m ${data.current.end}, vergeleken met ${data.previous.start} t/m ${data.previous.end}. Bron: PostHog (EU), alleen jouwhockeystick.nl.`,
    '',
    '## Stand',
    '',
    table(
      ['', 'Deze week', 'Vorige week', 'Verschil'],
      [
        ['Bezoekers (per dag geteld)', String(visitors.now), String(visitors.before), change(visitors.now, visitors.before)],
        ['Paginaweergaven', String(pageviews.now), String(pageviews.before), change(pageviews.now, pageviews.before)],
        ['Stickwijzer gestart', String(started.now), String(started.before), change(started.now, started.before)],
        ['Bezoekers met een klik naar een winkel', String(clickers.now), String(clickers.before), change(clickers.now, clickers.before)],
        ['Kliks naar een winkel', String(clicks.now), String(clicks.before), change(clicks.now, clicks.before)],
        ['Doorklikratio (bezoekers)', percent(rate(clickers.now, visitors.now)), percent(rate(clickers.before, visitors.before)), ''],
      ],
    ),
    '',
    '## Signalen',
    '',
    ...(lowData
      ? [`_Weinig data (minder dan ${THRESHOLDS.minStarts} starts deze week): zie de signalen als richting, niet als conclusie._`, '']
      : []),
    found.length > 0 ? found.map((line) => `- ${line}`).join('\n') : 'Geen opvallende signalen.',
    '',
    '## Stickwijzer-trechter',
    '',
    'Per bezoeker per dag. Eerste regel: % van alle bezoekers; daarna: % van wie startte.',
    '',
    table(['Stap', 'Deze week', '%', 'Vorige week', 'Verschil'], funnel),
    '',
    '### Per vraag (verplichte vragen in alle routes)',
    '',
    table(['Vraag', 'Bezoekers', 't.o.v. vorige stap'], steps),
    '',
    ...Object.entries(routeSteps).flatMap(([route, routeStepList]) => {
      const funnel = routeFunnel(data, route, routeStepList);
      if ((funnel[0]?.now ?? 0) === 0) return [];
      return [
        `### Route ${ROUTE_NAMES[route] ?? route}: per scherm`,
        '',
        table(
          ['Scherm afgerond', 'Bezoekers', 't.o.v. vorig scherm'],
          funnel.map((row) => [row.title, String(row.now), percent(row.fromPrevious)]),
        ),
        '',
      ];
    }),
    '### Uitkomst van het advies',
    '',
    table(['Uitkomst', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.adviceOutcomes, (key) => NO_MATCH_LABELS[key] ?? key)),
    '',
    `Feedback: ${countOf(data.feedback, 'helpful').now} nuttig, ${countOf(data.feedback, 'not_helpful').now} niet nuttig.`,
    '',
    '## Kliks naar de winkels',
    '',
    '### Per winkel',
    '',
    table(['Winkel', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.clicksByRetailer)),
    '',
    '### Per plek',
    '',
    table(['Plek', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.clicksByPlacement)),
    '',
    '### Per stick (top 10)',
    '',
    table(['Stick', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.clicksByProduct)),
    '',
    '### Per pagina (top 10)',
    '',
    table(['Pagina', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.clicksByPage)),
    '',
    `Linktype: ${countOf(data.clicksByLinkType, 'product').now} naar een productpagina, ${countOf(data.clicksByLinkType, 'search').now} naar een zoekopdracht.`,
    '',
    '## Meest bekeken pagina\'s (top 10)',
    '',
    table(['Pagina', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.pageviewsByPage)),
    '',
    '## Waar bezoekers vandaan komen',
    '',
    table(['Bron', 'Deze week', 'Vorige week', 'Verschil'], countRows(groupSources(data.visitorsByReferrer))),
    '',
    '_Per bezoeker per dag. "Direct" is ook een link uit WhatsApp, e-mail of een app, en je eigen bezoeken: die geven geen bron mee._',
    '',
    '## Homepage-blokken',
    '',
    table(['Blok → doel', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.homeBlocks)),
    '',
    '## Frustratie',
    '',
    '### Dead clicks (klik op iets wat niets doet)',
    '',
    table(['Pagina', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.deadClicksByPage)),
    '',
    'Per element (pagina · element · tekst):',
    '',
    table(['Element', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.deadClicksByElement)),
    '',
    '### Rage clicks (herhaald snel klikken)',
    '',
    table(['Pagina', 'Deze week', 'Vorige week', 'Verschil'], countRows(data.rageClicksByPage)),
    '',
    '---',
    '',
    '_PostHog draait cookieloos: een bezoeker is binnen één dag te volgen, niet over meerdere dagen. Wie op drie dagen komt, telt drie keer. Bots met een bekende user-agent en Netlify-previews zijn eruit gefilterd; slimmere bots niet. Waar precies geklikt wordt, zie je in de heatmaps in PostHog._',
  ];

  if (data.otherHostEvents > 0) {
    lines.push(
      '',
      `_Niet meegeteld: ${data.otherHostEvents} events van andere adressen dan jouwhockeystick.nl (bijv. Netlify-previews)._`,
    );
  }

  return lines.join('\n');
}
