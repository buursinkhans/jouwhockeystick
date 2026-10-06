import posthog from 'posthog-js';
import {
  POSTHOG_API_HOST,
  POSTHOG_KEY,
  POSTHOG_UI_HOST,
  isTrackedHost,
} from '@/lib/analytics/posthog';

/**
 * PostHog runs cookieless: no cookies, no local or session storage, no
 * session recordings and no person profiles. That keeps the site free of a
 * consent banner, as described in the privacy statement. Clicks, page views
 * and heatmap data are captured; our own funnel events are sent through
 * src/lib/analytics/track.ts.
 */
try {
  if (POSTHOG_KEY && isTrackedHost(window.location.hostname)) {
    posthog.init(POSTHOG_KEY, {
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
    });
  }
} catch {
  // Analytics must never break the site.
}
