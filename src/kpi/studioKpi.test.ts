import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DAY_COLUMNS } from './data';

/** The calculations of the studio tab "KPI" (social/studio/kpi.js), loaded the way the page loads them. */
type Value = { waarde: number | null; tot: string | null; compleet: boolean; onvolledig: boolean; reden: string; teller: number | null; noemer: number | null };
type Card = Value & {
  status: string;
  grijs: string;
  pct: number | null;
  target: number | null;
  targetNu: number | null;
  vloerNu: number | null;
  prognose: number | null;
  eersteTarget: string | null;
  vorige: { waarde: number; start: string; end: string } | null;
};
type Period = { key: string; start: string; end: string; fullEnd: string; months: string[] };
type Targets = { versie: number; vastgelegd: string; maanden: Record<string, Record<string, { primair?: number; vloer?: number; ambitie?: number }>> };
type Model = { sales: Map<string, unknown> };
type Lib = {
  DEFS: Record<string, { naam: string; formule: string; teller: string; bron: string; frequentie: string; eigenaar: string; aannames: string; beperkingen: string }>;
  PRIMARY: string[];
  TARGETABLE: string[];
  DAY_COLUMNS: string[];
  NO_CONCLUSION: string;
  period(kind: string, ref: string): Period;
  model(cijfers: unknown, verkoop: unknown): Model;
  value(m: Model, key: string, start: string, end: string): Value;
  evaluate(m: Model, targets: Targets | null, key: string, p: Period): Card;
  trend14(m: Model, key: string): { nu: number; ervoor: number } | null;
  analysis(cards: Card[]): { afwijking: Card | null; positief: Card | null; tekst: string };
  series(m: Model, targets: Targets | null, key: string, months: string[]): { maand: string; waarde: number | null; deels: boolean; primair: number | null }[];
  latestTargets(docs: unknown[]): Targets | null;
  newVersion(current: Targets | null, month: string, values: unknown, now: string): Targets;
  status(pct: number): string;
};

const source = readFileSync('social/studio/kpi.js', 'utf8');
const win: { JhsKpi?: Lib } = {};
new Function('window', source)(win);
const K = win.JhsKpi!;

const days = (from: string, to: string, row: Partial<Record<(typeof DAY_COLUMNS)[number], number>>) => {
  const out: (string | number)[][] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += 86_400_000) {
    out.push([new Date(t).toISOString().slice(0, 10), ...DAY_COLUMNS.slice(1).map((c) => row[c] ?? 0)]);
  }
  return out;
};
const cijfers = (tot: string, dagen: (string | number)[][], google: [string, number, number][] = []) => ({
  kpi: {
    versie: 1,
    tot,
    sessies: { ok: true, value: { dagen, uitsplitsing: null } },
    google: { ok: true, value: { dagen: google } },
  },
});
const money = (orders: number, commissie: number, kliks: number | null = 100, omzet: number | null = null) => ({ kliks, orders, omzet, commissie });
const targets = (maanden: Targets['maanden']): Targets => ({ versie: 1, vastgelegd: '2027-01-01T00:00:00Z', maanden });

const march = cijfers('2027-03-15', days('2027-01-01', '2027-03-15', { sessies: 40, metKlik: 4, klikken: 6, homepage: 10, homepageStart: 1 }));

describe('studio KPI: definitions', () => {
  it('reads the day columns in the order the figures are written', () => {
    expect(K.DAY_COLUMNS).toEqual([...DAY_COLUMNS]);
  });

  it('documents every KPI, and has five primary cards', () => {
    expect(K.PRIMARY).toEqual(['googleKlikken', 'bezoeken', 'partnerCtr', 'verkopen', 'affiliateOmzet']);
    for (const [key, d] of Object.entries(K.DEFS)) {
      for (const field of ['naam', 'formule', 'teller', 'bron', 'frequentie', 'eigenaar', 'aannames', 'beperkingen'] as const) {
        expect(d[field], `${key}.${field}`).toBeTruthy();
      }
    }
    for (const key of K.TARGETABLE) expect(K.DEFS[key], key).toBeDefined();
  });

  it('holds no target values', () => {
    expect(source).not.toMatch(/primair\s*:\s*\d|ambitie\s*:\s*\d|vloer\s*:\s*\d/);
  });
});

