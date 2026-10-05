import type { AnalyticsEvent } from './events';

type EventMetadata = Record<string, string | number | boolean>;
type SaEvent = ((name: string, metadata?: EventMetadata) => void) & {
  q?: unknown[][];
};

declare global {
  interface Window {
    sa_event?: SaEvent;
  }
}

/**
 * Fields that never leave the browser. The session id only ties a wizard's
 * own events together locally and the timestamp is redundant; Simple
 * Analytics runs without cookies or visitor ids and we keep it that way.
 */
const LOCAL_ONLY_FIELDS = new Set(['name', 'adviceSessionId', 'timestamp']);

function toMetadata(event: AnalyticsEvent): EventMetadata {
  const metadata: EventMetadata = {};
  for (const [key, value] of Object.entries(event)) {
    if (!LOCAL_ONLY_FIELDS.has(key) && value !== undefined) {
      metadata[key] = value;
    }
  }
  return metadata;
}

/**
 * Sends an event to Simple Analytics. Calls made before its script has
 * loaded are queued the same way the official snippet does, so no early
 * event is lost. No-ops during server rendering.
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window.sa_event) {
    const queue: SaEvent = (...args) => {
      (queue.q ??= []).push(args);
    };
    window.sa_event = queue;
  }

  window.sa_event(event.name, toMetadata(event));
}
