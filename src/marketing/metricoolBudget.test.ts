import { describe, expect, it } from 'vitest';
import { budgetFor, METRICOOL_MONTHLY_LIMIT, usedInMonth } from './metricoolBudget';

describe('usedInMonth', () => {
  it('counts each Metricool post once, only in its month, across sources', () => {
    const scheduled = [
      { uuid: 'a', moment: '2026-11-13T19:30:00' },
      { uuid: 'b', moment: '2026-11-20T19:30:00' },
      { uuid: 'c', moment: '2026-12-01T19:30:00' },
    ];
    const studio = [
      { uuid: 'a', moment: '2026-11-13T19:30:00' }, // the same post, stored in the studio
      { uuid: 'd', moment: '2026-11-03T19:30:00' }, // already published: no longer scheduled
    ];
    expect(usedInMonth('2026-11', scheduled, studio)).toBe(3);
    expect(usedInMonth('2026-12', scheduled, studio)).toBe(1);
  });
});

describe('budgetFor', () => {
  it('allows posts below the limit and says how many are left', () => {
    expect(budgetFor('2026-11', 18)).toEqual({ ok: true, used: 18, limit: METRICOOL_MONTHLY_LIMIT, left: 2 });
  });

  it('stops at the limit with a clear Dutch message', () => {
    const d = budgetFor('2026-11', 20);
    expect(d.ok).toBe(false);
    if (!d.ok) expect(d.message).toBe('Het Metricool-tegoed voor november is op (20 van 20 posts). Niet ingepland; de eigenaar kiest: een andere maand of een groter plan.');
  });

  it('takes another limit for another plan', () => {
    expect(budgetFor('2026-11', 20, 100).ok).toBe(true);
  });
});
