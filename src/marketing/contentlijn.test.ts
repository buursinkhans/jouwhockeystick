import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contentLine, lineUtm, missingPages, pickForSlot, planLine, seasonOn, sharesBefore, slotsFrom, type LineItem } from './contentlijn';
import { loadSiteConfig } from './siteConfig';
import { parseSiteConfig } from './siteConfigSchema';
import { socialUrl } from './utm';

const config = loadSiteConfig('jouwhockeystick');
const line = contentLine(config, 'welke-hockeystick-kopen');

/** Live paths from the repo: articles and blog posts by file name, plus the fixed routes the line uses. */
function livePages(): string[] {
  const root = process.cwd();
  const slugs = (dir: string) => readdirSync(join(root, dir)).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts')).map((f) => f.replace(/\.ts$/, ''));
  const routes = ['/stickwijzer', '/sticks', '/zaalsticks', '/methodiek'].filter((r) => existsSync(join(root, 'src/app', r.slice(1))));
  return [...slugs('src/content/articles').map((s) => `/kennis/${s}`), ...slugs('src/content/blogPosts').map((s) => `/blog/${s}`), ...routes];
}
const LIVE = livePages();

describe('content line in the site configuration', () => {
  it('has the nine sub-themes of the brief, each with a question', () => {
    expect(line.subthemas.map((s) => s.id)).toEqual(['lengte', 'beginners', 'kinderen', 'carbon', 'kromming', 'speelstijl', 'budget', 'vergelijken', 'veld-zaal']);
    for (const s of line.subthemas) expect(s.vraag).toMatch(/\?$/);
  });

  it('links only to pages that exist in the repo', () => {
    expect(missingPages(line, LIVE)).toEqual([]);
  });

  it('takes slots of the existing rhythm and adds none (decision 2026-11-15)', () => {
    expect(config.ritme.postdagen).toContain(line.slots.post);
    expect(config.ritme.videodagen).toContain(line.slots.video);
    expect(config.ritme).toEqual({ posts: 2, videos: 2, postdagen: ['di', 'do'], videodagen: ['wo', 'vr'] });
  });

  it('follows the Jouwhockeystick-methode: speler, stick, maat', () => {
    expect(line.methode.map((m) => m.id)).toEqual(['speler', 'stick', 'maat']);
  });

  it('covers every day of the year with exactly one season', () => {
    for (let d = Date.UTC(2027, 0, 1); d < Date.UTC(2028, 0, 1); d += 86_400_000) {
      const date = new Date(d).toISOString().slice(0, 10);
      expect(() => seasonOn(line, date)).not.toThrow();
      const md = date.slice(5);
      const hits = line.seizoenen.filter((s) => (s.van <= s.tot ? md >= s.van && md <= s.tot : md >= s.van || md <= s.tot));
      expect(hits).toHaveLength(1);
    }
  });

  it('starts with about 70% in the setting of the winter season', () => {
    expect(seasonOn(line, '2026-12-01').aandeel.zaal).toBe(0.7);
    expect(seasonOn(line, '2027-01-31').id).toBe('winter');
    expect(seasonOn(line, '2027-02-01').id).toBe('voorjaar');
  });

  it('refuses shares that do not add up, an unknown page setting or a slot outside the rhythm', () => {
    const bad = structuredClone(config);
    bad.contentlijnen[0]!.seizoenen[0]!.aandeel = { zaal: 0.7, veld: 0.7 };
    expect(() => parseSiteConfig(bad)).toThrow(/telt op tot/);
    const bad2 = structuredClone(config);
    bad2.contentlijnen[0]!.subthemas[0]!.paginas[0]!.omgeving = 'strand';
    expect(() => parseSiteConfig(bad2)).toThrow(/Onbekende omgeving/);
    const bad3 = structuredClone(config);
    bad3.contentlijnen[0]!.slots.post = 'za';
    expect(() => parseSiteConfig(bad3)).toThrow(/ritme/);
  });
});

describe('choosing a sub-theme for a slot', () => {
  it('picks the setting that lags its share, with a stressed sub-theme and a live page', () => {
    const pick = pickForSlot(line, { datum: '2026-12-01', soort: 'post' }, [], LIVE);
    expect(pick).toMatchObject({ omgeving: 'zaal', subthema: 'veld-zaal', pagina: '/kennis/veldstick-zaalhockey' });
  });

  it('never picks a page that is not live', () => {
    const pick = pickForSlot(line, { datum: '2026-12-01', soort: 'post' }, [], LIVE.filter((p) => p !== '/kennis/veldstick-zaalhockey'));
    expect('pagina' in pick && pick.pagina).not.toBe('/kennis/veldstick-zaalhockey');
  });

  it('rests a sub-theme 14 days and a page six weeks', () => {
    const history: LineItem[] = [{ datum: '2026-11-24', subthema: 'veld-zaal', pagina: '/kennis/veldstick-zaalhockey', omgeving: 'zaal' }];
    const pick = pickForSlot(line, { datum: '2026-12-01', soort: 'post' }, history, LIVE);
    expect('subthema' in pick && pick.subthema).not.toBe('veld-zaal');
    const later = pickForSlot(line, { datum: '2026-12-15', soort: 'post' }, history, LIVE);
    expect('pagina' in later && later.pagina).not.toBe('/kennis/veldstick-zaalhockey');
  });

  it('balances settings over the last items', () => {
    const history: LineItem[] = ['11-03', '11-04', '11-10', '11-11', '11-17', '11-18'].map((d) => ({ datum: `2026-${d}`, subthema: 'x', pagina: `/p${d}`, omgeving: 'zaal' }));
    expect(sharesBefore(line, history, '2026-12-01').zaal).toBe(1);
    const pick = pickForSlot(line, { datum: '2026-12-01', soort: 'post' }, history, LIVE);
    expect('omgeving' in pick && pick.omgeving).not.toBe('zaal');
  });

  it('says so when nothing fits', () => {
    expect(pickForSlot(line, { datum: '2026-12-01', soort: 'post' }, [], [])).toHaveProperty('geen');
  });
});