describe('studio KPI: periods', () => {
  it('cuts the running period at the last full day and keeps the calendar months', () => {
    expect(K.period('maand', '2027-03-15')).toMatchObject({ start: '2027-03-01', end: '2027-03-15', fullEnd: '2027-03-31', months: ['2027-03'] });
    expect(K.period('vorigeMaand', '2027-01-05')).toMatchObject({ start: '2026-12-01', end: '2026-12-31' });
    expect(K.period('kwartaal', '2027-02-10')).toMatchObject({ start: '2027-01-01', months: ['2027-01', '2027-02', '2027-03'] });
    expect(K.period('vorigKwartaal', '2027-02-10')).toMatchObject({ start: '2026-10-01', end: '2026-12-31' });
    expect(K.period('jaar', '2027-02-10').months).toHaveLength(12);
  });
});

describe('studio KPI: values', () => {
  it('computes a ratio from the totals, not from daily percentages', () => {
    const m = K.model(
      cijfers('2027-03-02', [...days('2027-03-01', '2027-03-01', { sessies: 100, metKlik: 1 }), ...days('2027-03-02', '2027-03-02', { sessies: 1, metKlik: 1 })]),
      null,
    );
    expect(K.value(m, 'partnerCtr', '2027-03-01', '2027-03-02').waarde).toBeCloseTo((2 / 101) * 100);
  });

  it('never turns missing data into zero', () => {
    const m = K.model({ kpi: { versie: 1, tot: '2027-03-02', sessies: { ok: false, reden: 'PostHog gaf 500' }, google: { ok: true, value: { dagen: [] } } } }, null);
    expect(K.value(m, 'bezoeken', '2027-03-01', '2027-03-02').waarde).toBeNull();
    expect(K.value(m, 'googleKlikken', '2027-03-01', '2027-03-02').waarde).toBeNull();
    expect(K.value(m, 'verkopen', '2027-03-01', '2027-03-02').waarde).toBeNull();
    expect(K.value(m, 'top10', '2027-03-01', '2027-03-02').waarde).toBeNull();
    expect(K.model(null, null).sales.size).toBe(0);
  });

  it('marks a period that starts before the measurement', () => {
    const m = K.model(cijfers('2026-10-31', days('2026-10-06', '2026-10-31', { sessies: 1 })), null);
    expect(K.value(m, 'bezoeken', '2026-10-01', '2026-10-31')).toMatchObject({ waarde: 26, compleet: false });
  });

  it('adds sales per month, leaves unknown amounts out and names a partner that was not read', () => {
    const m = K.model(march, {
      maanden: [{ maand: '2027-03', from: '2027-03-01', to: '2027-03-15', partners: { bol: money(8, 20, 200), daka: money(4, 10, null), plutosport: { fout: 'Awin 500' } } }],
    });
    expect(K.value(m, 'verkopen', '2027-03-01', '2027-03-15')).toMatchObject({ waarde: 12, onvolledig: true });
    expect(K.value(m, 'verkopen', '2027-03-01', '2027-03-15').reden).toContain('Plutosport niet gelezen');
    // Daka gives no clicks: its orders stay out of the conversion per click.
    expect(K.value(m, 'affiliateConversie', '2027-03-01', '2027-03-15').waarde).toBeCloseTo(4);
    // 15 days of 4 sessions with a click: 12 orders / 60.
    expect(K.value(m, 'partnerConversie', '2027-03-01', '2027-03-15').waarde).toBeCloseTo(20);
    expect(K.value(m, 'winkelomzet', '2027-03-01', '2027-03-15').waarde).toBe(0);
    expect(K.value(m, 'orderwaarde', '2027-03-01', '2027-03-15').waarde).toBeNull();
  });
});

