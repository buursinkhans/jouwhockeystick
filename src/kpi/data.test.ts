import { describe, expect, it } from 'vitest';
import { LIVE_VISITORS } from '../analytics-report/hogql';
import { COMPARE_EVENTS, DAY_COLUMNS, DAY_FIELDS, daysQuery, excludedQuery, Kpi, KpiDay, pageGroup, parseBreakdown, parseDays } from './data';

// DEMO — GEEN WERKELIJKE DATA: every figure below is synthetic.
describe('KPI queries', () => {
  it('telt per sessie, op Amsterdamse dagen, met het bezoekersfilter', () => {
    const q = daysQuery('2026-11-01', '2026-11-03');
    expect(q).toContain('GROUP BY sid HAVING pv > 0');
    expect(q).toContain(LIVE_VISITORS);
    expect(q).toContain("toDateTime('2026-11-04 00:00:00', 'Europe/Amsterdam')");
    for (const event of COMPARE_EVENTS) expect(q).toContain(`'${event}'`);
  });
  it('telt de uitgefilterde sessies apart, zonder het bezoekersfilter', () => {
    const q = excludedQuery('2026-11-01', '2026-11-03');
    expect(q).not.toContain(LIVE_VISITORS);
    expect(q).toContain("countIf(groep = 'outside')");
  });
});

describe('parseDays', () => {
  const rows = [['2026-11-01', 10, 2, 3, 4, 5, 1, 2, 1, 1, 0]];
  const days = parseDays(rows, [['2026-11-01', 7, 2]], ['2026-11-01', '2026-11-02']);
  it('zet de kolommen in de volgorde van DAY_FIELDS', () => {
    expect(DAY_FIELDS).toHaveLength(10);
    expect(days[0]).toEqual(['2026-11-01', 10, 2, 3, 4, 5, 1, 2, 1, 1, 0, 7, 2]);
    expect(DAY_COLUMNS).toHaveLength(13);
    expect(KpiDay.safeParse(days[0]).success).toBe(true);
  });
  it('geeft een dag zonder sessies nul', () => {
    expect(days[1]).toEqual(['2026-11-02', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

describe('breakdown', () => {
  it('benoemt de soort pagina', () => {
    expect(pageGroup('/')).toBe('Startpagina');
    expect(pageGroup('/sticks')).toBe('Catalogus sticks');
    expect(pageGroup('/sticks/demo/')).toBe('Productpagina stick');
    expect(pageGroup('/onbekend')).toBe('Overig');
  });
  it('telt bronnen en winkels op', () => {
    const b = parseBreakdown(
      { start: '2026-11-01', end: '2026-11-28' },
      [
        ['www.google.com', 'Mobile', '/', 4, 1],
        ['www.google.nl', 'Desktop', '/sticks', 2, 0],
        ['chatgpt.com', 'Mobile', '/', 1, 0],
      ],
      [
        ['bol', 'catalogus', 2],
        ['bol', 'stickwijzer', 1],
      ],
      [['/sticks', 5, 1]],
    );
    expect(b.bronnen[0]).toEqual({ key: 'Google', sessies: 6, metKlik: 1 });
    expect(b.winkels).toEqual([{ key: 'bol', klikken: 3 }]);
    expect(b.paginas).toHaveLength(1);
  });
});

describe('Kpi', () => {
  it('laat elke bron apart mislukken', () => {
    const value = { versie: 1, tot: '2026-11-02', sessies: { ok: false, reden: 'demo' }, google: { ok: true, value: { dagen: [] } } };
    expect(Kpi.safeParse(value).success).toBe(true);
  });
});
