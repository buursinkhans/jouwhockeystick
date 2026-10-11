// Weekly market scan (read-only). Reads the public sitemaps of competing
// shops (hockey pages only) and bol.com's most popular hockey sticks, then
// compares with last week's snapshot.
// Usage: npm run market:scan -- <previous.json|-> <current.json> <report.md>
// Needs BOL_CLIENT_ID and BOL_CLIENT_SECRET for the bol.com part.
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import {
  formatMarketReport,
  hockeyUrls,
  isHockeyStickTitle,
  parseSitemap,
  sitemapsFromRobots,
  type BolItem,
  type BolList,
  type MarketSnapshot,
  type SiteSnapshot,
} from '../src/market/marketScan';

const USER_AGENT = 'jouwhockeystick-marktverkenner/1.0 (+https://jouwhockeystick.nl)';
/** Robots.txt of PassaSports asks for 2 s between requests; we use that for every site. */
const DELAY_MS = 2000;
const MAX_SITEMAPS_PER_SITE = 80;

const SITES = [
  { site: 'PassaSports', host: 'www.passasports.nl' },
  { site: 'Daka', host: 'www.daka.nl' },
  { site: 'Vrijbuiter', host: 'www.vrijbuiter.nl' },
];
const BOL_QUERIES = ['hockeystick', 'zaalhockeystick'];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url: string, retries = 2): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status === 429 && retries > 0) {
    // Too many requests: wait as asked (max 60 s), then try again.
    const retryAfter = Number(response.headers.get('retry-after'));
    await sleep(Math.min(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 30_000, 60_000));
    return fetchText(url, retries - 1);
  }
  if (response.status === 403) throw new Error('HTTP 403 (site weigert automatische toegang)');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const gzipped = buffer[0] === 0x1f && buffer[1] === 0x8b;
  return (gzipped ? gunzipSync(buffer) : buffer).toString('utf8');
}

async function scanSite({ site, host }: { site: string; host: string }): Promise<SiteSnapshot> {
  try {
    const robots = await fetchText(`https://${host}/robots.txt`);
    const queue = sitemapsFromRobots(robots, host);
    if (queue.length === 0) queue.push(`https://${host}/sitemap.xml`);
    const seen = new Set<string>();
    const pages: string[] = [];
    while (queue.length > 0 && seen.size < MAX_SITEMAPS_PER_SITE) {
      const url = queue.shift() as string;
      if (seen.has(url)) continue;
      seen.add(url);
      await sleep(DELAY_MS);
      let xml: string;
      try {
        xml = await fetchText(url);
      } catch {
        continue; // one broken sub-sitemap should not sink the whole site
      }
      const { isIndex, locs } = parseSitemap(xml);
      if (isIndex) queue.push(...locs.filter((loc) => new URL(loc).host === host));
      else pages.push(...locs);
    }
    if (seen.size === 0) throw new Error('geen sitemap gevonden');
    return { site, urls: hockeyUrls(pages) };
  } catch (error) {
    return { site, urls: [], error: error instanceof Error ? error.message : String(error) };
  }
}

async function bolToken(): Promise<string> {
  const id = process.env.BOL_CLIENT_ID?.trim();
  const secret = process.env.BOL_CLIENT_SECRET?.trim();
  if (!id || !secret) throw new Error('bol.com-sleutels ontbreken');
  const response = await fetch('https://login.bol.com/token?grant_type=client_credentials', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      Accept: 'application/json',
    },
    body: '',
  });
  if (!response.ok) throw new Error(`inloggen bij bol.com mislukt (HTTP ${response.status})`);
  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error('geen token van bol.com');
  return body.access_token;
}

async function scanBol(): Promise<BolList[]> {
  let token: string;
  try {
    token = await bolToken();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return BOL_QUERIES.map((query) => ({ query, items: [], error: message }));
  }
  const lists: BolList[] = [];
  for (const query of BOL_QUERIES) {
    const params = new URLSearchParams({
      'search-term': query,
      'country-code': 'NL',
      'page-size': '50',
      sort: 'POPULARITY',
      'include-offer': 'true',
    });
    try {
      await sleep(300);
      const response = await fetch(`https://api.bol.com/marketing/catalog/v1/products/search?${params}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Accept-Language': 'nl' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = (await response.json()) as {
        results?: { ean?: string; title?: string; url?: string; offer?: { price?: number } }[];
      };
      const items: BolItem[] = (body.results ?? [])
        .filter((r) => isHockeyStickTitle(r.title ?? ''))
        .map((r, i) => ({
          ean: r.ean ?? `onbekend-${i}`,
          title: r.title ?? '(geen titel)',
          rank: i + 1,
          ...(r.offer?.price !== undefined && { price: r.offer.price }),
          ...(r.url && { url: r.url }),
        }));
      lists.push({ query, items });
    } catch (error) {
      lists.push({ query, items: [], error: error instanceof Error ? error.message : String(error) });
    }
  }
  return lists;
}

async function main() {
  const [previousPath = '-', currentPath = 'market-snapshot.json', reportPath = 'market-report.md'] = process.argv.slice(2);
  const previous: MarketSnapshot | undefined =
    previousPath !== '-' && existsSync(previousPath) ? (JSON.parse(readFileSync(previousPath, 'utf8')) as MarketSnapshot) : undefined;

  const sites: SiteSnapshot[] = [];
  for (const site of SITES) sites.push(await scanSite(site)); // one site at a time, politely
  const current: MarketSnapshot = { date: new Date().toISOString().slice(0, 10), sites, bol: await scanBol() };

  const { markdown, hasChanges } = formatMarketReport(previous, current);
  writeFileSync(currentPath, JSON.stringify(current, null, 1));
  writeFileSync(reportPath, markdown);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changes=${hasChanges}\n`);
  console.log(`${sites.map((s) => `${s.site}: ${s.error ?? s.urls.length}`).join(', ')}; wijzigingen: ${hasChanges}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