describe('planning four weeks', () => {
  it('has one post on Tuesday and one video on Wednesday per week', () => {
    const slots = slotsFrom(line, '2026-11-19', 4);
    expect(slots).toHaveLength(8);
    expect(slots[0]).toEqual({ datum: '2026-11-17', soort: 'post' });
    expect(slots[1]).toEqual({ datum: '2026-11-18', soort: 'video' });
  });

  it('keeps existing items and never plans a slot twice or a page twice within six weeks', () => {
    const history: LineItem[] = [{ datum: '2026-11-17', soort: 'post', subthema: 'kromming', pagina: '/kennis/low-bow-vs-mid-bow', omgeving: 'veld' }];
    const plan = planLine(line, '2026-11-16', 4, history, LIVE);
    expect(plan[0]).toMatchObject({ bestaand: true, subthema: 'kromming' });
    const pages = plan.flatMap((p) => ('pagina' in p ? [p.pagina] : []));
    expect(new Set(pages).size).toBe(pages.length);
    const keys = plan.map((p) => `${p.datum}-${p.soort}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('UTM of the line', () => {
  it('uses the campaign of the line and the item id, in the existing standard', () => {
    expect(lineUtm(line, '20261201-veld-of-zaal')).toEqual({ utm_campaign: 'welke-hockeystick-kopen', utm_content: '20261201-veld-of-zaal' });
    const url = new URL(socialUrl('/kennis/veldstick-zaalhockey', { channel: 'instagram', campaign: line.utmCampagne, contentId: '20261201-veld-of-zaal' }));
    expect(url.searchParams.get('utm_medium')).toBe('social');
    expect(url.searchParams.get('utm_campaign')).toBe('welke-hockeystick-kopen');
    expect(() => lineUtm(line, 'Fout_ID')).toThrow();
  });
});

describe('campaign section of the conversion report', () => {
  it('shows the line as its own row and groups per-item campaigns', async () => {
    const { campaignSection } = await import('@/analytics-report/conversion');
    const lines = campaignSection({
      visits: [{ key: 'welke-hockeystick-kopen', now: 12, before: 4 }, { key: '20261117-low-of-mid-bow', now: 3, before: 0 }, { key: '20261119-nieuw', now: 2, before: 1 }, { key: '', now: 900, before: 880 }],
      starts: [{ key: 'welke-hockeystick-kopen', now: 3, before: 1 }],
      compare: [],
      clicks: [{ key: 'welke-hockeystick-kopen', now: 1, before: 0 }],
    }).join('\n');
    expect(lines).toContain('| welke-hockeystick-kopen | 12 (4) | 3 (1) | 0 (0) | 1 (0) |');
    expect(lines).toContain('| Losse posts | 5 (1) |');
    expect(lines).not.toContain('900');
  });

  it('says so when PostHog could not answer', async () => {
    const { campaignSection } = await import('@/analytics-report/conversion');
    expect(campaignSection(undefined).join('')).toMatch(/kon dit deze week niet/);
  });
});

describe('Social-studio labels', () => {
  it('know every content line and sub-theme of the configuration', async () => {
    const { readFileSync } = await import('node:fs');
    const studio = readFileSync('social/studio/index.html', 'utf8');
    for (const l of config.contentlijnen) {
      expect(studio).toContain(`'${l.id}': {`);
      expect(studio).toContain(`label: '${l.label}'`);
      for (const s of l.subthemas) expect(studio).toMatch(new RegExp(`'?${s.id}'?: '${s.naam}'`));
    }
  });
});

describe('validation and wording fields on an item', () => {
  it('accept the three levels and the wording variants, and refuse anything else', async () => {
    const { contentItemSchema } = await import('./content');
    const { ZAALHOCKEY_PILOT } = await import('./pilot/zaalhockey2026');
    const base = ZAALHOCKEY_PILOT[0]!;
    expect(contentItemSchema.safeParse(base).success).toBe(true);
    for (const validatie of ['bewezen', 'aannemelijk', 'experimenteel'])
      expect(contentItemSchema.safeParse({ ...base, validatie, formulering: 'dochter' }).success, validatie).toBe(true);
    expect(contentItemSchema.safeParse({ ...base, validatie: 'zeker' }).success).toBe(false);
    expect(contentItemSchema.safeParse({ ...base, formulering: 'meisje' }).success).toBe(false);
  });
});
