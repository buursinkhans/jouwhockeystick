import { describe, expect, it } from 'vitest';
import {
  checkSite,
  formatReport,
  internalLinks,
  parsePage,
  type CrawledPage,
} from './technicalSeo';

const SITE = 'https://jouwhockeystick.nl';

const html = ({
  title = 'Zaalstick voor kinderen | jouwhockeystick.nl',
  description = 'Zaalstick voor je kind? Kies op lengte, controle en prijs.',
  canonical = 'https://jouwhockeystick.nl/kennis/zaalstick-voor-kinderen',
  robots = '',
  h1 = 1,
  body = '',
} = {}) => `<!DOCTYPE html><html><head>
<title>${title}</title>
<meta name="description" content="${description}"/>
<link rel="canonical" href="${canonical}"/>
${robots ? `<meta name="robots" content="${robots}"/>` : ''}
</head><body>${'<h1 class="t">Kop</h1>'.repeat(h1)}${body}</body></html>`;

const page = (url: string, markup: string, extra: Partial<CrawledPage> = {}): CrawledPage => ({
  url,
  status: 200,
  ms: 300,
  parsed: parsePage(markup, url),
  ...extra,
});

describe('parsePage', () => {
  it('reads title, description, canonical, H1s, links and images', () => {
    const parsed = parsePage(
      html({
        title: 'Low bow &amp; mid bow',
        body: '<a href="/stickwijzer">x</a><a href="/kennis#top">y</a><a href="mailto:a@b.nl">m</a><a href="https://www.bol.com/x">b</a><img src="a.png"><img src="b.png" alt="">',
      }),
      `${SITE}/kennis/low-bow-vs-mid-bow`,
    );
    expect(parsed.title).toBe('Low bow & mid bow');
    expect(parsed.description).toContain('Zaalstick');
    expect(parsed.canonical).toBe(`${SITE}/kennis/zaalstick-voor-kinderen`);
    expect(parsed.h1Count).toBe(1);
    expect(parsed.noindex).toBe(false);
    expect(parsed.links).toEqual([`${SITE}/stickwijzer`, `${SITE}/kennis`, 'https://www.bol.com/x']);
    expect(parsed.imagesWithoutAlt).toBe(1);
  });

  it('recognises noindex', () => {
    expect(parsePage(html({ robots: 'noindex, follow' }), SITE).noindex).toBe(true);
  });
});

describe('internalLinks', () => {
  it('keeps only links on the site host and remembers where they were found', () => {
    const a = page(`${SITE}/a`, html({ body: '<a href="/b">b</a><a href="https://www.bol.com/x">x</a>' }));
    const found = internalLinks([a], SITE);
    expect([...found.keys()]).toEqual([`${SITE}/b`]);
    expect(found.get(`${SITE}/b`)).toEqual([`${SITE}/a`]);
  });
});

describe('checkSite', () => {
  const url = `${SITE}/kennis/zaalstick-voor-kinderen`;

  it('finds nothing on a clean page', () => {
    expect(checkSite([page(url, html())], [])).toEqual([]);
  });

  it('flags missing basics, noindex, a wrong canonical and two H1s', () => {
    const checks = checkSite(
      [page(url, html({ robots: 'noindex', canonical: `${SITE}/elders`, h1: 2 }))],
      [],
    ).map((f) => f.check);
    expect(checks).toContain('Pagina uit de sitemap staat op noindex');
    expect(checks).toContain('Canonical wijst naar een andere URL');
    expect(checks).toContain('Niet precies één H1');
  });

  it('flags duplicate titles on every page that has them', () => {
    const findings = checkSite(
      [page(`${SITE}/a`, html({ canonical: `${SITE}/a` })), page(`${SITE}/b`, html({ canonical: `${SITE}/b` }))],
      [],
    );
    expect(findings.filter((f) => f.check === 'Dubbele title')).toHaveLength(2);
  });

  it('flags a broken internal link on the page that links to it', () => {
    const findings = checkSite([], [{ url: `${SITE}/weg`, status: 404, foundOn: [url] }]);
    expect(findings).toEqual([
      { severity: 'fout', check: 'Kapotte interne link', url, detail: `${SITE}/weg → 404` },
    ]);
  });

  it('flags a sitemap URL that does not answer 200', () => {
    const findings = checkSite([{ url, status: 404, ms: 100 }], []);
    expect(findings[0]?.check).toBe('Pagina uit de sitemap geeft geen 200');
  });
});

describe('formatReport', () => {
  it('writes a Dutch summary with errors grouped by check', () => {
    const report = formatReport({
      siteUrl: SITE,
      date: '2026-10-12',
      pages: [{ url: `${SITE}/a`, status: 404, ms: 100 }],
      linksChecked: 3,
      findings: [{ severity: 'fout', check: 'Pagina uit de sitemap geeft geen 200', url: `${SITE}/a`, detail: 'HTTP 404' }],
    });
    expect(report).toContain('| Fouten | 1 |');
    expect(report).toContain('### Pagina uit de sitemap geeft geen 200 (1)');
    expect(report).toContain('- `/a` — HTTP 404');
  });
});
