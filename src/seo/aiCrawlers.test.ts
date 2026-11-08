import { describe, expect, it } from 'vitest';
import { AI_CRAWLERS, crawlerProblems, formatCrawlerSection, robotsAllows, type CrawlerResult } from './aiCrawlers';

const OURS = 'User-Agent: *\nAllow: /\nDisallow: /aanbod/\n\nSitemap: https://jouwhockeystick.nl/sitemap.xml\n';

describe('robotsAllows', () => {
  it('reads our robots.txt: everything except /aanbod/', () => {
    for (const crawler of AI_CRAWLERS) {
      expect(robotsAllows(OURS, crawler.token, '/'), crawler.name).toBe(true);
      expect(robotsAllows(OURS, crawler.token, '/kennis/hockeystick-lengte-tabel')).toBe(true);
      expect(robotsAllows(OURS, crawler.token, '/aanbod/osaka-x')).toBe(false);
    }
  });

  it('uses the group that names the crawler instead of *', () => {
    const robots = 'User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n';
    expect(robotsAllows(robots, 'GPTBot', '/')).toBe(false);
    expect(robotsAllows(robots, 'OAI-SearchBot', '/')).toBe(true);
  });

  it('lets the longest rule win, Allow on a tie, and understands * and $', () => {
    const robots = 'User-agent: *\nDisallow: /kennis\nAllow: /kennis/hockeystick\nDisallow: /*.json$\n';
    expect(robotsAllows(robots, 'bingbot', '/kennis/low-bow')).toBe(false);
    expect(robotsAllows(robots, 'bingbot', '/kennis/hockeystick-lengte-tabel')).toBe(true);
    expect(robotsAllows(robots, 'bingbot', '/data/aanbod.json')).toBe(false);
    expect(robotsAllows(robots, 'bingbot', '/data/aanbod.json?x=1')).toBe(true);
    expect(robotsAllows('User-agent: *\nDisallow:\n', 'bingbot', '/')).toBe(true);
  });

  it('treats several user-agent lines as one group', () => {
    const robots = 'User-agent: PerplexityBot\nUser-agent: ClaudeBot\nDisallow: /\n';
    expect(robotsAllows(robots, 'ClaudeBot', '/')).toBe(false);
    expect(robotsAllows(robots, 'PerplexityBot', '/sticks')).toBe(false);
    expect(robotsAllows(robots, 'OAI-SearchBot', '/')).toBe(true);
  });
});

describe('crawlerProblems', () => {
  const crawler = AI_CRAWLERS[0]!;
  const baseline = [{ path: '/', status: 200, bytes: 120_000 }];

  it('is quiet when the crawler gets the same page', () => {
    const result: CrawlerResult = { crawler, robots: { '/': true }, fetches: [{ path: '/', status: 200, bytes: 119_500 }] };
    expect(crawlerProblems(result, baseline)).toEqual([]);
    expect(formatCrawlerSection([result], baseline)).toContain('✅');
  });

  it('reports a robots block, an error status and a much smaller page', () => {
    const result: CrawlerResult = {
      crawler,
      robots: { '/': false },
      fetches: [
        { path: '/', status: 403, bytes: 0 },
        { path: '/sticks', status: 200, bytes: 5_000 },
      ],
    };
    const problems = crawlerProblems(result, [...baseline, { path: '/sticks', status: 200, bytes: 600_000 }]);
    expect(problems).toEqual(['robots.txt blokkeert /', '/ geeft HTTP 403', '/sticks geeft veel minder HTML (5000 tegen 600000 bytes)']);
    expect(formatCrawlerSection([result], baseline)).toContain('**1 crawler(s) kunnen de site niet (volledig) lezen.**');
  });
});
