/**
 * PostHog (EU cloud, Frankfurt) for click behaviour, funnels and heatmaps.
 * The project key is public by design — it ends up in every page — and can
 * be overridden per environment with NEXT_PUBLIC_POSTHOG_KEY.
 */
export const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ??
  'phc_yqJuZEfPVrtLYN9WUKQZP3sntQe7Q9dQ9fLjjTBNtesH';
/**
 * Measurements go through our own domain (reverse proxy, next.config.ts
 * rewrites) so ad blockers do not block the cookieless measurement
 * (decision log 2026-10-26). A neutral path, not "ingest" or "posthog", which
 * blocklists know. The rewrites forward to the EU hosts below.
 */
export const POSTHOG_PROXY_PATH = '/p8k';
export const POSTHOG_API_HOST = POSTHOG_PROXY_PATH;
export const POSTHOG_INGEST_ORIGIN = 'https://eu.i.posthog.com';
export const POSTHOG_ASSETS_ORIGIN = 'https://eu-assets.i.posthog.com';
export const POSTHOG_UI_HOST = 'https://eu.posthog.com';

/** Local previews and test runs must not pollute the real statistics. */
export function isTrackedHost(hostname: string): boolean {
  return hostname !== 'localhost' && hostname !== '127.0.0.1';
}

/**
 * Options for posthog.init (src/instrumentation-client.ts). Cookieless: no
 * cookies, no local or session storage, no session recordings and no person
 * profiles, so the site needs no consent banner (privacy statement).
 *
 * `disable_compression`: the proxy on our domain (Next.js rewrites on
 * Netlify) damages gzip request bodies, so every event since the proxy went
 * live on 2026-10-26 was refused with HTTP 400 ("invalid GZIP data"); plain
 * JSON passes intact (decision log 2026-10-28). Events are small, so sending
 * them uncompressed costs little.
 */
export const POSTHOG_INIT_OPTIONS = {
  api_host: POSTHOG_API_HOST,
  ui_host: POSTHOG_UI_HOST,
  cookieless_mode: 'always',
  person_profiles: 'identified_only',
  capture_pageview: 'history_change',
  capture_pageleave: true,
  autocapture: true,
  enable_heatmaps: true,
  capture_dead_clicks: true,
  disable_session_recording: true,
  disable_surveys: true,
  disable_compression: true,
} as const;
