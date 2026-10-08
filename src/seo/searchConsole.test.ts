import { describe, expect, it } from 'vitest';
import {
  formatReport,
  lowCtr,
  nearPageOne,
  newQueries,
  pages,
  totals,
  type SearchRow,
} from './searchConsole';

const row = (overrides: Partial<SearchRow>): SearchRow => ({
  query: 'hockeystick',
  page: 'https://jouwhockeystick.nl/',
  clicks: 0,
  impressions: 10,
  position: 8,
  ...overrides,
});

describe('totals', () => {
  it('weights the average position by impressions', () => {
    const result = totals([
      row({ impressions: 30, position: 2, clicks: 3 }),
      row({ impressions: 10, position: 10, clicks: 1 }),
    ]);
    expect(result.clicks).toBe(4);
    expect(result.impressions).toBe(40);
    expect(result.ctr).toBeCloseTo(0.1);
    expect(result.position).toBeCloseTo(4);
  });

  it('handles an empty period', () => {
    expect(totals([])).toEqual({ clicks: 0, impressions: 0, ctr: 0, position: 0 });
  });
});

describe('nearPageOne', () => {
  it('keeps positions 5–20 with enough impressions, most impressions first', () => {
    const result = nearPageOne([
      row({ query: 'top', position: 2 }),
      row({ query: 'near', position: 7, impressions: 50 }),
      row({ query: 'nearer', position: 12, impressions: 80 }),
      row({ query: 'far', position: 35 }),
      row({ query: 'rare', position: 9, impressions: 1 }),
    ]);
    expect(result.map((r) => r.query)).toEqual(['nearer', 'near']);
  });
});

describe('lowCtr', () => {
  it('flags top-5 queries that are seen but hardly clicked', () => {
    const result = lowCtr([
      row({ query: 'ignored', position: 3, impressions: 100, clicks: 0 }),
      row({ query: 'fine', position: 3, impressions: 100, clicks: 10 }),
      row({ query: 'too few', position: 3, impressions: 5, clicks: 0 }),
      row({ query: 'too low', position: 9, impressions: 100, clicks: 0 }),
    ]);
    expect(result.map((r) => r.query)).toEqual(['ignored']);
  });
});

describe('newQueries', () => {
  it('lists queries without impressions in the previous period', () => {
    const result = newQueries(
      [row({ query: 'oud' }), row({ query: 'nieuw' })],
      [row({ query: 'oud' })],
    );
    expect(result.map((r) => r.query)).toEqual(['nieuw']);
  });
});

describe('pages', () => {
  it('sums rows per page and keeps the previous impressions', () => {
    const page = 'https://jouwhockeystick.nl/sticks/grays-jb6-composite';
    const [summary] = pages(
      [row({ page, impressions: 5, clicks: 1 }), row({ page, impressions: 7 })],
      [row({ page, impressions: 4 })],
    );
    expect(summary).toEqual({ page, clicks: 1, impressions: 12, previousImpressions: 4 });
  });
});

describe('formatReport', () => {
  it('writes a Dutch report with stick pages as paths', () => {
    const report = formatReport({
      siteUrl: 'sc-domain:jouwhockeystick.nl',
      current: { start: '2026-09-08', end: '2026-10-05' },
      previous: { start: '2026-08-11', end: '2026-09-07' },
      currentRows: [
        row({
          query: 'grays jb6',
          page: 'https://jouwhockeystick.nl/sticks/grays-jb6-composite',
          position: 11,
        }),
      ],
      previousRows: [],
      currentPages: [
        row({
          query: '',
          page: 'https://jouwhockeystick.nl/sticks/grays-jb6-composite',
          impressions: 25,
          position: 11,
        }),
      ],
      previousPages: [],
    });
    expect(report).toContain('## Bijna pagina 1');
    expect(report).toContain('| grays jb6 | /sticks/grays-jb6-composite |');
    expect(report).toContain('Vertoningen | 25 | 0 | nieuw');
    expect(report).toContain('15 vertoningen komen van zeldzame zoekwoorden');
  });
});

describe('formatReport without data', () => {
  it('explains what to check when Google shows no impressions yet', () => {
    const report = formatReport({
      siteUrl: 'sc-domain:jouwhockeystick.nl',
      current: { start: '2026-09-08', end: '2026-10-05' },
      previous: { start: '2026-08-11', end: '2026-09-07' },
      currentRows: [],
      previousRows: [],
      currentPages: [],
      previousPages: [],
    });
    expect(report).toContain('Nog geen vertoningen in Google');
  });
});
