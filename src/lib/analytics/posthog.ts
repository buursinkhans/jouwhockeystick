// Relative: next.config.ts loads this file, where the @/ alias does not resolve.
import { SITE_URL } from '../site';

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

const SITE_HOST = new URL(SITE_URL).hostname;
const TRACKED_HOSTS: ReadonlySet<string> = new Set([SITE_HOST, `www.${SITE_HOST}`]);

/**
 * Only the production site counts (code review 2026-11-08): local previews,
 * test runs and Netlify deploy previews (deploy-preview-*.netlify.app) must
 * not pollute the real statistics.
 */
export function isTrackedHost(hostname: string): boolean {
  return TRACKED_HOSTS.has(hostname.toLowerCase());
}

/** A shared stick or shoe advice carries the answers in its query (?a=…): never in the statistics (privacy statement 1.5). */
const SHARED_ADVICE = /(\/(?:stickwijzer|hockeyschoenen\/wijzer)\/advies)\?[^#\s]*/g;

/**
 * Drops the query of a shared stick or shoe advice from every property of an
 * event ($current_url, $referrer, …) before PostHog sends it (decision log 2026-11-01).
 */
export function withoutSharedAnswers<T extends { properties: Record<string, unknown> }>(event: T | null): T | null {
  if (!event) return event;
  const properties: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(event.properties)) {
    properties[key] = typeof value === 'string' ? value.replace(SHARED_ADVICE, '$1') : value;
  }
  return { ...event, properties };
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
  before_send: withoutSharedAnswers,
} as const;
