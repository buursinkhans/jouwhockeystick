import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ACTION_LABELS,
  aggregate,
  analyse,
  classifyBrand,
  confidenceOf,
  decide,
  intentOf,
  nextHistory,
  NO_ACTION_REASON,
  pagePath,
  pageType,
  SeoReport,
  statusLine,
  type OfferMatch,
  type QueryStat,
} from './opportunities';
import type { SearchRow } from './searchConsole';

// DEMO — GEEN WERKELIJKE DATA: every figure and query below is synthetic.
const SITE = 'https://jouwhockeystick.nl';
const row = (query: string, path: string, clicks: number, impressions: number, position: number): SearchRow => ({
  query,
  page: `${SITE}${path}`,
  clicks,
  impressions,
  position,
});
const stat = (query: string, impressions: number, position: number, pages: [string, number][], clicks = 1): QueryStat => ({
  query,
  clicks,
  impressions,
  position,
  pages: pages.map(([page, n]) => ({ page, impressions: n, clicks: 0, position })),
});
const none: OfferMatch = { kind: 'geen', path: null };
const article = (path: string): OfferMatch => ({ kind: 'artikel', path });
const stick: OfferMatch = { kind: 'stick', path: '/sticks/demo' };

describe('classifyBrand (besluit 2026-11-25)', () => {
  it('herkent de eigen naam, ook met spatie, .nl en een typefout', () => {
    expect(classifyBrand('jouwhockeystick')).toBe('eigen');
    expect(classifyBrand('jouw hockeystick')).toBe('eigen');
    expect(classifyBrand('jouwhockeystick.nl')).toBe('eigen');
    expect(classifyBrand('jouwhockystick')).toBe('eigen');
    expect(classifyBrand('jouwhockeystick maat')).toBe('eigen');
  });
  it('telt The Indian Maharadja en Princess als merkwoord, ook in andere schrijfwijzen', () => {
    expect(classifyBrand('indian maharadja hockeystick')).toBe('merkwoord');
    expect(classifyBrand('the indian maharaja')).toBe('merkwoord');
    expect(classifyBrand('indian marahadja')).toBe('merkwoord');
    expect(classifyBrand('indianmaharadja')).toBe('merkwoord');
    expect(classifyBrand('princess hockeystick')).toBe('merkwoord');
  });
  it('telt andere productmerken en gewone zoekopdrachten als niet-merk', () => {
    expect(classifyBrand('osaka hockeystick')).toBe('niet-merk');
    expect(classifyBrand('grays hockeystick')).toBe('niet-merk');
    expect(classifyBrand('brabo hockeystick')).toBe('niet-merk');
    expect(classifyBrand('hockeystick maat 51')).toBe('niet-merk');
  });
  it('een kort woord laat geen typefout toe', () => {
    expect(classifyBrand('prince hockeystick')).toBe('niet-merk');
  });
});

describe('pagina en intentie', () => {
  it('haalt het pad uit een URL zonder slash aan het eind', () => {
    expect(pagePath('https://jouwhockeystick.nl/kennis/maat/')).toBe('/kennis/maat');
    expect(pagePath('https://jouwhockeystick.nl/')).toBe('/');
  });
  it('bepaalt het paginatype uit het pad', () => {
    expect(pageType('/')).toBe('home');
    expect(pageType('/sticks')).toBe('catalogus');
    expect(pageType('/sticks/demo-stick')).toBe('product');
    expect(pageType('/zaalsticks')).toBe('catalogus');
    expect(pageType('/kennis/hockeystick-lengte-tabel')).toBe('kennis');
    expect(pageType('/blog/iets')).toBe('blog');
    expect(pageType('/merken/osaka')).toBe('merk');
    expect(pageType('/vergelijk/demo-reeks')).toBe('vergelijk');
    expect(pageType('/stickwijzer/advies')).toBe('tool');
    expect(pageType('/hockeyschoenen/demo')).toBe('schoen');
    expect(pageType('/clubs')).toBe('overig');
  });
  it('leidt intentie af uit woorden, nooit uit een model', () => {
    expect(intentOf('hockeystick kopen', none)).toBe('kopen');
    expect(intentOf('osaka vs grays', none)).toBe('vergelijken');
    expect(intentOf('hockeystick maat 51', none)).toBe('informatie');
    expect(intentOf('osaka hockeystick', stick)).toBe('product');
    expect(intentOf('surprise hockeystick', none)).toBe('onbekend');
  });
});

