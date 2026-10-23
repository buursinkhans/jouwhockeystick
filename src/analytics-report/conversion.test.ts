import { describe, expect, it } from 'vitest';
import {
  formatReport,
  groupSources,
  routeFunnel,
  largestDropOff,
  questionDropOff,
  signals,
  type ConversionData,
  type Count,
} from './conversion';

const c = (key: string, now: number, before = 0): Count => ({ key, now, before });

function data(overrides: Partial<ConversionData> = {}): ConversionData {
  return {
    current: { start: '2026-10-06', end: '2026-10-12' },
    previous: { start: '2026-09-29', end: '2026-10-05' },
    events: [c('$pageview', 1000, 800), c('retailer_click', 30, 20)],
    funnel: [
      c('visitors', 400, 350),
      c('started', 100, 100),
      c('route', 90, 90),
      c('completed', 60, 60),
      c('clicked', 20, 15),
      c('clickers', 28, 20),
    ],
    questions: [c('age_band', 85), c('height_cm', 80), c('budget_band', 50)],
    adviceOutcomes: [c('match', 55), c('length', 5)],
    feedback: [],
    clicksByPlacement: [c('stickwijzer', 20), c('productpagina', 10)],
    clicksByLinkType: [c('product', 30)],
    clicksByRetailer: [],
    clicksByProduct: [],
    clicksByPage: [c('/stickwijzer', 20)],
    pageviewsByPage: [c('/', 400), c('/sticks/grays-db-5', 40)],
    homeBlocks: [],
    deadClicksByPage: [],
    questionsByRoute: [],
    adviceByRoute: [],
    visitorsByReferrer: [],
    deadClicksByElement: [],
    rageClicksByPage: [],
    otherHostEvents: 0,
    ...overrides,
  };
}

const ORDER = ['age_band', 'height_cm', 'budget_band'];

describe('questionDropOff', () => {
  it('compares each question with the step before, starting from the stickwijzer start', () => {
    const steps = questionDropOff(data(), ORDER);
    expect(steps.map((step) => step.fromPrevious)).toEqual([0.85, 80 / 85, 50 / 80]);
  });

  it('picks the largest drop among steps with enough answers', () => {
    expect(largestDropOff(questionDropOff(data(), ORDER))).toEqual({
      questionId: 'budget_band',
      lost: 1 - 50 / 80,
    });
  });

  it('ignores steps with too few answers', () => {
    const steps = questionDropOff(
      data({ funnel: [c('started', 9)], questions: [c('age_band', 2)] }),
      ['age_band'],
    );
    expect(largestDropOff(steps)).toBeNull();
  });
});

describe('signals', () => {
  it('reports the largest drop-off', () => {
    expect(signals(data(), ORDER).join('\n')).toContain('`budget_band`');
  });

  it('reports a falling completion rate', () => {
    const report = signals(
      data({ funnel: [c('started', 100, 100), c('completed', 40, 70)] }),
      ORDER,
    );
    expect(report.join('\n')).toContain('Minder bezoekers maken de stickwijzer af');
  });

  it('reports advice without a match as a possible catalog gap', () => {
    const report = signals(data({ adviceOutcomes: [c('match', 30), c('length', 10)] }), ORDER);
    expect(report.join('\n')).toContain('Adviezen zonder passende stick');
    expect(report.join('\n')).toContain('lengte (10)');
  });

  it('reports search links, dead clicks and stick pages without a click', () => {
    const report = signals(
      data({
        clicksByLinkType: [c('product', 28), c('search', 2)],
        deadClicksByPage: [c('/vergelijk', 7)],
      }),
      ORDER,
    ).join('\n');
    expect(report).toContain('zoekopdracht');
    expect(report).toContain('dead clicks op `/vergelijk`');
    expect(report).toContain('`/sticks/grays-db-5` is 40 keer bekeken');
  });

  it('stays quiet when nothing stands out', () => {
    const quiet = data({
      questions: [c('age_band', 95), c('height_cm', 92), c('budget_band', 90)],
      adviceOutcomes: [c('match', 60)],
      pageviewsByPage: [c('/', 400)],
    });
    expect(signals(quiet, ORDER)).toEqual([]);
  });
});

