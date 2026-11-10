import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buckets,
  dayRows,
  formatBingReport,
  growing,
  isoWeek,
  lastWeek,
  redact,
  registeredSite,
  SitesAnswer,
  StatsAnswer,
  statRows,
  top,
  TrafficAnswer,
  trafficTotals,
  weightedPosition,
  type ReportInput,
} from './bingReport';

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(join(process.cwd(), 'src/marketing/__fixtures__', `bing-${name}.json`), 'utf8'));

const sites = SitesAnswer.parse(fixture('sites'));
const queries = statRows(StatsAnswer.parse(fixture('queries')));
const pages = statRows(StatsAnswer.parse(fixture('pages')));
const traffic = dayRows(TrafficAnswer.parse(fixture('traffic')));

const input = (o: Partial<ReportInput> = {}): ReportInput => ({
  ...lastWeek('2026-11-16'),
  site: 'https://jouwhockeystick.nl/',
  traffic: { ok: true, value: traffic },
  queries: { ok: true, value: queries },
  pages: { ok: true, value: pages },
  aiNagekeken: '2026-11-10',
  ...o,
});

describe('Bing API answers', () => {
  it('reads Microsoft JSON dates, with and without a time zone', () => {
    expect(buckets(queries)).toEqual(['2026-11-13', '2026-11-06']);
    expect(queries.find((q) => q.key === 'kinderstick maat')?.date).toBe('2026-11-13');
  });
  it('treats a position of -1 or 0 as unknown', () => {
    expect(queries.find((q) => q.key === 'kinderstick maat')?.position).toBeNull();
  });
  it('refuses an answer of the wrong shape', () => {
    expect(StatsAnswer.safeParse({ d: [{ Query: 'x', Date: 'gisteren', Clicks: 1, Impressions: 2 }] }).success).toBe(false);
    expect(TrafficAnswer.safeParse({ results: [] }).success).toBe(false);
  });
  it('finds the registered site url, whatever the scheme, www or slash', () => {
    expect(registeredSite(sites, 'jouwhockeystick.nl')).toBe('https://jouwhockeystick.nl/');
    expect(registeredSite(sites, 'https://www.jouwhockeystick.nl')).toBe('https://jouwhockeystick.nl/');
    expect(registeredSite(sites, 'andere-site.nl')).toBeNull();
  });
});

describe('weeks', () => {
  it('takes the last complete Monday-to-Sunday week', () => {
    expect(lastWeek('2026-11-16')).toEqual({ week: '2026-W46', van: '2026-11-09', tot: '2026-11-15' });
    expect(lastWeek('2026-11-15')).toEqual({ week: '2026-W45', van: '2026-11-02', tot: '2026-11-08' });
  });
  it('numbers ISO weeks across the new year', () => {
    expect(isoWeek('2027-01-01')).toBe('2026-W53');
    expect(isoWeek('2026-01-01')).toBe('2026-W01');
  });
});

describe('numbers', () => {
  it('adds up clicks and impressions per week, and has no week without days', () => {
    expect(trafficTotals(traffic, '2026-11-09', '2026-11-15')).toEqual({ clicks: 8, impressions: 189, ctr: 8 / 189 });
    expect(trafficTotals(traffic, '2026-11-02', '2026-11-08')?.impressions).toBe(140);
    expect(trafficTotals(traffic, '2027-01-04', '2027-01-10')).toBeNull();
  });
  it('weights the position by impressions and leaves out unknown positions', () => {
    expect(weightedPosition(queries, '2026-11-13')).toBeCloseTo(556.5 / 79, 5);
  });
  it('ranks the top by clicks, then impressions', () => {
    expect(top(queries, '2026-11-13').map((x) => x.key)).toEqual(['hockeystick lengte', 'zaalhockey stick', 'low bow', 'kinderstick maat']);
    expect(top(pages, '2026-11-13', 1)).toHaveLength(1);
  });
  it('finds new and growing queries, and nothing without a week before', () => {
    expect(growing(queries, '2026-11-13', '2026-11-06')).toEqual([
      { key: 'zaalhockey stick', nu: 10, ervoor: 4, nieuw: false },
      { key: 'kinderstick maat', nu: 5, ervoor: 0, nieuw: true },
    ]);
    expect(growing(queries, '2026-11-13', null)).toEqual([]);
  });
});

describe('report', () => {
  it('shows the week next to the week before, the tops, the growth and the AI answer', () => {
    const md = formatBingReport(input());
    expect(md).toContain('# Bing-rapport 2026-W46');
    expect(md).toContain('| Kliks | 8 | 7 |');
    expect(md).toContain('| Vertoningen | 189 | 140 |');
    expect(md).toContain('| Gemiddelde positie | 7,0 |');
    expect(md).toContain('| zaalhockey stick | 10 | 4 | groeit |');
    expect(md).toContain('| kinderstick maat | 5 | 0 | nieuw |');
    expect(md).toContain('https://jouwhockeystick.nl/kennis/lengte');
    expect(md).toContain('niet via de Bing Webmaster API te lezen');
    expect(md).toMatch(/<!-- bingcijfers \{"week":"2026-W46","kliks":8,"vertoningen":189,"groei":\["zaalhockey stick","kinderstick maat"\]\} -->$/);
  });

  it('shows missing data as "ontbreekt", never as zero', () => {
    const md = formatBingReport(input({ site: null, traffic: { ok: false, reden: 'GetRankAndTrafficStats gaf HTTP 400: InvalidApiKey.' }, queries: { ok: false, reden: 'x' }, pages: { ok: false, reden: 'y' } }));
    expect(md).toContain('| Kliks | ontbreekt | ontbreekt |');
    expect(md).toContain('| Gemiddelde positie | ontbreekt | ontbreekt |');
    expect(md).toContain('Site in Bing Webmaster Tools: ontbreekt');
    expect(md).not.toMatch(/\| 0 \|/);
    expect(md).toContain('"kliks":null');
  });

  it('says so when there is no week before to compare with', () => {
    const one = queries.filter((q) => q.date === '2026-11-13');
    expect(formatBingReport(input({ queries: { ok: true, value: one } }))).toContain('er is nog geen Bing-week ervoor');
  });

  it('keeps a pipe in a query from breaking the table', () => {
    const odd = [{ key: 'a|b', date: '2026-11-13', clicks: 1, impressions: 1, position: 1 }];
    expect(formatBingReport(input({ queries: { ok: true, value: odd } }))).toContain('| a\\|b |');
  });
});

describe('the key never leaks', () => {
  it('removes the key and any apikey parameter from a message', () => {
    expect(redact('GET https://ssl.bing.com/x?apikey=abc123&siteUrl=y failed', undefined)).toBe('GET https://ssl.bing.com/x?apikey=***&siteUrl=y failed');
    expect(redact('sleutel abc123 fout', 'abc123')).toBe('sleutel *** fout');
  });
  it('keeps the key out of the script: it reads only the environment and redacts every message', () => {
    const script = readFileSync(join(process.cwd(), 'scripts/bing-webmaster-report.ts'), 'utf8');
    expect(script).toContain('process.env.BING_WEBMASTER_API_KEY');
    expect(script).not.toMatch(/console\.(log|error)\(\s*e\b/);
    expect(script.match(/reden: [^\n]*\$\{/g)?.every((l) => l.includes('redact(') || !l.includes('e.message'))).toBe(true);
  });
});
