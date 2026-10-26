import { describe, expect, it } from 'vitest';
import nextConfig from '../../../next.config';
import { PRIVACY } from '@/content/privacy';
import { POSTHOG_API_HOST, POSTHOG_PROXY_PATH } from './posthog';

describe('PostHog reverse proxy (decision log 2026-10-26)', () => {
  it('sends the SDK to our own path, rewritten to the EU hosts', async () => {
    expect(POSTHOG_API_HOST).toBe(POSTHOG_PROXY_PATH);
    const rewrites = await nextConfig.rewrites!();
    const list = Array.isArray(rewrites)
      ? rewrites
      : (rewrites.afterFiles ?? []);
    const destinations = list.map((r) => r.destination);
    expect(destinations).toContain(
      'https://eu-assets.i.posthog.com/static/:path*',
    );
    expect(destinations).toContain('https://eu.i.posthog.com/:path*');
    expect(
      destinations.every((d) => d.includes('eu') && d.includes('posthog.com')),
    ).toBe(true);
  });

  it('keeps one URL per page: a trailing slash still redirects, except on the proxy path', async () => {
    expect(nextConfig.skipTrailingSlashRedirect).toBe(true);
    const redirects = await nextConfig.redirects!();
    const trailing = redirects.find((r) => r.destination === '/:path');
    expect(trailing?.permanent).toBe(true);
    // The named group's pattern, as path-to-regexp will use it.
    const pattern = trailing!.source.match(/^\/:path\((.+)\)\/$/)![1]!;
    const matches = (path: string) =>
      new RegExp(`^/(?:${pattern})/$`).test(path);
    expect(matches('/kennis/')).toBe(true);
    expect(matches('/sticks/grays-jb10-composite/')).toBe(true);
    expect(matches(`${POSTHOG_PROXY_PATH}/e/`)).toBe(false);
    expect(matches(`${POSTHOG_PROXY_PATH}/flags/`)).toBe(false);
  });

  it('does not claim in the privacy statement that PostHog gets no IP address', () => {
    // Cookieless mode hashes the IP (with a daily salt) to count visitors, so
    // the proxy passes it on; the statement must not say otherwise.
    const sentence = PRIVACY.sections
      .flatMap((section) => section.paragraphs ?? [])
      .find((p) => p.includes('via ons eigen domein'));
    expect(sentence).toBeDefined();
    expect(sentence!.toLowerCase()).not.toContain('ip-adres');
  });
});
