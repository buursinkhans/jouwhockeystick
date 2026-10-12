/**
 * Scheduled publishing. An article or blog post is live from its
 * `publishedAt` date (Dutch time). Before that it is left out of every page,
 * list, the sitemap and llms.txt, except on Netlify deploy previews and in
 * local development, where scheduled content is shown with a notice so it
 * can be reviewed. A daily workflow rebuilds the site on publication days
 * (see .github/workflows/publicatie.yml).
 */

export const SITE_TIME_ZONE = 'Europe/Amsterdam';

/** Today's date as YYYY-MM-DD in Dutch time. */
export function todayInSiteTimeZone(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SITE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** True on Netlify deploy previews and branch deploys, and in `next dev`. */
export function showsScheduledContent(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    env.CONTEXT === 'deploy-preview' ||
    env.CONTEXT === 'branch-deploy' ||
    env.NODE_ENV === 'development'
  );
}

export function isPublished(
  item: { publishedAt: string },
  today: string = todayInSiteTimeZone(),
): boolean {
  return item.publishedAt <= today;
}

/** The items a visitor may see now: published ones, plus scheduled ones on previews. */
export function visibleItems<T extends { publishedAt: string }>(
  items: readonly T[],
  options: { today?: string; includeScheduled?: boolean } = {},
): T[] {
  const today = options.today ?? todayInSiteTimeZone();
  const includeScheduled = options.includeScheduled ?? showsScheduledContent();
  return items.filter((item) => includeScheduled || isPublished(item, today));
}

/** Items that go live after `since` and on or before `today` (both YYYY-MM-DD). */
export function dueItems<T extends { publishedAt: string }>(
  items: readonly T[],
  since: string,
  today: string,
): T[] {
  return items.filter(
    (item) => item.publishedAt > since && item.publishedAt <= today,
  );
}

/** "15 november 2026" */
export function formatDutchDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
