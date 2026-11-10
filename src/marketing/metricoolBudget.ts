/**
 * The Metricool allowance (docs/marketing/publiceerder.md): the free plan allows
 * a fixed number of planned posts per month. The Publiceerder counts before every
 * create and stops at the limit with a clear message; it never deletes a post
 * to make room. Change the limit here when the plan changes (decision log
 * 2026-11-10); nothing else needs to change.
 */
export const METRICOOL_MONTHLY_LIMIT = 20;

/** One Metricool post: its uuid and its publication moment (YYYY-MM-DDTHH:mm…, brand timezone). */
export type PlannedPost = { uuid: string; moment: string };

/** YYYY-MM of a moment. */
export const monthOf = (moment: string) => moment.slice(0, 7);

/**
 * Posts that count for a month: every Metricool post with a moment in it,
 * once per uuid. Sources: getScheduledPosts for that month (not yet published,
 * also posts made by hand) and the Metricool posts stored in the studio (also
 * the published ones, which getScheduledPosts no longer lists). Instagram and
 * Facebook together are one Metricool post.
 */
export function usedInMonth(month: string, ...sources: readonly (readonly PlannedPost[])[]): number {
  const seen = new Set<string>();
  for (const source of sources) for (const post of source) if (monthOf(post.moment) === month && post.uuid) seen.add(post.uuid);
  return seen.size;
}

export type BudgetDecision =
  | { ok: true; used: number; limit: number; left: number }
  | { ok: false; used: number; limit: number; message: string };

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

/** May one more post be created for this month? */
export function budgetFor(month: string, used: number, limit = METRICOOL_MONTHLY_LIMIT): BudgetDecision {
  if (used < limit) return { ok: true, used, limit, left: limit - used };
  const name = MONTHS[Number(month.slice(5, 7)) - 1] ?? month;
  return {
    ok: false,
    used,
    limit,
    message: `Het Metricool-tegoed voor ${name} is op (${used} van ${limit} posts). Niet ingepland; de eigenaar kiest: een andere maand of een groter plan.`,
  };
}
