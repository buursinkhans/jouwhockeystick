import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { dueForEvaluation, outcomeOf, type Due } from './evaluate';
import {
  clickShare,
  FUNNEL_LIST_MAX,
  FUNNEL_MIN_VISITORS,
  figuresOfPage,
  funnelFromRows,
  funnelQuery,
  funnelVerdict,
  type Funnel,
} from './funnel';
import { LIVE_VISITORS } from '../analytics-report/hogql';
import { VISITOR } from '../analytics-report/visitorFilter';
import { analyse, nextHistory, SeoReport, type HistoryMonth, type OfferMatch } from './opportunities';

// DEMO — GEEN WERKELIJKE DATA: every figure below is synthetic.
const period = { start: '2026-11-01', end: '2026-11-28' };
const filters = { visitors: LIVE_VISITORS };

describe('funnelQuery', () => {
  const query = funnelQuery(period, filters);
  it('telt bezoekers uit Google zonder campagne die dezelfde dag naar een winkel klikten, per landingspagina', () => {
    expect(query).toContain("event = '$pageview'");
    expect(query).toContain("event = 'retailer_click'");
    expect(query).toContain("ref LIKE '%google.%'");
    expect(query).toContain("campaign = ''");
    expect(query).toContain('GROUP BY distinct_id, d');
    expect(query).toContain('GROUP BY landing');
  });
  it('gebruikt Amsterdamse dagen en begint op de eerste en eindigt na de laatste dag van de periode', () => {
    expect(query).toContain("toDateTime('2026-11-01 00:00:00', 'Europe/Amsterdam')");
    expect(query).toContain("toDateTime('2026-11-29 00:00:00', 'Europe/Amsterdam')");
  });
  it('telt alleen de live site en geen bots, en sluit de eigen site als herkomst uit', () => {
    expect(query).toContain("properties.$host IN ('jouwhockeystick.nl', 'www.jouwhockeystick.nl')");
    expect(query).toContain(VISITOR);
    expect(query).toContain("ref NOT LIKE '%jouwhockeystick%'");
  });
  it('beperkt zich op verzoek tot één pagina, met en zonder slash achter het pad', () => {
    expect(funnelQuery(period, filters, '/sticks/demo')).toContain("landing IN ('/sticks/demo', '/sticks/demo/')");
    expect(query).not.toContain('landing IN');
  });
  it('maakt een aanhalingsteken in een pad onschadelijk', () => {
    expect(funnelQuery(period, filters, "/x'; DROP")).toContain("'/x\\'; DROP'");
  });
});

describe('funnelFromRows', () => {
  const rows: unknown[][] = [
    ['/sticks/demo', 40, 6],
    ['/sticks/demo/', 10, 1],
    ['/', 100, 4],
    ['/kennis/a', 3, 1],
    ['', 5, 5],
    ['/sticks/demo?x=1', 2, 0],
  ];
  const funnel = funnelFromRows(rows, period);
  it('voegt een pagina met en zonder slash of zoekopdracht samen', () => {
    expect(funnel.paginas.find((p) => p.pagina === '/sticks/demo')).toEqual({ pagina: '/sticks/demo', bezoekers: 52, klikkers: 7 });
  });
  it('telt het totaal over alle pagina\'s, ook die te klein zijn voor de lijst, en slaat een rij zonder pad over', () => {
    expect(funnel.totaal).toEqual({ bezoekers: 155, klikkers: 12 });
  });
  it('toont alleen pagina\'s met genoeg bezoekers, de drukste eerst', () => {
    expect(funnel.paginas.map((p) => p.pagina)).toEqual(['/', '/sticks/demo']);
  });
  it('houdt de lijst op het maximum en is een geldig deel van het rapport', () => {
    const many = Array.from({ length: 40 }, (_, i) => [`/p${i}`, 10 + i, 1]);
    expect(funnelFromRows(many, period).paginas).toHaveLength(FUNNEL_LIST_MAX);
    expect(SeoReport.shape.funnel.safeParse(funnel).success).toBe(true);
  });
  it('leest tekst als getal en laat een lege uitkomst leeg', () => {
    expect(funnelFromRows([['/a', '30', '3']], period).totaal).toEqual({ bezoekers: 30, klikkers: 3 });
    expect(funnelFromRows([], period)).toEqual({ periode: period, totaal: { bezoekers: 0, klikkers: 0 }, paginas: [] });
  });
});

