import { describe, expect, it } from 'vitest';
import { isTrackedHost } from './posthog';

// Code review 2026-11-08: only the production hostnames count.
describe('isTrackedHost', () => {
  it('measures on the production site, with and without www', () => {
    expect(isTrackedHost('jouwhockeystick.nl')).toBe(true);
    expect(isTrackedHost('www.jouwhockeystick.nl')).toBe(true);
  });

  it('never measures on local previews or Netlify deploy previews', () => {
    for (const host of [
      'localhost',
      '127.0.0.1',
      'deploy-preview-178--jouwhockeystick.netlify.app',
      'jouwhockeystick.netlify.app',
      'main--jouwhockeystick.netlify.app',
      'jouwhockeystick.nl.evil.example',
    ]) {
      expect(isTrackedHost(host), host).toBe(false);
    }
  });
});
