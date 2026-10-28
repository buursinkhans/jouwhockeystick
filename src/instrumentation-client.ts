import posthog from 'posthog-js';
import {
  POSTHOG_INIT_OPTIONS,
  POSTHOG_KEY,
  isTrackedHost,
} from '@/lib/analytics/posthog';

/**
 * PostHog runs cookieless (options and reasons in POSTHOG_INIT_OPTIONS).
 * Clicks, page views and heatmap data are captured; our own funnel events
 * are sent through src/lib/analytics/track.ts.
 */
try {
  if (POSTHOG_KEY && isTrackedHost(window.location.hostname)) {
    posthog.init(POSTHOG_KEY, POSTHOG_INIT_OPTIONS);
  }
} catch {
  // Analytics must never break the site.
}
