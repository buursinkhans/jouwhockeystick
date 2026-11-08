import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectPosthog, posthogUnavailable, resetPosthogClient, setPosthog } from './posthogClient';
import { trackEvent } from './track';

const posthogMock = { capture: vi.fn() };

afterEach(() => {
  vi.unstubAllGlobals();
  resetPosthogClient();
  posthogMock.capture.mockReset();
});

describe('trackEvent', () => {
  it('is a no-op when there is no window (server rendering)', () => {
    expect(() => trackEvent({ name: 'quiz_start' })).not.toThrow();
  });

  it('sends the event name and its fields as metadata to Simple Analytics', () => {
    const saEvent = vi.fn();
    vi.stubGlobal('window', { sa_event: saEvent });

    trackEvent({
      name: 'interest_submit',
      source: 'algemeen',
      hasProductSlug: false,
    });

    expect(saEvent).toHaveBeenCalledWith('interest_submit', {
      source: 'algemeen',
      hasProductSlug: false,
    });
  });

  it('never sends the session id or timestamp', () => {
    const saEvent = vi.fn();
    vi.stubGlobal('window', { sa_event: saEvent });

    trackEvent({
      name: 'question_answered',
      adviceSessionId: 'session-1',
      route: 'START',
      questionId: 'budget_band',
      answerKey: '75_125',
      productId: undefined,
      timestamp: '2026-10-02T10:00:00.000Z',
    });

    expect(saEvent).toHaveBeenCalledWith('question_answered', {
      route: 'START',
      questionId: 'budget_band',
      answerKey: '75_125',
    });
  });

  it('sends the same event and metadata to PostHog once it is initialised', () => {
    vi.stubGlobal('window', { sa_event: vi.fn() });
    setPosthog(posthogMock);

    trackEvent({
      name: 'retailer_click',
      retailer: 'bolcom',
      brand: 'Grays',
      productName: 'Grays JB 6',
      placement: 'stickwijzer',
      linkType: 'product',
    });

    expect(posthogMock.capture).toHaveBeenCalledWith('retailer_click', {
      retailer: 'bolcom',
      brand: 'Grays',
      productName: 'Grays JB 6',
      placement: 'stickwijzer',
      linkType: 'product',
    });
  });

  it('does not call PostHog when it is not initialised (local previews)', () => {
    vi.stubGlobal('window', { sa_event: vi.fn() });

    trackEvent({ name: 'quiz_start' });
    setPosthog(posthogMock);

    expect(posthogMock.capture).not.toHaveBeenCalled();
  });

  it('keeps events from before PostHog has loaded and sends them in order once it has', () => {
    vi.stubGlobal('window', { sa_event: vi.fn() });
    expectPosthog();

    trackEvent({ name: 'quiz_start', quiz: 'stick' });
    trackEvent({ name: 'interest_submit', source: 'algemeen', hasProductSlug: false });
    expect(posthogMock.capture).not.toHaveBeenCalled();

    setPosthog(posthogMock);
    expect(posthogMock.capture.mock.calls.map(([name]) => name)).toEqual(['quiz_start', 'interest_submit']);

    trackEvent({ name: 'quiz_start', quiz: 'stick' });
    expect(posthogMock.capture).toHaveBeenCalledTimes(3);
  });

  it('drops the queue when PostHog cannot load', () => {
    vi.stubGlobal('window', { sa_event: vi.fn() });
    expectPosthog();
    trackEvent({ name: 'quiz_start', quiz: 'stick' });
    posthogUnavailable();
    setPosthog(posthogMock);

    expect(posthogMock.capture).not.toHaveBeenCalled();
  });

  it('queues events that fire before the Simple Analytics script has loaded', () => {
    const fakeWindow: { sa_event?: { q?: unknown[][] } } = {};
    vi.stubGlobal('window', fakeWindow);

    trackEvent({ name: 'quiz_start' });

    expect(fakeWindow.sa_event?.q).toEqual([['quiz_start', {}]]);
  });
});
