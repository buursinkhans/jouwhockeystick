/**
 * AI crawlers and search bots (read-only check, decision log 2026-10-28): can
 * they read the site? Per crawler, does robots.txt allow it, and does the
 * site answer its user agent with the same full HTML as a normal visitor?
 * Pure functions; the fetching lives in scripts/technical-seo.ts.
 */

export type AiCrawler = {
  name: string;
  /** Product token in robots.txt. */
  token: string;
  /** Their published user agent (we send it to see how the site answers it). */
  userAgent: string;
  /** What the bot does, in the report. */
  purpose: string;
};

export const AI_CRAWLERS: readonly AiCrawler[] = [
  {
    name: 'OAI-SearchBot',
    token: 'OAI-SearchBot',
    userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.3; +https://openai.com/searchbot',
    purpose: 'ChatGPT Search: zoekindex van ChatGPT',
  },
  {
    name: 'ChatGPT-User',
    token: 'ChatGPT-User',
    userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
    purpose: 'ChatGPT opent een pagina op verzoek van een gebruiker',
  },
  {
    name: 'GPTBot',
    token: 'GPTBot',
    userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot',
    purpose: 'OpenAI: training van modellen',
  },
  {
    name: 'Bingbot',
    token: 'bingbot',
    userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
    purpose: 'Bing en Copilot; ChatGPT Search gebruikt ook Bing',
  },
  {
    name: 'PerplexityBot',
    token: 'PerplexityBot',
    userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
    purpose: 'Perplexity: zoekindex',
  },
  {
    name: 'ClaudeBot',
    token: 'ClaudeBot',
    userAgent: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
    purpose: 'Anthropic (Claude)',
  },
  {
    name: 'Googlebot',
    token: 'Googlebot',
    userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    purpose: 'Google Zoeken en AI-overzichten',
  },
  {
    name: 'Applebot',
    token: 'Applebot',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)',
    purpose: 'Apple (Siri, Spotlight)',
  },
];

type Rule = { allow: boolean; path: string };
type Group = { agents: string[]; rules: Rule[] };

/** robots.txt into groups of user agents with their Allow/Disallow rules. */
export function parseRobots(text: string): Group[] {
  const groups: Group[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    const match = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!match) continue;
    const field = (match[1] ?? '').toLowerCase();
    const value = (match[2] ?? '').trim();
    if (field === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if ((field === 'allow' || field === 'disallow') && current) {
      // An empty Disallow allows everything: no rule.
      if (value) current.rules.push({ allow: field === 'allow', path: value });
      lastWasAgent = false;
    } else {
      lastWasAgent = false;
    }
  }
  return groups;
}

/** A robots.txt path pattern (with * and $) as a regular expression. */
function patternToRegExp(pattern: string): RegExp {
  const anchored = pattern.endsWith('$');
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${body}${anchored ? '$' : ''}`);
}

/**
 * Whether robots.txt lets this crawler fetch the path (RFC 9309): the group
 * naming the crawler's token, else the `*` group; within it the longest
 * matching rule wins, Allow on a tie; no rule means allowed.
 */
export function robotsAllows(robotsTxt: string, token: string, path: string): boolean {
  const groups = parseRobots(robotsTxt);
  const t = token.toLowerCase();
  const own = groups.filter((g) => g.agents.some((a) => a !== '*' && t.startsWith(a)));
  const applicable = own.length ? own : groups.filter((g) => g.agents.includes('*'));
  const rules = applicable.flatMap((g) => g.rules);
  let best: Rule | null = null;
  for (const rule of rules) {
    if (!patternToRegExp(rule.path).test(path)) continue;
    if (!best || rule.path.length > best.path.length || (rule.path.length === best.path.length && rule.allow)) best = rule;
  }
  return best ? best.allow : true;
}

export type CrawlerFetch = { path: string; status: number; bytes: number };

export type CrawlerResult = {
  crawler: AiCrawler;
  /** Path → allowed by robots.txt. */
  robots: Record<string, boolean>;
  fetches: CrawlerFetch[];
};

/** Problems for one crawler: blocked by robots.txt, an error status, or much less HTML than a normal visitor gets. */
export function crawlerProblems(result: CrawlerResult, baseline: readonly CrawlerFetch[]): string[] {
  const problems: string[] = [];
  for (const [path, allowed] of Object.entries(result.robots)) {
    if (!allowed) problems.push(`robots.txt blokkeert ${path}`);
  }
  for (const f of result.fetches) {
    const normal = baseline.find((b) => b.path === f.path);
    if (f.status !== 200) problems.push(`${f.path} geeft HTTP ${f.status || 'geen antwoord'}`);
    else if (normal && normal.bytes > 0 && f.bytes < normal.bytes * 0.9) {
      problems.push(`${f.path} geeft veel minder HTML (${f.bytes} tegen ${normal.bytes} bytes)`);
    }
  }
  return problems;
}

/** The report section: one row per crawler. */
export function formatCrawlerSection(results: readonly CrawlerResult[], baseline: readonly CrawlerFetch[]): string {
  const rows = results.map((r) => {
    const problems = crawlerProblems(r, baseline);
    return `| ${r.crawler.name} | ${r.crawler.purpose} | ${problems.length ? `❌ ${problems.join('; ')}` : '✅ toegang, volledige HTML'} |`;
  });
  const blocked = results.filter((r) => crawlerProblems(r, baseline).length > 0).length;
  return [
    '## AI-crawlers en zoekmachines',
    '',
    blocked
      ? `**${blocked} crawler(s) kunnen de site niet (volledig) lezen.** Controleer robots.txt en de instellingen bij Netlify.`
      : 'Alle crawlers mogen de site lezen volgens robots.txt en krijgen dezelfde HTML als een gewone bezoeker.',
    '',
    '| Crawler | Waarvoor | Uitkomst |',
    '|---|---|---|',
    ...rows,
    '',
    '_Gecontroleerd met hun eigen user-agent vanaf GitHub. Een echte crawler komt van eigen IP-adressen; een blokkade op IP-adres (firewall) zie je hier dus niet. /aanbod/ is bewust afgeschermd (noindex) en telt niet mee._',
  ].join('\n');
}
