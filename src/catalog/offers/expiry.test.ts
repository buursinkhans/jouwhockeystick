import { describe, expect, it } from 'vitest';
import { priceExpiryDecision } from './expiry';

// Daily publishing, reason c (decision log 2026-11-09).
const now = new Date('2026-11-20T04:03:00Z');

describe('priceExpiryDecision', () => {
  it('builds when a price was still shown on the live build and has passed 14 days today', () => {
    // Read on 5 Nov: fresh up to and including 19 Nov, not on the 20th.
    const decision = priceExpiryDecision(['2026-11-05', '2026-11-12'], '2026-11-15T04:05:00.000Z', now);
    expect(decision.build).toBe(true);
    expect(decision.expired).toEqual(['2026-11-05']);
    expect(decision.reason).toMatch(/2026-11-05/);
  });

  it('does not build when every price that was fresh is still fresh, or was already stale at the build', () => {
    expect(priceExpiryDecision(['2026-11-06', '2026-11-12'], '2026-11-15T04:05:00Z', now).build).toBe(false);
    // Already older than 14 days on the build: the page already hides that amount.
    expect(priceExpiryDecision(['2026-10-20'], '2026-11-15T04:05:00Z', now).build).toBe(false);
  });

  it('builds on the last day boundary exactly like isPriceFresh: day 14 is fresh, day 15 is not', () => {
    expect(priceExpiryDecision(['2026-11-06'], '2026-11-10T00:00:00Z', now).build).toBe(false);
    expect(priceExpiryDecision(['2026-11-05'], '2026-11-10T00:00:00Z', now).build).toBe(true);
  });

  it('safety net: an unknown or invalid build date, or a build older than 14 days, always builds', () => {
    expect(priceExpiryDecision([], null, now)).toMatchObject({ build: true, reason: 'builddatum live onbekend' });
    expect(priceExpiryDecision([], 'onzin', now).build).toBe(true);
    expect(priceExpiryDecision([], '2026-11-05T23:00:00Z', now)).toMatchObject({ build: true, reason: 'live build is 15 dagen oud' });
    expect(priceExpiryDecision([], '2026-11-06T04:00:00Z', now).build).toBe(false);
    expect(priceExpiryDecision([], '2026-11-19T04:00:00Z', now).reason).toMatch(/1 dag oud/);
  });

  it('counts each read date once', () => {
    expect(priceExpiryDecision(['2026-11-05', '2026-11-05'], '2026-11-15T00:00:00Z', now).expired).toEqual(['2026-11-05']);
  });
});
