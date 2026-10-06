/**
 * PostHog (EU cloud, Frankfurt) for click behaviour, funnels and heatmaps.
 * The project key is public by design — it ends up in every page — and can
 * be overridden per environment with NEXT_PUBLIC_POSTHOG_KEY.
 */
export const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ??
  'phc_yqJuZEfPVrtLYN9WUKQZP3sntQe7Q9dQ9fLjjTBNtesH';
export const POSTHOG_API_HOST = 'https://eu.i.posthog.com';
export const POSTHOG_UI_HOST = 'https://eu.posthog.com';

/** Local previews and test runs must not pollute the real statistics. */
export function isTrackedHost(hostname: string): boolean {
  return hostname !== 'localhost' && hostname !== '127.0.0.1';
}
