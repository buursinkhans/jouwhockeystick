import { describe, expect, it } from 'vitest';
import {
  buildSeason,
  expectedChange,
  exportKey,
  importVerdict,
  isStale,
  monthlyMeans,
  nextWave,
  parseTrendsCsv,
  peakMonths,
  reliabilityOf,
  seasonFromExports,
  seasonLevel,
  seasonProfile,
  themeSeries,
  TrendExport,
  type Profile,
} from './trends';

// DEMO — GEEN WERKELIJKE DATA: every series below is synthetic.
const SHAPE = [56, 67, 104, 97, 87, 93, 63, 122, 137, 108, 182, 86];
const monthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}-01`;
const series = (from: number, to: number, scale = 0.5): [string, number][] => {
  const out: [string, number][] = [];
  for (let year = from; year <= to; year += 1) for (let month = 1; month <= 12; month += 1) out.push([monthKey(year, month), Math.round((SHAPE[month - 1] as number) * scale)]);
  return out;
};
const exportOf = (over: Partial<TrendExport> = {}): TrendExport => ({
  versie: 1,
  thema: 'referentie',
  rol: 'referentie',
  regio: 'NL',
  zoektype: 'web',
  categorie: 'alle',
  granulariteit: 'maand',
  periode: { start: '2021-01-01', end: '2025-12-01' },
  geexporteerd: '2026-01-05',
  bron: 'test',
  termen: [{ term: 'hockeystick', punten: series(2021, 2025) }],
  genegeerd: [],
  ...over,
});

const MONTHLY = (rows: string[]) => ['"Time","Hockeystick","hockeystick maat","greys hockeystick"', ...rows].join('\n');
const demoRows = () => Array.from({ length: 12 }, (_, i) => `"2025-${String(i + 1).padStart(2, '0')}-01",${40 + i},${i % 3},0`);

describe('parseTrendsCsv', () => {
  it('leest de kale vorm, haalt de termen op en laat een term die altijd 0 is weg met een reden', () => {
    const parsed = parseTrendsCsv(MONTHLY(demoRows()));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.granulariteit).toBe('maand');
    expect(parsed.termen.map((t) => t.term)).toEqual(['Hockeystick', 'hockeystick maat']);
    expect(parsed.genegeerd).toEqual([{ term: 'greys hockeystick', reden: expect.stringContaining('altijd 0') }]);
    expect(parsed.termen[0]?.punten[0]).toEqual(['2025-01-01', 40]);
  });
  it('leest de vorm met een paar regels vooraf en een regio achter de term, met een BOM en <1', () => {
    const csv = ['﻿Categorie: Alle categorieën', '', 'Maand,hockeystick: (Nederland),stick: (Nederland)', ...Array.from({ length: 10 }, (_, i) => `2025-${String(i + 1).padStart(2, '0')},${50 + i},<1`)].join('\r\n');
    const parsed = parseTrendsCsv(csv);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.regioLabel).toBe('Nederland');
    expect(parsed.termen.map((t) => t.term)).toEqual(['hockeystick']);
    expect(parsed.genegeerd.map((g) => g.term)).toEqual(['stick']);
  });
  it('herkent week- en dagdata aan de afstand tussen de datums', () => {
    const weekly = ['Week,term', ...Array.from({ length: 10 }, (_, i) => `${new Date(Date.UTC(2025, 0, 5 + 7 * i)).toISOString().slice(0, 10)},${10 + i}`)].join('\n');
    const parsed = parseTrendsCsv(weekly);
    expect(parsed.ok && parsed.granulariteit).toBe('week');
  });
  it('zegt waarom een bestand niet bruikbaar is', () => {
    const reden = (text: string) => {
      const parsed = parseTrendsCsv(text);
      return parsed.ok ? '' : parsed.reden;
    };
    expect(reden('')).toContain('leeg');
    expect(reden('<!doctype html><html></html>')).toContain('webpagina');
    expect(reden('a,b\n1,2')).toContain('datums');
    expect(reden(MONTHLY(demoRows().slice(0, 5)))).toContain('Te weinig');
    expect(reden(MONTHLY(['"2025-01-01",abc,1,1', ...demoRows()]))).toContain('Geen getal');
    expect(reden(MONTHLY(['"01-01-2025",1,1,1', ...demoRows()]))).toContain('datumformaat');
    expect(reden(MONTHLY(['"2025-01-01",1,1', ...demoRows()]))).toContain('ontbreken');
    expect(reden('"Time","a","a"\n' + demoRows().map((r) => r.split(',').slice(0, 3).join(',')).join('\n'))).toContain('twee keer');
    expect(reden('"Time","a"\n' + demoRows().map((r) => `${r.split(',')[0]},0`).join('\n'))).toContain('op 0');
    expect(reden(MONTHLY([...demoRows(), '"2025-06-01",1,1,1']))).toContain('volgorde');
  });
});

describe('dubbele en nieuwere exports', () => {
  const first = exportOf();
  it('een nog niet geïmporteerde vergelijking is nieuw', () => {
    expect(importVerdict(first, []).action).toBe('nieuw');
    expect(importVerdict(first, [exportOf({ thema: 'maat', rol: 'thema' })]).action).toBe('nieuw');
  });
  it('dezelfde vergelijking en dezelfde of oudere exportdatum is dubbel', () => {
    expect(importVerdict(first, [first]).action).toBe('dubbel');
    expect(importVerdict(exportOf({ geexporteerd: '2025-12-01' }), [first]).action).toBe('dubbel');
  });
  it('een nieuwere export van dezelfde vergelijking vervangt de oude', () => {
    expect(importVerdict(exportOf({ geexporteerd: '2026-04-01' }), [first]).action).toBe('vervangen');
  });
  it('een andere periode, regio of termenlijst is een andere vergelijking', () => {
    const key = exportKey(first);
    expect(exportKey(exportOf({ regio: 'BE' }))).not.toBe(key);
    expect(exportKey(exportOf({ periode: { start: '2020-01-01', end: '2025-12-01' } }))).not.toBe(key);
    expect(exportKey(exportOf({ termen: [{ term: 'andere', punten: [['2021-01-01', 1]] }] }))).not.toBe(key);
  });
  it('het opgeslagen formaat wordt gecontroleerd', () => {
    expect(TrendExport.safeParse(first).success).toBe(true);
    expect(TrendExport.safeParse({ ...first, termen: [{ term: 'x', punten: [['2021-01-01', 130]] }] }).success).toBe(false);
  });
});

describe('seizoenspatroon', () => {
  it('geeft het jaarpatroon met het gemiddelde van het jaar op 100, uit alleen volledige jaren', () => {
    const profile = seasonProfile(series(2021, 2025), '2026-01') as Profile;
    expect(profile.jaren).toEqual([2021, 2022, 2023, 2024, 2025]);
    expect(profile.index).toHaveLength(12);
    expect(profile.index[10]).toBeGreaterThan(profile.index[0] as number);
    expect(Math.round(profile.index.reduce((a, b) => a + b, 0) / 12)).toBe(100);
  });
  it('gebruikt de maand die nog loopt en onvolledige jaren nooit', () => {
    const points = [...series(2022, 2025), ['2026-01-01', 99], ['2026-02-01', 99]] as [string, number][];
    expect(seasonProfile(points, '2026-02')?.jaren).toEqual([2022, 2023, 2024, 2025]);
    const partial = series(2022, 2025).filter(([d]) => d !== '2025-12-01');
    expect(seasonProfile(partial, '2026-01')?.jaren).toEqual([2022, 2023, 2024]);
  });
  it('geeft niets bij minder dan twee volledige jaren', () => {
    expect(seasonProfile(series(2025, 2025), '2026-01')).toBeNull();
  });
  it('middelt week- en dagpunten tot maanden', () => {
    const means = monthlyMeans([['2025-01-05', 10], ['2025-01-12', 20], ['2025-02-02', 6]]);
    expect(means.get('2025-01')).toBe(15);
    expect(means.get('2025-02')).toBe(6);
  });
  it('noemt de piekmaanden', () => {
    expect(peakMonths(seasonProfile(series(2021, 2025), '2026-01') as Profile)).toEqual([8, 9, 11]);
  });
});

describe('betrouwbaarheid van een kleine term', () => {
  it('goed vanaf een gemiddelde index van 20 zonder nullen, richting vanaf 5, anders te klein', () => {
    expect(reliabilityOf(Array(12).fill(30))).toBe('goed');
    expect(reliabilityOf([30, 0, 30, 30])).toBe('te klein'); // a quarter of the months is 0
    expect(reliabilityOf([6, 5, 7, 6, 5, 6, 7, 5, 6, 5])).toBe('richting');
    expect(reliabilityOf([3, 0, 4, 0, 2, 0, 3, 0, 2, 0])).toBe('te klein');
    expect(reliabilityOf([])).toBe('te klein');
  });
  it('een thema telt de termen op: dezelfde schaal, dus dat mag', () => {
    const sum = themeSeries([
      { term: 'a', punten: [['2025-01-01', 3], ['2025-02-01', 4]] },
      { term: 'b', punten: [['2025-01-01', 2], ['2025-02-01', 1]] },
    ]);
    expect(sum).toEqual([['2025-01-01', 5], ['2025-02-01', 5]]);
  });
});

describe('seizoenseffect en volgende golf', () => {
  const profile = seasonProfile(series(2021, 2025), '2026-01') as Profile;
  it('verwacht van oktober naar november een stijging en van november naar december een daling', () => {
    const october = { start: '2026-10-01', end: '2026-10-28' };
    const november = { start: '2026-11-01', end: '2026-11-28' };
    expect(expectedChange(profile, november, october) as number).toBeGreaterThan(1.4);
    expect(expectedChange(profile, { start: '2026-12-01', end: '2026-12-28' }, november) as number).toBeLessThan(0.6);
  });
  it('weegt een periode over twee maanden naar het aantal dagen', () => {
    const level = seasonLevel(profile, { start: '2026-10-18', end: '2026-11-14' });
    const october = profile.index[9] as number;
    const november = profile.index[10] as number;
    expect(level).toBeGreaterThan(october);
    expect(level).toBeLessThan(november);
  });
  it('vindt de volgende golf, met het venster van 8 tot 4 weken eerder', () => {
    const wave = nextWave(profile, '2026-11-25');
    expect(wave?.maand).toBe('2027-03');
    expect(wave?.wekenTot).toBe(14);
    expect(wave?.voorbereidenVanaf).toBe('2027-01-04');
    expect(wave?.voorbereidenTot).toBe('2027-02-01');
    expect(nextWave(profile, '2026-06-10')?.maand).toBe('2026-08');
    expect(nextWave(profile, '2026-12-31')?.maand).toBe('2027-03');
  });
  it('geeft niets als het jaar vlak is', () => {
    expect(nextWave({ index: Array(12).fill(100), jaren: [2024, 2025] }, '2026-11-25')).toBeNull();
  });
  it('is verouderd na 100 dagen', () => {
    expect(isStale('2026-08-01', '2026-11-25')).toBe(true);
    expect(isStale('2026-11-01', '2026-11-25')).toBe(false);
  });
});

describe('seasonFromExports en buildSeason', () => {
  const reference = exportOf();
  const theme = exportOf({
    thema: 'maat',
    rol: 'thema',
    termen: [
      { term: 'hockeystick maat', punten: series(2021, 2025, 0.1) },
      { term: 'hockeystick lengte', punten: series(2021, 2025, 0.08) },
    ],
  });
  it('maakt het referentiepatroon en een patroon per thema', () => {
    const input = seasonFromExports([reference, theme]);
    expect(input?.profile.index).toHaveLength(12);
    expect(input?.themas.map((t) => t.thema)).toEqual(['maat']);
    expect(input?.themas[0]?.piekmaanden).toEqual([8, 9, 11]);
    expect(input?.themas[0]?.betrouwbaarheid).toBe('richting');
  });
  it('heeft een referentie-export met de ankerterm nodig', () => {
    expect(seasonFromExports([theme])).toBeNull();
    expect(seasonFromExports([exportOf({ termen: [{ term: 'iets anders', punten: series(2021, 2025) }] })])).toBeNull();
  });
  it('kiest de nieuwste referentie en het nieuwste thema', () => {
    const newer = exportOf({ geexporteerd: '2026-04-01' });
    expect(seasonFromExports([reference, newer])?.geexporteerd).toBe('2026-04-01');
  });
  it('rekent de verwachte, werkelijke en gecorrigeerde verandering uit', () => {
    const input = seasonFromExports([reference, theme]);
    if (!input) throw new Error('no input');
    const season = buildSeason(input, {
      period: { start: '2026-11-01', end: '2026-11-28' },
      previousPeriod: { start: '2026-10-04', end: '2026-10-31' },
      impressionsNow: 150,
      impressionsBefore: 100,
      today: '2026-11-29',
    });
    expect(season.werkelijkeVerandering).toBe(1.5);
    expect(season.verwachteVerandering as number).toBeGreaterThan(1.3);
    expect(season.gecorrigeerd as number).toBeLessThan(1.5);
    expect(season.verouderd).toBe(true); // an export of January, read at the end of November
    expect(season.bron).toContain('relatieve index');
    expect(season.volgendeGolf?.maand).toBe('2027-03');
  });
  it('geeft geen gecorrigeerde verandering als er geen vorige periode was', () => {
    const input = seasonFromExports([reference]);
    if (!input) throw new Error('no input');
    const season = buildSeason(input, {
      period: { start: '2026-11-01', end: '2026-11-28' },
      previousPeriod: { start: '2026-10-04', end: '2026-10-31' },
      impressionsNow: 150,
      impressionsBefore: 0,
      today: '2026-11-29',
    });
    expect(season.werkelijkeVerandering).toBeNull();
    expect(season.gecorrigeerd).toBeNull();
  });
});