describe('funnelVerdict', () => {
  const before = { bezoekers: 100, klikkers: 6 }; // 6 percent
  it('verbeterd bij minstens 2 procentpunt en een kwart meer', () => {
    expect(funnelVerdict(before, { bezoekers: 100, klikkers: 9 }).oordeel).toBe('verbeterd');
  });
  it('verslechterd bij minstens 2 procentpunt en een kwart minder', () => {
    expect(funnelVerdict({ bezoekers: 100, klikkers: 12 }, { bezoekers: 100, klikkers: 6 }).oordeel).toBe('verslechterd');
  });
  it('gelijk bij een klein verschil, ook als dat relatief groot is', () => {
    expect(funnelVerdict(before, { bezoekers: 100, klikkers: 7 }).oordeel).toBe('gelijk');
    expect(funnelVerdict({ bezoekers: 100, klikkers: 1 }, { bezoekers: 100, klikkers: 2 }).oordeel).toBe('gelijk'); // +1 point: too small
  });
  it('onvoldoende data bij te weinig bezoekers voor of na, of zonder cijfers', () => {
    expect(FUNNEL_MIN_VISITORS).toBe(20);
    expect(funnelVerdict(before, { bezoekers: 19, klikkers: 9 }).oordeel).toBe('onvoldoende data');
    expect(funnelVerdict({ bezoekers: 5, klikkers: 1 }, { bezoekers: 100, klikkers: 9 }).oordeel).toBe('onvoldoende data');
    expect(funnelVerdict(undefined, { bezoekers: 100, klikkers: 9 }).oordeel).toBe('onvoldoende data');
    expect(funnelVerdict(before, null).oordeel).toBe('onvoldoende data');
  });
  it('zegt dat het een richting is en dat een winkelklik geen bestelling is', () => {
    const text = funnelVerdict(before, { bezoekers: 100, klikkers: 9 }).toelichting;
    expect(text).toContain('geen bewijs');
    expect(text).toContain('geen bestelling');
  });
  it('de klikverhouding is klikkers gedeeld door bezoekers', () => {
    expect(clickShare({ bezoekers: 200, klikkers: 10 })).toBe(0.05);
    expect(clickShare({ bezoekers: 0, klikkers: 0 })).toBe(0);
  });
});

describe('figuresOfPage', () => {
  const funnel: Funnel = { periode: period, totaal: { bezoekers: 60, klikkers: 6 }, paginas: [{ pagina: '/sticks/demo', bezoekers: 60, klikkers: 6 }] };
  it('vindt een pagina, ook met een slash erachter, en geeft null voor een onbekende pagina of zonder funnel', () => {
    expect(figuresOfPage(funnel, '/sticks/demo')).toEqual({ bezoekers: 60, klikkers: 6 });
    expect(figuresOfPage(funnel, '/sticks/demo/')?.bezoekers).toBe(60);
    expect(figuresOfPage(funnel, '/sticks/andere')).toBeNull();
    expect(figuresOfPage(null, '/sticks/demo')).toBeNull();
  });
});

