// Weekly Technical SEO check (read-only): crawls every URL in the live
// sitemap, checks the internal links found on those pages, and prints a
// Markdown report. Never changes the site.
// Run with: npm run seo:technical   (SITE_URL overrides the default site)
import {
  checkSite,
  formatReport,
  internalLinks,
  parsePage,
  type CrawledPage,
  type LinkCheck,
} from '../src/seo/technicalSeo';

const SITE_URL = process.env.SITE_URL ?? 'https://jouwhockeystick.nl';
const CONCURRENCY = 4;
const TIMEOUT_MS = 15_000;
const USER_AGENT = 'jouwhockeystick-technical-seo/1.0 (+https://jouwhockeystick.nl)';

async function fetchPage(url: string, method: 'GET' | 'HEAD' = 'GET') {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = method === 'GET' ? await response.text() : '';
    return { status: response.status, finalUrl: response.url, body, ms: Date.now() - started };
  } catch {
    return { status: 0, finalUrl: url, body: '', ms: Date.now() - started };
  }
}

async function pool<T, R>(items: T[], worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index] as T);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, run));
  return results;
}

async function main() {
  const sitemap = await fetchPage(`${SITE_URL}/sitemap.xml`);
  if (sitemap.status !== 200) throw new Error(`Sitemap niet bereikbaar (HTTP ${sitemap.status || 'geen antwoord'}).`);
  const urls = [...sitemap.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1] ?? '').filter(Boolean);
  if (urls.length === 0) throw new Error('De sitemap bevat geen URL’s.');

  const pages: CrawledPage[] = await pool(urls, async (url) => {
    const result = await fetchPage(url);
    const redirected = result.finalUrl.replace(/\/$/, '') !== url.replace(/\/$/, '');
    return {
      url,
      status: result.status,
      ms: result.ms,
      ...(redirected && { redirectedTo: result.finalUrl }),
      ...(result.status === 200 && { parsed: parsePage(result.body, result.finalUrl) }),
    };
  });

  const known = new Map(pages.map((p) => [p.url.replace(/\/$/, ''), p.status]));
  const found = internalLinks(pages, SITE_URL);
  const toCheck = [...found.keys()].filter((link) => !known.has(link.replace(/\/$/, '')));
  const checked = await pool(toCheck, async (link) => {
    let result = await fetchPage(link, 'HEAD');
    if (result.status === 405 || result.status === 0) result = await fetchPage(link);
    return { url: link, status: result.status };
  });
  const statusOf = new Map(checked.map((c) => [c.url, c.status]));
  const links: LinkCheck[] = [...found.entries()].map(([url, foundOn]) => ({
    url,
    status: statusOf.get(url) ?? known.get(url.replace(/\/$/, '')) ?? 200,
    foundOn,
  }));

  console.log(
    formatReport({
      siteUrl: SITE_URL,
      date: new Date().toISOString().slice(0, 10),
      pages,
      linksChecked: links.length,
      findings: checkSite(pages, links),
    }),
  );
}

main().catch((error: unknown) => {
  console.log(`# Technical SEO mislukt\n\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