describe('aggregate', () => {
  it('voegt dezelfde zoekopdracht samen en weegt de positie op vertoningen', () => {
    const map = aggregate([
      row('Hockeystick Maat', '/kennis/a', 2, 30, 4),
      row('hockeystick  maat', '/sticks', 1, 10, 8),
      row('', '/x', 1, 1, 1),
    ]);
    const stats = map.get('hockeystick maat');
    expect(map.size).toBe(1);
    expect(stats?.impressions).toBe(40);
    expect(stats?.clicks).toBe(3);
    expect(stats?.position).toBeCloseTo(5, 5);
    expect(stats?.pages.map((p) => p.page)).toEqual(['/kennis/a', '/sticks']);
  });
});

describe('decide', () => {
  const comparable = (q: string, position: number) => stat(q, 20, position, [['/sticks/demo', 20]]);

  it('geen aanbod: informatie wordt C, kopen F, de rest E', () => {
    expect(decide({ now: stat('hockeystick maat 51', 20, 12, [['/', 20]]), before: undefined, long: undefined, offer: none }).code).toBe('C');
    expect(decide({ now: stat('nike hockeystick kopen', 20, 12, [['/', 20]]), before: undefined, long: undefined, offer: none }).code).toBe('F');
    expect(decide({ now: stat('surprise hockeystick', 20, 12, [['/', 20]]), before: undefined, long: undefined, offer: none }).code).toBe('E');
  });
  it('twee pagina\'s voor dezelfde zoekopdracht geven B', () => {
    const now = stat('osaka hockeystick', 40, 6, [['/merken/osaka', 24], ['/sticks/demo', 16]]);
    const long = stat('osaka hockeystick', 100, 6, [['/merken/osaka', 60], ['/sticks/demo', 40]]);
    expect(decide({ now, before: undefined, long, offer: stick }).code).toBe('B');
  });
  it('een kleine tweede pagina telt niet als kannibalisatie', () => {
    const now = stat('osaka hockeystick', 40, 3, [['/merken/osaka', 38], ['/sticks/demo', 2]]);
    const long = stat('osaka hockeystick', 100, 3, [['/merken/osaka', 92], ['/sticks/demo', 8]]);
    expect(decide({ now, before: undefined, long, offer: stick }).code).toBe('F');
  });
  it('een verslechterde positie met genoeg vertoningen in beide perioden geeft A', () => {
    const decision = decide({ now: comparable('osaka hockeystick', 9), before: comparable('osaka hockeystick', 5), long: undefined, offer: stick });
    expect(decision.code).toBe('A');
    expect(decision.reden).toContain('verslechterd');
  });
  it('een daling telt niet als de periode ervoor te weinig vertoningen had', () => {
    const before = stat('osaka hockeystick', 4, 2, [['/sticks/demo', 4]]);
    expect(decide({ now: comparable('osaka hockeystick', 9), before, long: undefined, offer: stick }).reden).not.toContain('verslechterd');
  });
  it('net buiten de eerste resultaten: A, of B/C/D als de pagina niet past bij de vraag', () => {
    const base = { before: undefined, long: undefined };
    expect(decide({ ...base, now: stat('osaka hockeystick', 20, 9, [['/sticks/demo', 20]]), offer: stick }).code).toBe('A');
    const info = stat('welke maat hockeystick', 20, 9, [['/sticks', 20]]);
    const found = decide({ ...base, now: info, offer: article('/kennis/hockeystick-lengte-tabel') });
    expect(found.code).toBe('B');
    expect(found.page).toBe('/kennis/hockeystick-lengte-tabel');
    expect(decide({ ...base, now: info, offer: { kind: 'categorie', path: '/sticks' } }).code).toBe('C');
    const buy = stat('hockeystick kopen', 20, 9, [['/blog/iets', 20]]);
    expect(decide({ ...base, now: buy, offer: { kind: 'categorie', path: '/sticks' } }).code).toBe('D');
  });
  it('een kennisvraag die al op een kennispagina staat blijft A', () => {
    const info = stat('welke maat hockeystick', 20, 9, [['/kennis/hockeystick-lengte-tabel', 20]]);
    expect(decide({ now: info, before: undefined, long: undefined, offer: article('/kennis/hockeystick-lengte-tabel') }).code).toBe('A');
  });
  it('hoge positie met bijna geen kliks geeft A; een goede uitslag geen actie', () => {
    const lowCtr = stat('osaka hockeystick', 50, 2, [['/sticks/demo', 50]], 0);
    expect(decide({ now: lowCtr, before: undefined, long: undefined, offer: stick }).code).toBe('A');
    const fine = stat('osaka hockeystick', 50, 2, [['/sticks/demo', 50]], 12);
    expect(decide({ now: fine, before: undefined, long: undefined, offer: stick }).reden).toBe(NO_ACTION_REASON);
  });
});

