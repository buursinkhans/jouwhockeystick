/**
 * Learning from results (docs/marketing/bouwplan-2.0.md, fase 3). Every post
 * carries labels; after 7 days its result is compared with the median of the
 * same channel over the 8 weeks before. A lesson only comes from at least 5
 * posts per variant. Pure: the Onderzoeker fetches the numbers from Metricool.
 */
export const LABEL_KEYS = ['serie', 'hook', 'soort', 'vorm', 'pagina', 'markt', 'dag', 'tijd'] as const;
export type LabelKey = (typeof LABEL_KEYS)[number];
export type Labels = Partial<Record<LabelKey, string>>;

export type Result = {
  id: string;
  kanaal: string;
  /** YYYY-MM-DD of publication. */
  datum: string;
  labels: Labels;
  /** The number we compare: per channel the one that counts (reach, saves per 1,000, viewers who stay). */
  waarde: number;
};

/** Days after publication before a result counts (it is still growing before that). */
export const RESULT_AFTER_DAYS = 7;
export const BASELINE_WEEKS = 8;
export const MIN_POSTS = 5;

const day = (d: string) => Date.parse(`${d}T00:00:00Z`) / 86_400_000;

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/** Results old enough to count on `today`. */
export const ripe = (results: readonly Result[], today: string) => results.filter((r) => day(today) - day(r.datum) >= RESULT_AFTER_DAYS);

/**
 * The index of a result: its value divided by the median of the same channel
 * over the 8 weeks before it (the post itself not included). Null without a
 * baseline (fewer than 3 earlier posts, or a median of 0).
 */
export function indexOf(result: Result, all: readonly Result[]): number | null {
  const from = day(result.datum) - BASELINE_WEEKS * 7;
  const base = all.filter((r) => r.kanaal === result.kanaal && r.id !== result.id && day(r.datum) < day(result.datum) && day(r.datum) >= from).map((r) => r.waarde);
  const m = base.length >= 3 ? median(base) : null;
  return m ? result.waarde / m : null;
}

export type Lesson = {
  /** E.g. "hook=vraag". */
  id: string;
  label: LabelKey;
  variant: string;
  posts: number;
  /** Median index of the variant (1 = as usual). */
  index: number;
  /** One sentence for the owner, in plain Dutch. */
  tekst: string;
};

const LABEL_NAME: Record<LabelKey, string> = { serie: 'Serie', hook: 'Hooktype', soort: 'Soort', vorm: 'Vorm', pagina: 'Pagina', markt: 'Markt', dag: 'Dag', tijd: 'Tijd' };
const pct = (x: number) => `${Math.round(Math.abs(x - 1) * 100)}%`;

/**
 * Lessons: per label variant with at least 5 ripe posts, its median index.
 * Only variants that differ at least 20% from the usual become a lesson; the
 * rest is noise at these numbers.
 */
export function lessons(results: readonly Result[], today: string, { threshold = 0.2 } = {}): Lesson[] {
  const counted = ripe(results, today);
  const out: Lesson[] = [];
  for (const label of LABEL_KEYS) {
    const groups = new Map<string, number[]>();
    for (const r of counted) {
      const v = r.labels[label];
      const ix = v ? indexOf(r, results) : null;
      if (!v || ix === null) continue;
      groups.set(v, [...(groups.get(v) ?? []), ix]);
    }
    for (const [variant, indices] of groups) {
      if (indices.length < MIN_POSTS) continue;
      const m = median(indices)!;
      if (Math.abs(m - 1) < threshold) continue;
      out.push({
        id: `${label}=${variant}`,
        label,
        variant,
        posts: indices.length,
        index: Math.round(m * 100) / 100,
        tekst: `${LABEL_NAME[label]} "${variant}" doet het ${pct(m)} ${m > 1 ? 'beter' : 'minder goed'} dan gewoonlijk, over ${indices.length} posts.`,
      });
    }
  }
  return out.sort((a, b) => Math.abs(b.index - 1) - Math.abs(a.index - 1));
}
