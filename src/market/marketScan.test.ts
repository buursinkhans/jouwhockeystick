import { describe, expect, it } from 'vitest';
import {
  diffBol,
  diffSites,
  formatMarketReport,
  hockeyUrls,
  isHockeyStickTitle,
  labelFromUrl,
  parseSitemap,
  sitemapsFromRobots,
  type MarketSnapshot,
} from './marketScan';

describe('hockeyUrls', () => {
  it('keeps hockey pages, strips queries and removes duplicates', () => {
    expect(
      hockeyUrls([
        'https://www.daka.nl/p/grays-hockeystick?colour=blue',
        'https://www.daka.nl/p/grays-hockeystick',
        'https://www.daka.nl/p/hardloopschoen',
        'not a url',
      ]),
    ).toEqual(['https://www.daka.nl/p/grays-hockeystick']);
  });
});

describe('sitemapsFromRobots', () => {
  it('returns only sitemaps on the given host', () => {
    const robots = 'User-agent: *\nDisallow: /cart\nSitemap: https://www.passasports.nl/sitemap.xml\nsitemap: https://www.passasports.be/sitemap.xml\n';
    expect(sitemapsFromRobots(robots, 'www.passasports.nl')).toEqual(['https://www.passasports.nl/sitemap.xml']);
  });
});

describe('parseSitemap', () => {
  it('reads a sitemap index and a url set, including CDATA and entities', () => {
    expect(parseSitemap('<sitemapindex><sitemap><loc>https://a.nl/s1.xml</loc></sitemap></sitemapindex>')).toEqual({
      isIndex: true,
      locs: ['https://a.nl/s1.xml'],
    });
    expect(parseSitemap('<urlset><url><loc><![CDATA[https://a.nl/x?a=1&amp;b=2]]></loc></url></urlset>')).toEqual({
      isIndex: false,
      locs: ['https://a.nl/x?a=1&b=2'],
    });
  });
});

describe('labelFromUrl', () => {
  it('turns the last path segment into words', () => {
    expect(labelFromUrl('https://a.nl/hockey/grays-gr-5000-probow.html')).toBe('grays gr 5000 probow');
  });
});

describe('diffSites', () => {
  it('marks a first measurement as baseline and lists new and removed pages later', () => {
    const now = [{ site: 'Daka', urls: ['https://d.nl/hockey-a', 'https://d.nl/hockey-b'] }];
    expect(diffSites(undefined, now)[0]).toMatchObject({ baseline: true, total: 2, added: [] });
    const diff = diffSites([{ site: 'Daka', urls: ['https://d.nl/hockey-a', 'https://d.nl/hockey-c'] }], now)[0];
    expect(diff).toMatchObject({ baseline: false, added: ['https://d.nl/hockey-b'], removed: ['https://d.nl/hockey-c'] });
  });

  it('reports a site that could not be read without inventing changes', () => {
    const diff = diffSites([{ site: 'Daka', urls: ['x'] }], [{ site: 'Daka', urls: [], error: 'HTTP 403' }])[0];
    expect(diff).toMatchObject({ error: 'HTTP 403', added: [], removed: [] });
  });
});

describe('diffBol', () => {
  const item = (ean: string, rank: number, price = 50) => ({ ean, title: `Stick ${ean}`, rank, price });

  it('finds new entries, big climbs and price changes', () => {
    const { changes } = diffBol(
      [{ query: 'hockeystick', items: [item('1', 20), item('2', 3, 100)] }],
      [{ query: 'hockeystick', items: [item('1', 5), item('2', 3, 80), item('3', 7)] }],
    );
    expect(changes.map((c) => c.kind).sort()).toEqual(['gestegen', 'nieuw', 'prijs']);
  });
});

describe('formatMarketReport', () => {
  const snap = (date: string, urls: string[]): MarketSnapshot => ({
    date,
    sites: [{ site: 'Vrijbuiter', urls }],
    bol: [{ query: 'hockeystick', items: [{ ean: '1', title: 'Grays JB 6', rank: 1, price: 121.9 }] }],
  });

  it('writes a baseline the first week', () => {
    const { markdown, hasChanges } = formatMarketReport(undefined, snap('2026-10-12', ['https://v.nl/hockey-a']));
    expect(markdown).toContain('Nulmeting');
    expect(hasChanges).toBe(false);
  });

  it('lists new pages in later weeks', () => {
    const { markdown, hasChanges } = formatMarketReport(
      snap('2026-10-12', ['https://v.nl/hockey-a']),
      snap('2026-10-19', ['https://v.nl/hockey-a', 'https://v.nl/hockey-b']),
    );
    expect(hasChanges).toBe(true);
    expect(markdown).toContain('### Nieuw bij Vrijbuiter (1)');
    expect(markdown).toContain('1. Grays JB 6 — €121,90');
  });
});

describe('isHockeyStickTitle', () => {
  it('keeps sticks and drops accessories and toy sets', () => {
    expect(isHockeyStickTitle('Grays DB 5 Hockeystick Oceaanblauw/Zilver')).toBe(true);
    expect(isHockeyStickTitle('Scoop Zaalhockeystick - Indoor - Mid Bow - 20% Carbon')).toBe(true);
    expect(isHockeyStickTitle('Brabo Fiets Klem - Accessoires - zwart')).toBe(false);
    expect(isHockeyStickTitle('Gribbid Progrip - Hockeystick Grip - Zeemgrip')).toBe(false);
    expect(isHockeyStickTitle('Hockeyset 2 Sticks 28” – Kunststof – Straathockey Set voor Kinderen')).toBe(false);
    expect(isHockeyStickTitle('Techidna Kabel Tape - Voor Kabelbundels, Hockeysticks & Rackets')).toBe(false);
  });
});
