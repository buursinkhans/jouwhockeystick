/**
 * IndexNow (decision log 2026-10-24): after a production deploy we tell Bing
 * and the other IndexNow search engines which pages changed, so nobody has to
 * request indexing by hand. Google does not take part in IndexNow.
 *
 * The key is public by design: the protocol checks it at keyLocation on our
 * own site (public/<key>.txt). It is not a secret and does not belong in
 * GitHub Secrets.
 */
export const INDEXNOW_KEY = '1f363273e4734b3e6969d44451a7b316';
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
export const SITE_HOST = 'jouwhockeystick.nl';
const SITE = `https://${SITE_HOST}`;

/** Content files whose page path is known; shared code (layout, components) is not listed. */
const CONTENT_PAGES: Record<string, string> = {
  'src/content/zaal.ts': '/zaalsticks',
  'src/content/veld.ts': '/sticks',
  'src/content/home.ts': '/',
  'src/content/methodiek.ts': '/methodiek',
  'src/content/brands.ts': '/merken',
  'src/content/clubs.ts': '/clubs',
  'src/content/privacy.ts': '/privacy',
};

/**
 * The page path for one changed file, or null when the file is not one
 * page's own content (shared code, tests, docs, workflows).
 */
export function pathForFile(file: string): string | null {
  if (/\.test\.tsx?$/.test(file)) return null;
  const own = CONTENT_PAGES[file];
  if (own) return own;
  const product = file.match(/^src\/catalog\/products\/([a-z0-9-]+)\.ts$/);
  if (product) return `/sticks/${product[1]}`;
  const article = file.match(/^src\/content\/articles\/([a-z0-9-]+)\.ts$/);
  if (article) return `/kennis/${article[1]}`;
  const post = file.match(/^src\/content\/blogPosts\/([a-z0-9-]+)\.ts$/);
  if (post) return `/blog/${post[1]}`;
  // A static route's own page file; dynamic routes ([slug]) are shared code.
  const route = file.match(/^src\/app\/((?:[a-z0-9-]+\/)*)page\.tsx$/);
  if (route && !route[1]?.includes('[')) {
    return `/${(route[1] ?? '').replace(/\/$/, '')}`;
  }
  return null;
}

export function absolute(path: string): string {
  return new URL(path, SITE).toString();
}

/** Unique absolute URLs for the changed files, before the sitemap filter. */
export function urlsForFiles(files: readonly string[]): string[] {
  const paths = files
    .map(pathForFile)
    .filter((path): path is string => path !== null);
  return [...new Set(paths.map(absolute))];
}

/** Only URLs that are in the sitemap: never noindex pages such as /aanbod or /interesse. */
export function inSitemap(
  urls: readonly string[],
  sitemapUrls: readonly string[],
): string[] {
  const allowed = new Set(sitemapUrls.map((u) => u.replace(/\/$/, '')));
  return urls.filter((u) => allowed.has(u.replace(/\/$/, '')));
}

export function sitemapUrls(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(
    (m) => m[1] ?? '',
  );
}

export function payload(urlList: readonly string[]) {
  return {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList: [...urlList],
  };
}
