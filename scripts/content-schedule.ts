// Publication schedule (read-only). Lists scheduled articles and blog posts,
// and says whether something went live since the last production build, so
// the daily workflow knows when to rebuild the site.
// Usage: npm run content:schedule -- <since YYYY-MM-DD> <report.md>
import { appendFileSync, writeFileSync } from 'node:fs';
import { getArticlesIncludingScheduled } from '../src/content/index';
import { getBlogPostsIncludingScheduled } from '../src/content/blog';
import { dueItems, formatDutchDate, todayInSiteTimeZone } from '../src/content/schedule';

const [since = '0000-00-00', reportPath = 'publicatieplanning.md'] = process.argv.slice(2);
const today = todayInSiteTimeZone();

const all = [
  ...getArticlesIncludingScheduled().map((a) => ({ ...a, soort: 'Kennis', path: `/kennis/${a.slug}` })),
  ...getBlogPostsIncludingScheduled().map((a) => ({ ...a, soort: 'Blog', path: `/blog/${a.slug}` })),
];
const due = dueItems(all, since, today);
const planned = all.filter((a) => a.publishedAt > today).sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));

const lines = [
  `# Publicatieplanning`,
  '',
  `Stand van ${formatDutchDate(today)}. Een pagina gaat live op haar publicatiedatum; de site wordt die ochtend automatisch opnieuw gebouwd.`,
  '',
  '## Gepland',
  '',
  ...(planned.length
    ? ['| Datum | Soort | Titel | Pad |', '|---|---|---|---|', ...planned.map((a) => `| ${a.publishedAt} | ${a.soort} | ${a.title} | \`${a.path}\` |`)]
    : ['Niets gepland.']),
  '',
  '## Nu live gezet',
  '',
  ...(due.length ? due.map((a) => `- ${a.title} (\`${a.path}\`, ${a.publishedAt})`) : ['Niets.']),
  '',
  '_Automatisch bijgewerkt door de workflow Geplande publicatie._',
];
writeFileSync(reportPath, lines.join('\n'));
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `due=${due.length > 0}\n`);
console.log(`Vandaag ${today}; sinds ${since}: ${due.length} live te zetten; ${planned.length} gepland.`);
