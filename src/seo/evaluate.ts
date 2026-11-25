/**
 * The evaluation loop of the SEO report, without a database: the history in the
 * sealed file holds the baseline of every recommendation; the status comes from
 * the labels on its GitHub issue (voorgesteld, goedgekeurd, uitgevoerd); 28 days
 * after the owner marked it "uitgevoerd" the monthly run measures the same query
 * again and says whether the position improved, stayed or got worse.
 *
 * Pure functions: the script fetches the figures. A result is a direction, never
 * proof: other changes, the season and small numbers all move a position.
 */
import { THRESHOLDS } from './seoConfig';
import type { ActionCode } from './opportunities';
import type { HistoryMonth, Outcome } from './opportunities';

export const LABELS = {
  recommendation: 'seo-aanbeveling',
  approved: 'seo-akkoord',
  done: 'seo-uitgevoerd',
} as const;

export const EVALUATION_DAYS = 28;
/** A position that moved at least this many places counts as better or worse. */
export const POSITION_STEP = 1;

export type RecStatus = {
  id: string;
  status: 'voorgesteld' | 'goedgekeurd' | 'uitgevoerd';
  /** YYYY-MM-DD: the day the label seo-uitgevoerd was set. Only with status uitgevoerd. */
  uitgevoerdOp?: string;
};

export type Figures = { positie: number; vertoningen: number; klikken: number };

const DAY_MS = 86_400_000;
const shift = (date: string, days: number) => new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);

export type Due = {
  id: string;
  month: string;
  code: string;
  zoekterm: string;
  pagina: string;
  basislijn: Figures;
  uitgevoerdOp: string;
  /** The 28 days after "uitgevoerd". */
  window: { start: string; end: string };
};

/**
 * The recommendations whose 28 days are over and that have no result yet. A
 * recommendation that came back in a later month has more than one entry with
 * the same id: the status belongs to the newest entry from before it was done.
 */
export function dueForEvaluation(history: readonly HistoryMonth[], statuses: readonly RecStatus[], lastDay: string): Due[] {
  const due: Due[] = [];
  for (const status of statuses) {
    if (status.status !== 'uitgevoerd' || !status.uitgevoerdOp) continue;
    const month = status.uitgevoerdOp.slice(0, 7);
    const candidates = history
      .filter((entry) => entry.maand <= month)
      .flatMap((entry) => entry.aanbevelingen.filter((rec) => rec.id === status.id).map((rec) => ({ entry, rec })))
      .filter(({ rec }) => !rec.resultaat);
    const newest = candidates.at(-1);
    if (!newest) continue;
    const window = { start: shift(status.uitgevoerdOp, 1), end: shift(status.uitgevoerdOp, EVALUATION_DAYS) };
    if (window.end > lastDay) continue; // Not over yet, or not processed by Search Console yet.
    due.push({
      id: status.id,
      month: newest.entry.maand,
      code: newest.rec.code,
      zoekterm: newest.rec.zoekterm,
      pagina: newest.rec.pagina,
      basislijn: newest.rec.basislijn,
      uitgevoerdOp: status.uitgevoerdOp,
      window,
    });
  }
  return due;
}

/** Direction of the position, with enough impressions before and after; otherwise "onvoldoende data". */
export function outcomeOf(due: Due, after: Figures | null): Outcome {
  const base = { uitgevoerdOp: due.uitgevoerdOp, gemeten: due.window.end };
  if ((due.code as ActionCode) === 'D') {
    return { ...base, oordeel: 'niet gemeten', na: after, toelichting: 'De doorklik naar de winkel wordt nog niet gemeten.' };
  }
  if (!after || after.vertoningen < THRESHOLDS.minImpressions || due.basislijn.vertoningen < THRESHOLDS.minImpressions) {
    return {
      ...base,
      oordeel: 'onvoldoende data',
      na: after,
      toelichting: 'Te weinig vertoningen voor of na de wijziging om een richting te zien.',
    };
  }
  const delta = after.positie - due.basislijn.positie; // negative: a better (lower) position
  const oordeel = delta <= -POSITION_STEP ? 'verbeterd' : delta >= POSITION_STEP ? 'verslechterd' : 'gelijk';
  return {
    ...base,
    oordeel,
    na: after,
    toelichting:
      'Een richting, geen bewijs: ook het seizoen, andere wijzigingen en kleine aantallen verschuiven een positie. De positie is de hoofdmaat.',
  };
}

/** Puts the results on the matching history entries; everything else stays as it was. */
export function applyOutcomes(history: readonly HistoryMonth[], results: readonly { due: Due; outcome: Outcome }[]): HistoryMonth[] {
  return history.map((entry) => ({
    ...entry,
    aanbevelingen: entry.aanbevelingen.map((rec) => {
      const hit = results.find((r) => r.due.month === entry.maand && r.due.id === rec.id);
      return hit ? { ...rec, resultaat: hit.outcome } : rec;
    }),
  }));
}

/** The shape of an issue as the GitHub API returns it, reduced to what the status needs. */
export type IssueLike = { body: string | null; labels: readonly string[]; uitgevoerdOp?: string };

const MARKER = /<!--\s*seo-id:([0-9a-f]{8})\s*-->/;

export const markerOf = (id: string) => `<!-- seo-id:${id} -->`;
export const idFromBody = (body: string | null): string | null => body?.match(MARKER)?.[1] ?? null;

/** The status per recommendation, from the labels of its issue. A done label without a date counts as approved. */
export function statusesFromIssues(issues: readonly IssueLike[]): RecStatus[] {
  const out: RecStatus[] = [];
  for (const issue of issues) {
    const id = idFromBody(issue.body);
    if (!id) continue;
    if (issue.labels.includes(LABELS.done) && issue.uitgevoerdOp) out.push({ id, status: 'uitgevoerd', uitgevoerdOp: issue.uitgevoerdOp });
    else if (issue.labels.includes(LABELS.approved) || issue.labels.includes(LABELS.done)) out.push({ id, status: 'goedgekeurd' });
    else out.push({ id, status: 'voorgesteld' });
  }
  return out;
}