describe('routeFunnel', () => {
  it('shows per screen how many visitors of a route got through', () => {
    const funnel = routeFunnel(
      {
        questionsByRoute: [c('START|age_band', 10), c('START|has_current_stick', 8), c('START|budget_band', 4)],
        adviceByRoute: [c('START', 4)],
      },
      'START',
      [
        { title: 'Over de speler', questionId: 'age_band' },
        { title: 'Eerste stick of vervanging', questionId: 'has_current_stick' },
        { title: 'Budget', questionId: 'budget_band' },
      ],
    );
    expect(funnel.map((row) => row.now)).toEqual([10, 8, 4, 4]);
    expect(funnel[2]?.fromPrevious).toBe(0.5);
    expect(funnel.at(-1)?.title).toBe('Advies gekregen');
  });

  it('is left out of the report for a route nobody took', () => {
    const report = formatReport(data(), ORDER, { PRESTATIE: [{ title: 'Niveau en doelen', questionId: 'primary_goals' }] });
    expect(report).not.toContain('Route Prestatie');
  });
});

describe('groupSources', () => {
  it('groups referring domains into channels', () => {
    const grouped = groupSources([
      c('$direct', 20, 15),
      c('www.google.com', 2),
      c('www.google.nl', 1),
      c('utm:tiktok', 3),
      c('l.instagram.com', 2),
      c('chatgpt.com', 1),
      c('hockey.nl', 1),
    ]);
    expect(grouped[0]).toEqual({ key: 'Direct', now: 20, before: 15 });
    expect(grouped).toContainEqual({ key: 'Google', now: 3, before: 0 });
    expect(grouped).toContainEqual({ key: 'Social: tiktok', now: 3, before: 0 });
    expect(grouped).toContainEqual({ key: 'Social: instagram', now: 2, before: 0 });
    expect(grouped).toContainEqual({ key: 'AI-assistent', now: 1, before: 0 });
    expect(grouped).toContainEqual({ key: 'Andere site: hockey.nl', now: 1, before: 0 });
  });

  it('treats the short sources the apps add themselves as social', () => {
    const grouped = groupSources([
      c('utm:ig', 3),
      c('l.instagram.com', 2),
      c('utm:fb', 1),
      c('utm:yt', 1),
    ]);
    expect(grouped).toContainEqual({ key: 'Social: instagram', now: 5, before: 0 });
    expect(grouped).toContainEqual({ key: 'Social: facebook', now: 1, before: 0 });
    expect(grouped).toContainEqual({ key: 'Social: youtube', now: 1, before: 0 });
  });
});

describe('formatReport', () => {
  it('writes the sections and a low-data note', () => {
    const report = formatReport(
      data({ funnel: [c('visitors', 30), c('started', 5)], otherHostEvents: 12 }),
      ORDER,
    );
    expect(report).toContain('# Conversie-rapport');
    expect(report).toContain('## Stickwijzer-trechter');
    expect(report).toContain('Weinig data');
    expect(report).toContain('12 events van andere adressen');
  });

  it('shows clicks per shop and dead clicks per element', () => {
    const report = formatReport(
      data({
        clicksByRetailer: [c('bol.com', 6), c('PassaHockey', 4)],
        deadClicksByElement: [c('/ · li · "Binnen budget"', 9)],
      }),
      ORDER,
    );
    expect(report).toContain('## Kliks naar de winkels');
    expect(report).toContain('| PassaHockey | 4 |');
    expect(report).toContain('/ · li · "Binnen budget"');
    expect(report).not.toContain('Kliks naar bol.com');
  });

  it('escapes pipes in table cells', () => {
    const report = formatReport(data({ clicksByProduct: [c('Grays | DB 5', 3)] }), ORDER);
    expect(report).toContain('Grays \\| DB 5');
  });
});
