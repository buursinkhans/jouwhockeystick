import { afterEach, describe, expect, it, vi } from 'vitest';
import { adviceClickContext } from './adviceContext';
import { resetPosthogClient, setPosthog } from './posthogClient';
import { trackEvent } from './track';

afterEach(() => {
  vi.unstubAllGlobals();
  resetPosthogClient();
});

describe('adviceClickContext', () => {
  it('names the role as the system does, the place in the advice and the route', () => {
    expect(adviceClickContext({ role: 'best_match' }, 1, 'START')).toEqual({
      adviceRole: 'best_match',
      adviceRank: 1,
      adviceRoute: 'START',
    });
    expect(adviceClickContext({ role: 'ambitious_choice' }, 3, 'PRESTATIE').adviceRank).toBe(3);
  });

  it('adds the budget band and the reason for a new stick only when answered', () => {
    expect(adviceClickContext({ role: 'safe_choice' }, 2, 'ONTWIKKEL', { budgetBand: '75_125', replacementReason: 'outgrown' })).toEqual({
      adviceRole: 'safe_choice',
      adviceRank: 2,
      adviceRoute: 'ONTWIKKEL',
      budgetBand: '75_125',
      replacementReason: 'outgrown',
    });
    const without = adviceClickContext({ role: 'safe_choice' }, 2, 'ONTWIKKEL', {});
    expect('budgetBand' in without).toBe(false);
    expect('replacementReason' in without).toBe(false);
  });

  it('carries no height, age or free text: only these five fields exist', () => {
    const all = adviceClickContext({ role: 'best_match' }, 1, 'START', { budgetBand: 'lt_75', replacementReason: 'first_stick' });
    expect(Object.keys(all).sort()).toEqual(['adviceRank', 'adviceRole', 'adviceRoute', 'budgetBand', 'replacementReason']);
  });
});

describe('retailer_click with and without an advice', () => {
  const click = {
    name: 'retailer_click' as const,
    retailer: 'bolcom',
    brand: 'Grays',
    productName: 'GR 5000',
    placement: 'stickwijzer',
    linkType: 'product' as const,
    position: 1,
    offerCount: 3,
    priceShown: true,
  };

  it('keeps the existing fields exactly when there is no advice', () => {
    const posthog = { capture: vi.fn() };
    vi.stubGlobal('window', { sa_event: vi.fn() });
    setPosthog(posthog);
    trackEvent(click);
    expect(posthog.capture).toHaveBeenCalledWith('retailer_click', {
      retailer: 'bolcom',
      brand: 'Grays',
      productName: 'GR 5000',
      placement: 'stickwijzer',
      linkType: 'product',
      position: 1,
      offerCount: 3,
      priceShown: true,
    });
  });

  it('adds the advice fields next to them, with the shop position unchanged', () => {
    const posthog = { capture: vi.fn() };
    vi.stubGlobal('window', { sa_event: vi.fn() });
    setPosthog(posthog);
    trackEvent({ ...click, ...adviceClickContext({ role: 'best_match' }, 1, 'START', { budgetBand: '75_125' }) });
    expect(posthog.capture).toHaveBeenCalledWith(
      'retailer_click',
      expect.objectContaining({ position: 1, adviceRole: 'best_match', adviceRank: 1, adviceRoute: 'START', budgetBand: '75_125' }),
    );
  });
});