describe('confidenceOf', () => {
  it('hoog vraagt veel vertoningen en een vergelijkbare vorige periode', () => {
    const big = stat('a', 40, 5, []);
    expect(confidenceOf(big, stat('a', 12, 5, []))).toBe('hoog');
    expect(confidenceOf(big, undefined)).toBe('middel');
    expect(confidenceOf(stat('a', 15, 5, []), stat('a', 12, 5, []))).toBe('middel');
    expect(confidenceOf(stat('a', 15, 5, []), undefined)).toBe('laag');
  });
});

describe('analyse', () => {
  const period = { start: '2026-11-01', end: '2026-11-28' };
  const previousPeriod = { start: '2026-10-04', end: '2026-10-31' };
  const offers: Record<string, OfferMatch> = {
    'osaka hockeystick': stick,
    'grays hockeystick': stick,
    'welke maat hockeystick': article('/kennis/hockeystick-lengte-tabel'),
    'hockeystick kind': { kind: 'tool', path: '/stickwijzer' },
    'hockeystick sinterklaas': none,
    'nike hockeystick kopen': none,
    'hockeystick maat 51': none,
  };
  const run = (overrides: Partial<Parameters<typeof analyse>[0]> = {}) =>
    analyse({
      month: '2026-12',
      now: new Date('2026-12-07T06:00:00Z'),
      period,
      previousPeriod,
      current: [
        row('jouwhockeystick', '/', 20, 60, 1),
        row('indian maharadja hockeystick', '/merken/osaka', 0, 25, 14),
        row('princess hockeystick', '/merken/osaka', 1, 30, 9),
        row('osaka hockeystick', '/sticks/demo', 0, 90, 9),
        row('grays hockeystick', '/sticks/demo-2', 8, 70, 2),
        row('welke maat hockeystick', '/sticks', 1, 40, 11),
        row('hockeystick kind', '/', 0, 33, 12),
        row('hockeystick sinterklaas', '/', 0, 55, 30),
        row('nike hockeystick kopen', '/', 0, 22, 25),
        row('hockeystick maat 51', '/', 0, 18, 15),
        row('zeldzame zoekterm', '/', 0, 2, 40),
      ],
      previous: [row('osaka hockeystick', '/sticks/demo', 4, 80, 4)],
      long: [],
      offerOf: (query) => offers[query] ?? none,
      ...overrides,
    });

  it('geeft hooguit vijf aanbevelingen en drie bewust-niet, en past in het schema', () => {
    const report = run();
    expect(SeoReport.safeParse(report).success).toBe(true);
    expect(report.aanbevelingen.length).toBeLessThanOrEqual(5);
    expect(report.bewustNiet.length).toBeLessThanOrEqual(3);
    expect(report.regelset).toBe('seo-kansen-v1');
    expect(report.land).toBe('nld');
  });
  it('scheidt eigen naam, merkwoorden en niet-merk, en telt rijen met te weinig data apart', () => {
    const { samenvatting } = run();
    expect(samenvatting.eigen.zoektermen).toBe(1);
    expect(samenvatting.merkwoorden.zoektermen).toBe(2);
    expect(samenvatting.nietMerk.zoektermen).toBe(8);
    expect(samenvatting.onvoldoende).toBe(1);
  });
  it('houdt merkwoorden uit de aanbevelingen en toont ze apart', () => {
    const report = run();
    const used = report.aanbevelingen.flatMap((r) => r.zoektermen);
    expect(used.some((q) => q.includes('indian') || q.includes('princess') || q.includes('jouwhockeystick'))).toBe(false);
    expect(report.merkwoorden.map((w) => w.zoekterm)).toEqual(['princess hockeystick', 'indian maharadja hockeystick']);
  });
  it('geeft de verslechterde pagina A en laat nieuwe kennis (C) na de bestaande pagina\'s komen', () => {
    const report = run();
    const codes = report.aanbevelingen.map((r) => r.code);
    expect(codes).toContain('A');
    expect(codes).toContain('C');
    expect(codes.indexOf('A')).toBeLessThan(codes.indexOf('C'));
    const osaka = report.aanbevelingen.find((r) => r.zoektermen.includes('osaka hockeystick'));
    expect(osaka?.reden).toContain('verslechterd');
  });
  it('zet buiten-aanbod-zoekopdrachten bij "bewust niet" met een reden', () => {
    const report = run();
    expect(report.bewustNiet.map((s) => s.zoekterm)).toContain('hockeystick sinterklaas');
    expect(report.bewustNiet.every((s) => s.reden.length > 10)).toBe(true);
  });
  it('houdt cijfers uit de redenen: die tekst kan in een openbaar issue', () => {
    for (const rec of run().aanbevelingen) {
      expect(rec.reden).not.toMatch(/\d/);
      expect(ACTION_LABELS[rec.code]).toBeTruthy();
    }
  });
  it('is deterministisch: dezelfde invoer geeft hetzelfde resultaat', () => {
    expect(run()).toEqual(run());
  });
  it('geeft bij te weinig data geen aanbevelingen, maar een telling', () => {
    const report = run({ current: [row('osaka hockeystick', '/sticks/demo', 0, 3, 9)], previous: [] });
    expect(report.aanbevelingen).toEqual([]);
    expect(report.samenvatting.onvoldoende).toBe(1);
  });
  it('noemt het seizoen: vertoningen worden niet los beoordeeld', () => {
    expect(run().seizoenNotitie).toContain('de positie de hoofdmaat');
  });
});

