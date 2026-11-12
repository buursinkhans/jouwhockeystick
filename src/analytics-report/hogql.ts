// Read-only HogQL queries against PostHog (EU). Needs a personal API key with
// only the "Query Read" permission (POSTHOG_PERSONAL_API_KEY, GitHub Secret)
// and the project id (POSTHOG_PROJECT_ID, repository variable).
// Shared by the weekly conversion report and the daily figures (scripts/).
import { POSTHOG_UI_HOST } from '../lib/analytics/posthog';

/** Only events from the live site count, never from previews or localhost. */
export const LIVE_HOSTS = ['jouwhockeystick.nl', 'www.jouwhockeystick.nl'];
export const BOT_PATTERN = '(?i)bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview';

export type PosthogConfig = { key: string; projectId: string };

export function readPosthogConfig(): PosthogConfig {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!key) throw new Error('POSTHOG_PERSONAL_API_KEY ontbreekt (GitHub Secrets).');
  if (!projectId || !/^\d+$/.test(projectId)) {
    throw new Error('POSTHOG_PROJECT_ID ontbreekt of is geen getal (GitHub-variabele).');
  }
  return { key, projectId };
}

export async function hogql(config: PosthogConfig, query: string, name: string): Promise<unknown[][]> {
  const response = await fetch(`${POSTHOG_UI_HOST}/api/projects/${config.projectId}/query/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query }, name }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `PostHog weigert de sleutel (HTTP ${response.status}). Controleer of de personal API key de rechten "Query Read" heeft en bij dit project hoort. ${detail}`,
      );
    }
    throw new Error(`PostHog-query mislukt (HTTP ${response.status}): ${detail}`);
  }
  const body = (await response.json()) as { results?: unknown[][] };
  return body.results ?? [];
}