describe('studio KPI: targets and status', () => {
  const t = targets({ '2027-03': { bezoeken: { primair: 1200, vloer: 600 }, partnerCtr: { primair: 10 }, verkopen: { primair: 4 } } });
  const m = K.model(march, { maanden: [{ maand: '2027-03', from: '2027-03-01', to: '2027-03-15', partners: { bol: money(3, 9) } }] });
  const p = K.period('maand', '2027-03-15');

  it('compares a sum pro rata and a ratio with the full target', () => {
    const visits = K.evaluate(m, t, 'bezoeken', p);
    expect(visits.waarde).toBe(600);
    expect(visits.target).toBe(1200);
    expect(visits.targetNu).toBeCloseTo((1200 * 15) / 31);
    expect(visits.vloerNu).toBeCloseTo((600 * 15) / 31);
    expect(visits.status).toBe('groen');
    const ctr = K.evaluate(m, t, 'partnerCtr', p);
    expect(ctr.targetNu).toBe(10);
    expect(ctr.pct).toBeCloseTo(1);
  });

  it('uses 100% and 85% as the limits', () => {
    expect([K.status(1), K.status(0.99), K.status(0.85), K.status(0.849)]).toEqual(['groen', 'oranje', 'oranje', 'rood']);
  });

  it('stays grey without a target, with too few orders and with a small denominator', () => {
    expect(K.evaluate(m, null, 'bezoeken', p)).toMatchObject({ status: 'grijs', grijs: 'Nog geen targets ingevoerd.' });
    expect(K.evaluate(m, t, 'googleKlikken', p).status).toBe('grijs');
    expect(K.evaluate(m, t, 'verkopen', p).grijs).toContain('Minder dan 10 orders');
    const few = K.model(cijfers('2027-03-02', days('2027-03-01', '2027-03-02', { sessies: 5, metKlik: 1 })), null);
    expect(K.evaluate(few, t, 'partnerCtr', K.period('maand', '2027-03-02')).grijs).toContain('te weinig');
  });

  it('says from which month a target exists', () => {
    const before = K.model(cijfers('2027-02-10', days('2027-02-01', '2027-02-10', { sessies: 40 })), null);
    expect(K.evaluate(before, t, 'bezoeken', K.period('maand', '2027-02-10'))).toMatchObject({ target: null, eersteTarget: '2027-03' });
  });

  it('gives a quarter a sum target only when every month has one, and a year to date the months so far', () => {
    const clicks = targets({ '2027-01': { bezoeken: { primair: 310 } }, '2027-02': { bezoeken: { primair: 280 } }, '2027-03': { bezoeken: { primair: 620 } } });
    const q = K.evaluate(m, clicks, 'bezoeken', K.period('kwartaal', '2027-03-15'));
    expect(q.target).toBe(1210);
    expect(q.targetNu).toBeCloseTo(310 + 280 + (620 * 15) / 31);
    const y = K.evaluate(m, clicks, 'bezoeken', K.period('jaar', '2027-03-15'));
    expect(y.target).toBeNull();
    expect(y.targetNu).toBeCloseTo(q.targetNu!);
  });

  it('forecasts visits from day 10 only, and compares equal stretches only', () => {
    expect(K.evaluate(m, t, 'bezoeken', p).prognose).toBe(1240);
    expect(K.evaluate(m, t, 'bezoeken', K.period('maand', '2027-03-09')).prognose).toBeNull();
    expect(K.evaluate(m, t, 'bezoeken', p).vorige).toEqual({ waarde: 600, start: '2027-02-01', end: '2027-02-15' });
    expect(K.evaluate(m, t, 'verkopen', p).vorige).toBeNull();
    expect(K.trend14(m, 'bezoeken')).toMatchObject({ nu: 560, ervoor: 560 });
    expect(K.trend14(m, 'verkopen')).toBeNull();
  });

  it('draws no conclusion without a judged KPI', () => {
    expect(K.analysis([K.evaluate(m, null, 'bezoeken', p)]).tekst).toBe('Er is onvoldoende data beschikbaar om een betrouwbare conclusie te trekken.');
    const found = K.analysis([K.evaluate(m, t, 'bezoeken', p), K.evaluate(m, targets({ '2027-03': { partnerCtr: { primair: 20 } } }), 'partnerCtr', p)]);
    expect(found.afwijking?.status).toBe('rood');
    expect(found.positief?.status).toBe('groen');
  });

  it('gives the chart the actuals and targets per month, with unfinished months marked', () => {
    const s = K.series(m, t, 'bezoeken', ['2027-02', '2027-03', '2027-04']);
    expect(s.map((x) => [x.waarde, x.deels, x.primair])).toEqual([
      [1120, false, null],
      [600, true, 1200],
      [null, false, null],
    ]);
  });

  it('keeps versions: the newest counts and a new one replaces one month', () => {
    const old = targets({ '2027-03': { bezoeken: { primair: 1 } }, '2027-04': { bezoeken: { primair: 2 } } });
    const next = K.newVersion(old, '2027-03', { bezoeken: { primair: 5, vloer: Number.NaN }, onzin: { primair: 1 } }, '2027-02-01T00:00:00Z');
    expect(next.maanden).toEqual({ '2027-03': { bezoeken: { primair: 5 } }, '2027-04': { bezoeken: { primair: 2 } } });
    expect(old.maanden['2027-03']).toEqual({ bezoeken: { primair: 1 } });
    expect(K.latestTargets([next, old])?.vastgelegd).toBe(next.vastgelegd > old.vastgelegd ? next.vastgelegd : old.vastgelegd);
    expect(K.latestTargets([])).toBeNull();
  });
});
