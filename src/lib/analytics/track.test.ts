import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackEvent } from './track';

afterEach(() => {
  vi.unstubAllGlobals();
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

  it('queues events that fire before the Simple Analytics script has loaded', () => {
    const fakeWindow: { sa_event?: { q?: unknown[][] } } = {};
    vi.stubGlobal('window', fakeWindow);

    trackEvent({ name: 'quiz_start' });

    expect(fakeWindow.sa_event?.q).toEqual([['quiz_start', {}]]);
  });
});