describe('nextHistory', () => {
  const entry = { id: 'a', code: 'A', pagina: '/x', zoekterm: 'q', basislijn: { positie: 5, vertoningen: 10, klikken: 1 } };
  it('vervangt dezelfde maand en bewaart de laatste twaalf', () => {
    const months = Array.from({ length: 13 }, (_, i) => ({ maand: `2026-${String(i + 1).padStart(2, '0')}`, aanbevelingen: [entry] }));
    const merged = nextHistory(months.slice(0, 12), '2027-01', []);
    expect(merged).toHaveLength(12);
    expect(merged.at(-1)?.maand).toBe('2027-01');
    const again = nextHistory(merged, '2027-01', []);
    expect(again.filter((m) => m.maand === '2027-01')).toHaveLength(1);
  });
});

describe('statusLine en script', () => {
  it('de statusregel bevat geen cijfers behalve de maand', () => {
    const report = analyse({
      month: '2026-12',
      now: new Date('2026-12-07T06:00:00Z'),
      period: { start: '2026-11-01', end: '2026-11-28' },
      previousPeriod: { start: '2026-10-04', end: '2026-10-31' },
      current: [row('osaka hockeystick', '/sticks/demo', 0, 90, 9)],
      previous: [],
      long: [],
      offerOf: () => stick,
    });
    const line = statusLine(report);
    expect(line.replace(report.maand, '')).not.toMatch(/\d/);
    expect(line).not.toContain('osaka');
  });
  it('het script schrijft alleen via de statusregel en nooit via console', () => {
    const source = readFileSync(new URL('../../scripts/seo-opportunities.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(/console\.(log|error|warn|info|debug)/);
    expect(source).not.toContain('JSON.stringify(report');
    expect(source).toContain('statusLine(');
  });
});
