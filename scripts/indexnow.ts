// IndexNow: tells Bing and the other IndexNow search engines which pages are
// new or changed after a production deploy (decision log 2026-10-24).
// Only URLs that are in the live sitemap are sent. One request per run.
// Run with:
//   npm run indexnow -- changed <before-sha> <after-sha>   (the workflow)
//   npm run indexnow -- all                                 (by hand, the full sitemap)
//   add --dry-run to log without sending.
import { execFileSync } from 'node:child_process';
import {
  INDEXNOW_ENDPOINT,
  absolute,
  inSitemap,
  payload,
  sitemapUrls,
  urlsForFiles,
} from '../src/seo/indexnow';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const [mode, before, after] = args.filter((a) => a !== '--dry-run');

function changedFiles(from: string, to: string): string[] {
  // A brand-new branch has no "before": compare with the parent commit.
  const base = /^0+$/.test(from) ? `${to}^` : from;
  return execFileSync(
    'git',
    ['diff', '--name-only', '--diff-filter=AMR', base, to],
    {
      encoding: 'utf8',
    },
  )
    .split('\n')
    .filter(Boolean);
}

async function main() {
  if (mode !== 'changed' && mode !== 'all') {
    throw new Error(
      'Gebruik: indexnow changed <before> <after> | indexnow all',
    );
  }
  const response = await fetch(absolute('/sitemap.xml'));
  if (!response.ok)
    throw new Error(`Sitemap niet bereikbaar (HTTP ${response.status}).`);
  const sitemap = sitemapUrls(await response.text());

  let urls: string[];
  if (mode === 'all') {
    urls = sitemap;
  } else {
    if (!before || !after)
      throw new Error('Mode "changed" heeft <before> en <after> nodig.');
    const files = changedFiles(before, after);
    console.log(`Gewijzigde bestanden: ${files.length}`);
    urls = inSitemap(urlsForFiles(files), sitemap);
  }

  if (urls.length === 0) {
    console.log('Geen pagina’s uit de sitemap gewijzigd; niets gemeld.');
    return;
  }
  console.log(
    `URL's (${urls.length}):\n${urls.map((u) => `- ${u}`).join('\n')}`,
  );
  if (dryRun) {
    console.log('Dry run: niets verstuurd.');
    return;
  }
  const result = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload(urls)),
  });
  console.log(`IndexNow antwoordde HTTP ${result.status} (200 of 202 = goed).`);
  if (result.status !== 200 && result.status !== 202) {
    console.log(await result.text());
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