describe('actie D wordt gemeten op de funnel', () => {
  const stick: OfferMatch = { kind: 'stick', path: '/sticks/demo' };
  const funnel: Funnel = { periode: period, totaal: { bezoekers: 200, klikkers: 14 }, paginas: [{ pagina: '/blog/iets', bezoekers: 120, klikkers: 6 }] };
  const report = analyse({
    month: '2026-12',
    now: new Date('2026-12-07T06:00:00Z'),
    period,
    previousPeriod: { start: '2026-10-04', end: '2026-10-31' },
    current: [{ query: 'hockeystick kopen', page: 'https://jouwhockeystick.nl/blog/iets', clicks: 1, impressions: 90, position: 9 }],
    previous: [],
    long: [],
    offerOf: () => ({ kind: 'categorie', path: '/sticks' }),
    funnel,
  });
  it('zet de funnel van de pagina bij een D-aanbeveling en de funnel in het rapport', () => {
    const d = report.aanbevelingen.find((r) => r.code === 'D');
    expect(d?.funnel).toEqual({ bezoekers: 120, klikkers: 6 });
    expect(report.funnel?.totaal).toEqual({ bezoekers: 200, klikkers: 14 });
    expect(SeoReport.safeParse(report).success).toBe(true);
  });
  it('de basislijn gaat mee in de historie en in de lijst van wat gemeten moet worden', () => {
    const entry = report.historie[0]?.aanbevelingen.find((a) => a.code === 'D');
    expect(entry?.funnelBasislijn).toBeTruthy();
    const due = dueForEvaluation(report.historie, [{ id: entry?.id ?? '', status: 'uitgevoerd', uitgevoerdOp: '2026-12-10' }], '2027-02-01');
    expect(due[0]?.funnelBasislijn?.bezoekers).toBe(120);
  });
  it('zonder funnel heeft een D-aanbeveling geen basislijn en wordt hij later niet gemeten', () => {
    const none = analyse({ month: '2026-12', now: new Date('2026-12-07T06:00:00Z'), period, previousPeriod: { start: '2026-10-04', end: '2026-10-31' }, current: [{ query: 'hockeystick kopen', page: 'https://jouwhockeystick.nl/blog/iets', clicks: 1, impressions: 90, position: 9 }], previous: [], long: [], offerOf: () => stick });
    expect(none.funnel).toBeUndefined();
    expect(none.aanbevelingen.every((r) => r.funnel === undefined)).toBe(true);
  });
  const due = (funnelBasislijn?: { bezoekers: number; klikkers: number }): Due => ({
    id: 'd1',
    month: '2026-12',
    code: 'D',
    zoekterm: 'hockeystick kopen',
    pagina: '/blog/iets',
    basislijn: { positie: 9, vertoningen: 90, klikken: 1 },
    uitgevoerdOp: '2026-12-10',
    window: { start: '2026-12-11', end: '2027-01-07' },
    ...(funnelBasislijn && { funnelBasislijn }),
  });
  it('oordeelt op de doorklik: meer klikkers is verbeterd', () => {
    const outcome = outcomeOf(due({ bezoekers: 100, klikkers: 5 }), { positie: 8, vertoningen: 80, klikken: 2 }, { bezoekers: 100, klikkers: 9 });
    expect(outcome.oordeel).toBe('verbeterd');
    expect(outcome.funnelNa).toEqual({ bezoekers: 100, klikkers: 9 });
  });
  it('is "niet gemeten" als PostHog niets gaf of de basislijn ontbreekt, met de reden in woorden', () => {
    expect(outcomeOf(due({ bezoekers: 100, klikkers: 5 }), null, undefined).toelichting).toContain('PostHog gaf deze maand geen cijfers');
    expect(outcomeOf(due(), null, { bezoekers: 100, klikkers: 9 }).toelichting).toContain('niet vastgelegd');
    expect(outcomeOf(due(), null, { bezoekers: 100, klikkers: 9 }).oordeel).toBe('niet gemeten');
  });
  it('geeft onvoldoende data bij weinig bezoekers na de wijziging', () => {
    expect(outcomeOf(due({ bezoekers: 100, klikkers: 5 }), null, { bezoekers: 4, klikkers: 3 }).oordeel).toBe('onvoldoende data');
  });
  it('nextHistory neemt de funnel-basislijn alleen over als die er is', () => {
    const rec = report.aanbevelingen.find((r) => r.code === 'D');
    const plain = nextHistory([], '2027-01', rec ? [{ ...rec, funnel: undefined }] : []);
    expect(plain[0]?.aanbevelingen[0]?.funnelBasislijn).toBeUndefined();
    const history: HistoryMonth[] = nextHistory([], '2027-01', rec ? [rec] : []);
    expect(history[0]?.aanbevelingen[0]?.funnelBasislijn).toBeTruthy();
  });
});

describe('het script en de workflow', () => {
  const script = readFileSync('scripts/seo-opportunities.ts', 'utf8');
  it('drukt geen foutmelding of zoekopdracht van PostHog af, alleen een vaste zin', () => {
    expect(script).toContain("say('PostHog gaf geen cijfers: de organische funnel is deze maand overgeslagen.')");
    const funnelPart = script.slice(script.indexOf('async function organicFunnel'), script.indexOf('// ---------------------------------------------------------------- GitHub'));
    expect(funnelPart).toContain('catch {');
    expect(funnelPart).not.toMatch(/catch \((e|error)/);
  });
  it('de workflow geeft alleen de leessleutel van PostHog door, zoals de dagcijfers', () => {
    const workflow = readFileSync('.github/workflows/seo-kansen.yml', 'utf8');
    expect(workflow).toContain('POSTHOG_PERSONAL_API_KEY: ${{ secrets.POSTHOG_PERSONAL_API_KEY }}');
    expect(workflow).toContain('POSTHOG_PROJECT_ID: ${{ vars.POSTHOG_PROJECT_ID }}');
  });
});
