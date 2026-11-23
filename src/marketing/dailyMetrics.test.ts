import { describe, expect, it } from 'vitest';
import {
  compareLastDay,
  Dagcijfers,
  dagcijfersMeta,
  dateRange,
  fillDays,
  lastReportedDay,
  risers,
  topQueries,
  type QueryRow,
  type SearchDay,
} from './dailyMetrics';

const day = (date: string, klikken: number): SearchDay => ({ date, klikken, vertoningen: klikken * 10 });
const series = (values: number[]) => dateRange('2026-11-01', '2026-11-30').slice(0, values.length).map((d, i) => day(d, values[i] ?? 0));
const q = (zoekterm: string, klikken: number, vertoningen: number): QueryRow => ({ zoekterm, klikken, vertoningen, positie: 8.26 });

describe('dateRange and fillDays', () => {
  it('lists every day and fills gaps with zeros', () => {
    const dates = dateRange('2026-10-30', '2026-11-02');
    expect(dates).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']);
    const filled = fillDays([day('2026-10-31', 4)], dates, (d) => day(d, 0));
    expect(filled.map((r) => r.klikken)).toEqual([0, 4, 0, 0]);
  });
});

describe('lastReportedDay', () => {
  it('ends at the last day Search Console reported, not at a day it has not processed yet', () => {
    const rows = [day('2026-11-08', 6), day('2026-11-09', 7), day('2026-11-10', 9)];
    expect(lastReportedDay(rows, '2026-11-11')).toBe('2026-11-10');
  });

  it('ignores rows after the latest day and returns null without rows', () => {
    expect(lastReportedDay([day('2026-11-09', 1), day('2026-11-12', 1)], '2026-11-11')).toBe('2026-11-09');
    expect(lastReportedDay([], '2026-11-11')).toBeNull();
  });

  it('keeps a reported zero inside the series as a real zero', () => {
    const rows = [day('2026-11-09', 3), day('2026-11-11', 2)];
    const last = lastReportedDay(rows, '2026-11-11') ?? '2026-11-11';
    expect(fillDays(rows, dateRange('2026-11-09', last), (d) => day(d, 0)).map((r) => r.klikken)).toEqual([3, 0, 2]);
  });
});

describe('compareLastDay', () => {
  it('compares with the 7-day average and flags a large jump', () => {
    const c = compareLastDay(series([20, 20, 20, 20, 20, 20, 20, 45]), 'klikken');
    expect(c).toMatchObject({ waarde: 45, gem7: 20, verschil7Pct: 125, opvallend: 'hoger' });
  });

  it('ignores a large proportion on small numbers', () => {
    expect(compareLastDay(series([2, 2, 2, 2, 2, 2, 2, 6]), 'klikken')?.opvallend).toBeNull();
  });

  it('flags a drop', () => {
    expect(compareLastDay(series([40, 40, 40, 40, 40, 40, 40, 10]), 'klikken')?.opvallend).toBe('lager');
  });

  it('needs enough history before it flags anything', () => {
    expect(compareLastDay(series([1, 1, 90]), 'klikken')?.opvallend).toBeNull();
  });

  it('has no averages for a single day', () => {
    expect(compareLastDay(series([5]), 'klikken')).toMatchObject({ gem7: null, gem28: null, verschil7Pct: null });
  });
});

describe('risers and topQueries', () => {
  it('keeps clear risers only, new ones marked', () => {
    const now = [q('lengte hockeystick', 1, 40), q('indoor stick', 0, 25), q('stick kopen', 2, 32)];
    const before = [q('lengte hockeystick', 0, 10), q('stick kopen', 1, 30)];
    expect(risers(now, before)).toEqual([
      { zoekterm: 'lengte hockeystick', nu: 40, ervoor: 10, nieuw: false },
      { zoekterm: 'indoor stick', nu: 25, ervoor: 0, nieuw: true },
    ]);
  });

  it('sorts top queries by clicks, then impressions, and rounds the position', () => {
    const top = topQueries([q('a', 0, 50), q('b', 3, 10), q('c', 0, 80)], 2);
    expect(top.map((r) => r.zoekterm)).toEqual(['b', 'c']);
    expect(top[0]?.positie).toBe(8.3);
  });
});

