import {
  POSTHOG_INIT_OPTIONS,
  POSTHOG_KEY,
  isTrackedHost,
} from '@/lib/analytics/posthog';
import { applyInternalParam, isInternalVisitor } from '@/lib/analytics/internal';
import { expectPosthog, posthogUnavailable, setPosthog } from '@/lib/analytics/posthogClient';

/**
 * PostHog runs cookieless (options and reasons in POSTHOG_INIT_OPTIONS).
 * Clicks, page views and heatmap data are captured; our own funnel events
 * are sent through src/lib/analytics/track.ts.
 *
 * Loaded with a dynamic import, so it is a separate script that does not
 * hold up the page (redesign fase 2, 2026-11-03); events from before it is
 * ready are queued in posthogClient.ts.
 */
try {
  applyInternalParam(window.location.search);
  if (POSTHOG_KEY && isTrackedHost(window.location.hostname) && !isInternalVisitor()) {
    expectPosthog();
    import('posthog-js')
      .then(({ default: posthog }) => {
        posthog.init(POSTHOG_KEY, POSTHOG_INIT_OPTIONS);
        setPosthog(posthog);
      })
      .catch(posthogUnavailable);
  }
} catch {
  // Analytics must never break the site.
}
