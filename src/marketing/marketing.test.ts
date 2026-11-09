import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getArticlesIncludingScheduled } from '@/content';
import { contentItemSchema, type ContentItem } from './content';
import { checkItem } from './editorCheck';
import { handoverAction, type ScheduledPost } from './metricoolSync';
import { ZAALHOCKEY_PILOT } from './pilot/zaalhockey2026';
import { socialUrl } from './utm';

// Marketing machine, phase 1 (decision log 2026-11-09).
const item = (o: Partial<ContentItem> = {}): ContentItem => ({ ...ZAALHOCKEY_PILOT[0]!, ...o });

/** A live page: an article slug, or a route folder under src/app. */
function pageExists(path: string): boolean {
  const kennis = /^\/kennis\/([a-z0-9-]+)$/.exec(path);
  if (kennis) return getArticlesIncludingScheduled().some((a) => a.slug === kennis[1]);
  return existsSync(join(process.cwd(), 'src/app', path, 'page.tsx'));
}

describe('zaalhockey pilot', () => {
  it('has 8 to 12 valid items with unique ids, all still concept and without a Metricool id', () => {
    expect(ZAALHOCKEY_PILOT.length).toBeGreaterThanOrEqual(8);
    expect(ZAALHOCKEY_PILOT.length).toBeLessThanOrEqual(12);
    expect(new Set(ZAALHOCKEY_PILOT.map((i) => i.id)).size).toBe(ZAALHOCKEY_PILOT.length);
    for (const i of ZAALHOCKEY_PILOT) {
      expect(contentItemSchema.safeParse(i).success, i.id).toBe(true);
      expect(i.status, i.id).toBe('concept');
      expect(i.metricool, i.id).toEqual({});
    }
  });

  it.each(ZAALHOCKEY_PILOT.map((i) => [i.id, i] as const))('%s points to a live page and passes the editor check', (_id, i) => {
    expect(pageExists(i.bronpagina), i.bronpagina).toBe(true);
    expect(checkItem(i)).toEqual([]);
  });

  it('uses each page for at most one post per six weeks (docs/instagram.md §7), videos apart', () => {
    const posts = ZAALHOCKEY_PILOT.filter((i) => i.vorm !== 'short' && i.vorm !== 'reel' && i.kanalen.includes('instagram'));
    const pages = posts.map((i) => i.bronpagina);
    expect(new Set(pages).size).toBe(pages.length);
  });

  it('mentions partner links wherever the caption carries #partnerlink', () => {
    for (const i of ZAALHOCKEY_PILOT.filter((x) => x.hashtags.includes('#partnerlink'))) {
      expect(i.tekst, i.id).toMatch(/partnerlinks/);
    }
  });
});

describe('editor check', () => {
  it('flags claims, prices, dashes and exclamation marks as P0', () => {
    const rules = (tekst: string) => checkItem(item({ tekst })).map((f) => f.rule);
    expect(rules('De goedkoopste zaalstick van Nederland, kijk snel.')).toContain('claim');
    expect(rules('Deze stick kost €49,95 bij de winkel van je keuze.')).toContain('prijs');
    expect(rules('Zaalhockey — een ander spel dan veldhockey, echt waar.')).toContain('gedachtestreepje');
    expect(rules('Zaalhockey is een ander spel dan veldhockey, echt waar!')).toContain('uitroepteken');
  });

  it('flags a second contrast sentence and AI words as P1', () => {
    const findings = checkItem(
      item({ tekst: 'Het gaat niet om de prijs, maar om de lengte. Het is geen wedstrijd, maar een keuze. Dat is cruciaal voor je kind.' }),
    );
    expect(findings.map((f) => f.rule)).toEqual(expect.arrayContaining(['contrast', 'ai-woord']));
  });
});

describe('UTM standard', () => {
  it('builds source, medium social, campaign and content on a page of the site', () => {
    const url = new URL(socialUrl('/zaalsticks', { channel: 'instagram', campaign: 'zaalhockey-2026', contentId: '20261121-zaalstick-kiezen' }));
    expect(url.origin + url.pathname).toBe('https://jouwhockeystick.nl/zaalsticks');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      utm_source: 'instagram',
      utm_medium: 'social',
      utm_campaign: 'zaalhockey-2026',
      utm_content: '20261121-zaalstick-kiezen',
    });
  });

  it('refuses other sites and free text', () => {
    expect(() => socialUrl('//evil.example/x', { channel: 'tiktok', campaign: 'a', contentId: 'b' })).toThrow();
    expect(() => socialUrl('/zaalsticks', { channel: 'tiktok', campaign: 'Zaal 2026', contentId: 'b' })).toThrow();
  });
});

describe('handover to Metricool', () => {
  const today = '2026-11-10';
  const approved = item({ status: 'goedgekeurd', datum: '2026-11-17' });
  const same: ScheduledPost = { id: '1', uuid: 'u1', dateTime: '2026-11-17T19:30:00', text: approved.tekst, networks: ['instagram'] };

  it('creates only an approved item with a future date and no Metricool id', () => {
    expect(handoverAction(approved, 'instagram', [], today)).toEqual({ kind: 'create' });
    expect(handoverAction(item({ datum: '2026-11-17' }), 'instagram', [], today)).toMatchObject({ kind: 'skip', reason: 'niet-goedgekeurd' });
    expect(handoverAction(item({ status: 'goedgekeurd', datum: '2026-11-10' }), 'instagram', [], today)).toMatchObject({ reason: 'datum-voorbij' });
    expect(handoverAction(item({ status: 'goedgekeurd', datum: null }), 'instagram', [], today)).toMatchObject({ reason: 'geen-datum' });
  });

  it('never creates twice: a stored id skips, a matching post in Metricool is linked', () => {
    const stored = item({ ...approved, metricool: { instagram: { id: '1', uuid: 'u1', createdAt: '2026-11-10T08:00:00Z' } } });
    expect(handoverAction(stored, 'instagram', [], today)).toMatchObject({ kind: 'skip', reason: 'al-in-metricool' });
    expect(handoverAction(approved, 'instagram', [same], today)).toEqual({ kind: 'link', post: same });
    // Another network or another day is not this item.
    expect(handoverAction(approved, 'instagram', [{ ...same, networks: ['facebook'] }], today)).toEqual({ kind: 'create' });
  });

  it('an earlier handover without an id and without a match is uncertain: a person checks, nothing is created', () => {
    expect(handoverAction(item({ ...approved, status: 'naar-metricool' }), 'instagram', [], today).kind).toBe('onzeker');
    expect(handoverAction(item({ ...approved, status: 'onzeker' }), 'instagram', [], today).kind).toBe('onzeker');
    expect(handoverAction(item({ ...approved, status: 'naar-metricool' }), 'instagram', [same], today).kind).toBe('link');
  });
});