describe('Dagcijfers schema', () => {
  it('accepts a file where one source failed', () => {
    const parsed = Dagcijfers.safeParse({
      versie: 1,
      gemaakt: '2026-11-12T05:31:00Z',
      site: 'jouwhockeystick.nl',
      posthog: { ok: false, reden: 'POSTHOG_PERSONAL_API_KEY ontbreekt (GitHub Secrets).' },
      google: {
        ok: true,
        value: { dagen: [], vergelijking: [], periode: { start: '2026-11-03', end: '2026-11-09' }, topZoektermen: [], stijgers: [] },
      },
      bing: { ok: true, value: { dagen: [], vergelijking: [] } },
    });
    expect(parsed.success).toBe(true);
  });
});

describe('Dagcijfers: the tab Conversie', () => {
  const w = (key: string, now: number, before = 0) => ({ key, now, before });
  const base = {
    versie: 1,
    gemaakt: '2026-11-25T05:31:00Z',
    site: 'jouwhockeystick.nl',
    posthog: { ok: false, reden: 'x' },
    google: { ok: false, reden: 'x' },
    bing: { ok: false, reden: 'x' },
  };
  const conversie = {
    periode: { start: '2026-11-18', end: '2026-11-24' },
    vorige: { start: '2026-11-11', end: '2026-11-17' },
    stand: { bezoekers: w('b', 900, 700), wijzerStart: w('w', 120, 90), klikkers: w('k', 40, 30), winkelklikken: w('c', 61, 44) },
    zoeken: {
      searches: w('search', 80, 0),
      searchers: w('search', 60, 0),
      noResults: w('search_no_results', 7, 0),
      selections: [w('stick', 30)],
      selectedItems: [w('stick · Grays JB 10', 9)],
      searchersWhoClicked: w('x', 12),
      clicksFromSearch: w('retailer_click', 14),
      clicksFromSearchByProduct: [w('Grays JB 10', 6)],
      wijzerStarts: w('quiz_start', 4),
      wijzerCompletes: w('quiz_complete', 2),
    },
    merken: { views: [w('Grays', 25, 3)], clicks: [w('Grays', 8, 1)] },
    reeksen: { views: [w('grays-jb-serie', 18)], clicks: [w('grays-jb-serie', 4)], clicksByRetailer: [w('grays-jb-serie · bol.com', 3)] },
  };

  it('accepts a file without it (files from before 2026-11-24) and one with it', () => {
    expect(Dagcijfers.safeParse(base).success).toBe(true);
    expect(Dagcijfers.safeParse({ ...base, conversie: { ok: true, value: conversie } }).success).toBe(true);
  });

  it('accepts a failed Conversie part next to working sources', () => {
    expect(Dagcijfers.safeParse({ ...base, conversie: { ok: false, reden: 'Conversie: PostHog-query mislukt' } }).success).toBe(true);
  });

  it('rejects a malformed one: a missing period or a count without both weeks', () => {
    const withoutPeriod: Record<string, unknown> = { ...conversie };
    delete withoutPeriod.periode;
    expect(Dagcijfers.safeParse({ ...base, conversie: { ok: true, value: withoutPeriod } }).success).toBe(false);
    const broken = { ...conversie, stand: { ...conversie.stand, bezoekers: { key: 'b', now: 1 } } };
    expect(Dagcijfers.safeParse({ ...base, conversie: { ok: true, value: broken } }).success).toBe(false);
  });

  it('keeps every figure out of the readable metadata: only the sealed part holds them', () => {
    const full = Dagcijfers.parse({ ...base, conversie: { ok: true, value: conversie } });
    const meta = JSON.stringify(dagcijfersMeta(full, '2026-11-24'));
    expect(meta).not.toContain('conversie');
    expect(meta).not.toContain('Grays');
    expect(meta).not.toContain('900');
  });
});
