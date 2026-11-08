import type { PostHog } from 'posthog-js';

type Capture = [name: string, properties: Record<string, string | number | boolean>];

/**
 * PostHog loads after the first paint (src/instrumentation-client.ts imports
 * it dynamically, redesign fase 2, 2026-11-03): the library is the largest
 * script on every page and is not needed to show or use it. Events from
 * before it is ready wait here and are sent once it is, so a quiz_start in
 * the first second is not lost. Nothing waits on hosts that are not tracked
 * (local previews): `expectPosthog` is never called there.
 */
const MAX_QUEUED = 50;

let instance: Pick<PostHog, 'capture'> | null = null;
let expected = false;
const queue: Capture[] = [];

/** Called when loading starts on a tracked host; from then on events are queued. */
export function expectPosthog(): void {
  expected = true;
}

/** Called once PostHog is initialised: sends what was queued, in order. */
export function setPosthog(posthog: Pick<PostHog, 'capture'>): void {
  instance = posthog;
  for (const [name, properties] of queue.splice(0)) posthog.capture(name, properties);
}

/** Loading failed (blocked, offline): stop queueing. */
export function posthogUnavailable(): void {
  expected = false;
  queue.length = 0;
}

export function capture(name: string, properties: Capture[1]): void {
  if (instance) instance.capture(name, properties);
  else if (expected && queue.length < MAX_QUEUED) queue.push([name, properties]);
}

/** Tests only. */
export function resetPosthogClient(): void {
  instance = null;
  expected = false;
  queue.length = 0;
}
