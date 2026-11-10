import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { socialSection } from '@/analytics-report/conversion';
import { blackFriday, momentsOn, pushOn, seasonYear } from './calendar';
import { compareToAverage, kpis, weekComparison, type WeekNumbers } from './kpi';
import { foreignWords, loadSiteConfig, localize, market } from './siteConfig';
import { parseSiteConfig } from './siteConfigSchema';

const config = loadSiteConfig('jouwhockeystick');

describe('site configuration', () => {
  it('passes the schema', () => {
    expect(() => parseSiteConfig(config)).not.toThrow();
  });

  it('refuses an unknown pillar or a rhythm that does not add up', () => {
    const bad = structuredClone(config);
    bad.markten[0]!.kalender[0]!.pijler = 'onbekend';
    expect(() => parseSiteConfig(bad)).toThrow(/Onbekende pijler/);
    const bad2 = structuredClone(config);
    bad2.ritme.posts = 3;
    expect(() => parseSiteConfig(bad2)).toThrow(/ritme/);
  });

  it('keeps Flanders off until the owner confirms (decision 2026-11-10)', () => {
    expect(market(config, 'BE').actief).toBe(false);
    expect(market(config, 'NL').actief).toBe(true);
  });
});

describe('Flemish word list', () => {
  const be = market(config, 'BE');
  it('localises whole words, longer ones first, keeping the capital', () => {
    expect(localize('Zaalhockey met je zaalstick. Contributie betalen voor JO12.', be)).toBe('Indoorhockey met je indoorstick. Lidgeld betalen voor U12.');
    expect(localize('Zaalseizoen begint', be)).toBe('Indoorseizoen begint');
  });
  it('finds home-market words left in a Flemish text', () => {
    expect(foreignWords('Kies je zaalstick, de contributie is laag.', be)).toEqual(['zaalstick', 'contributie']);
    expect(foreignWords('Kies je indoorstick.', be)).toEqual([]);
  });
});

describe('calendar from the configuration', () => {
  const nl = market(config, 'NL');
  const be = market(config, 'BE');
  it('finds Black Friday as the day after the fourth Thursday of November', () => {
    expect(blackFriday(2026)).toBe('2026-11-27');
    expect(blackFriday(2027)).toBe('2027-11-26');
    expect(blackFriday(2025)).toBe('2025-11-28');
  });
  it('starts a season year in the configured month', () => {
    expect(seasonYear('2026-08-01', config.seizoenStart)).toBe(2026);
    expect(seasonYear('2027-02-10', config.seizoenStart)).toBe(2026);
  });
  it('names the season per market and puts Sinterklaas on the right day', () => {
    expect(momentsOn('2026-11-20', nl, 8).map((m) => m.naam)).toEqual(['Zaalseizoen', 'Black Friday', 'Sinterklaas (pakjesavond 5 december)']);
    expect(momentsOn('2026-11-20', be, 8).map((m) => m.naam)).toContain('Indoorseizoen');
    expect(momentsOn('2026-12-06', nl, 8).map((m) => m.id)).not.toContain('sinterklaas');
    expect(momentsOn('2026-12-06', be, 8).map((m) => m.id)).toContain('sinterklaas');
  });
  it('runs a moment through the end of February, also in a leap year, and across the new year', () => {
    expect(momentsOn('2028-02-29', nl, 8).map((m) => m.id)).toContain('zaalseizoen');
    expect(momentsOn('2027-01-15', nl, 8).map((m) => m.id)).toContain('zaalseizoen');
    expect(momentsOn('2027-03-01', nl, 8).map((m) => m.id)).not.toContain('zaalseizoen');
  });
  it('knows the Push blocks per market, and Pulse in between', () => {
    expect(pushOn('2026-11-20', nl, 8)?.vervolgstap).toBe('Kies je zaalstick');
    expect(pushOn('2026-11-20', be, 8)?.vervolgstap).toBe('Kies je indoorstick');
    expect(pushOn('2027-08-20', nl, 8)?.id).toBe('veld-push');
    expect(pushOn('2027-01-10', nl, 8)).toBeNull();
  });
});

describe('KPIs', () => {
  const w = (o: Partial<WeekNumbers> = {}): WeekNumbers => ({
    week: '2026-W47', markt: 'NL', bereik: 2000, bewaard: 30, gedeeld: 10, sitebezoekSocial: 40, noordsterSocial: 12,
    winkelkliks: 6, bestellingen: 1, blijvenPerHook: { vraag: { posts: 2, blijven: 0.42 }, getal: { posts: 1, blijven: 0.51 } },
    gepland: 4, ritme: 4, tegoedGebruikt: 9, tegoedGrens: 20, fouten: 0, uurTotGoedkeuring: 20, ...o,
  });

  it('computes the north star, the funnel per 1,000 reach, learning and health', () => {
    const k = kpis(w());
    expect(k.noordster).toBe(12);
    expect(k.trechter).toEqual({ bereik: 2000, bewaardPer1000: 15, gedeeldPer1000: 5, sitebezoek: 40, winkelkliks: 6, bestellingen: 1 });
    expect(k.leren.map((l) => l.hook)).toEqual(['getal', 'vraag']);
    expect(k.gezondheid.tegoed).toBe('9 van 20');
    expect(kpis(w({ bereik: 0 })).trechter.bewaardPer1000).toBeNull();
  });

  it('compares with the average of the 4 weeks before, without targets', () => {
    expect(compareToAverage(12, [8, 10, 12, 10])).toEqual({ waarde: 12, gemiddelde4: 10, verschilPct: 20 });
    expect(compareToAverage(5, [])).toEqual({ waarde: 5, gemiddelde4: null, verschilPct: null });
    const cmp = weekComparison([kpis(w({ noordsterSocial: 10 })), kpis(w({ noordsterSocial: 6 })), kpis(w())], config.noordster.naam);
    expect(cmp['Stickwijzer-starts uit social']).toEqual({ waarde: 12, gemiddelde4: 8, verschilPct: 50 });
  });

  it('shows the social starts in the Conversie report, without the rest of the traffic', () => {
    expect(socialSection(undefined)).toEqual(['_PostHog kon dit deze week niet beantwoorden._']);
    const lines = socialSection([{ key: 'instagram', now: 5, before: 3 }, { key: '', now: 40, before: 38 }]).join('\n');
    expect(lines).toContain('instagram');
    expect(lines).toContain('Totaal');
    expect(lines).not.toContain('| 40');
  });
});

describe('the engine is site-neutral', () => {
  // The engine reads everything about a site from marketing/sites/<site>.json.
  const ENGINE = ['calendar.ts', 'research.ts', 'learning.ts', 'abtest.ts', 'metricoolBudget.ts', 'voorstellenIssue.ts', 'kpi.ts', 'siteConfig.ts', 'siteConfigSchema.ts', 'editorCheck.ts', 'bingReport.ts'];
  it.each(ENGINE)('%s holds no words of this site\'s subject', (file) => {
    const text = readFileSync(join(process.cwd(), 'src/marketing', file), 'utf8');
    expect(text.match(/stick|zaal|bow|hockey/gi) ?? []).toEqual([]);
  });
});
