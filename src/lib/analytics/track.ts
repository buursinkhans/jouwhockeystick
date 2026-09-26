import type { AnalyticsEvent } from './events';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Lightweight, provider-agnostic event sink for this validation phase.
 * Pushes to window.dataLayer when present (ready for a real GTM/GA wiring
 * later); otherwise logs to the console so events stay visible during
 * manual testing. No-ops during server rendering.
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(event);
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[analytics]', event);
  }
}
