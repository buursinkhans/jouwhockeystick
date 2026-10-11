/**
 * Market scan (read-only): compares this week's snapshot of competitors'
 * hockey pages and bol.com's most popular hockey sticks with last week's,
 * and writes a Dutch report. Pure functions; fetching lives in
 * scripts/market-scan.ts.
 */

export type SiteSnapshot = {
  /** Display name, e.g. "PassaSports". */
  site: string;
  /** Hockey-related page URLs from the site's sitemaps, without query strings. */
  urls: string[];
  /** Set when the site could not be read this week. */
  error?: string;
};

export type BolItem = {
  ean: string;
  title: string;
  rank: number;
  price?: number;
  url?: string;
};

export type BolList = { query: string; items: BolItem[]; error?: string };

export type MarketSnapshot = {
  date: string;
  sites: SiteSnapshot[];
  bol: BolList[];
};

const HOCKEY = /hockey/i;

/** Keep hockey pages only; strip query and hash so URLs compare cleanly. */
export function hockeyUrls(urls: string[]): string[] {
  const out = new Set<string>();
  for (const raw of urls) {
    try {
      const url = new URL(raw.trim());
      url.search = '';
      url.hash = '';
      if (HOCKEY.test(url.pathname)) out.add(url.href);
    } catch {
      // ignore malformed entries
    }
  }
  return [...out].sort();
}

/** `Sitemap:` lines from robots.txt, limited to the given host. */
export function sitemapsFromRobots(robots: string, host: string): string[] {
  return robots
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*sitemap:\s*(\S+)/i)?.[1])
    .filter((url): url is string => {
      if (!url) return false;
      try {
        return new URL(url).host === host;
      } catch {
        return false;
      }
    });
}

/** `<loc>` values of a sitemap or sitemap index, and whether it is an index. */
export function parseSitemap(xml: string): { isIndex: boolean; locs: string[] } {
  const locs = [...xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)\s*(?:\]\]>)?\s*<\/loc>/g)].map(
    (m) => (m[1] ?? '').replace(/&amp;/g, '&'),
  );
  return { isIndex: /<sitemapindex[\s>]/i.test(xml), locs };
}

/** A readable label from a URL slug: ".../grays-gr-5000-probow-hockeystick" → "grays gr 5000 probow hockeystick". */
export function labelFromUrl(url: string): string {
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    const last = segments.at(-1) ?? '';
    return decodeURIComponent(last).replace(/\.html?$/i, '').replace(/[-_]+/g, ' ').trim() || url;
  } catch {
    return url;
  }
}

export type SiteDiff = { site: string; added: string[]; removed: string[]; total: number; error?: string; baseline: boolean };

export function diffSites(previous: SiteSnapshot[] | undefined, current: SiteSnapshot[]): SiteDiff[] {
  return current.map((site) => {
    const before = previous?.find((p) => p.site === site.site);
    if (site.error) return { site: site.site, added: [], removed: [], total: 0, error: site.error, baseline: false };
    if (!before || before.error) return { site: site.site, added: [], removed: [], total: site.urls.length, baseline: true };
    const old = new Set(before.urls);
    const now = new Set(site.urls);
    return {
      site: site.site,
      added: site.urls.filter((u) => !old.has(u)),
      removed: before.urls.filter((u) => !now.has(u)),
      total: site.urls.length,
      baseline: false,
    };
  });
}

export type BolChange =
  | { kind: 'nieuw'; query: string; item: BolItem }
  | { kind: 'gestegen'; query: string; item: BolItem; from: number }
  | { kind: 'prijs'; query: string; item: BolItem; from: number };

/** New entries in the top list, climbs of 10+ places, and price changes of 10%+. */
export function diffBol(previous: BolList[] | undefined, current: BolList[]): { changes: BolChange[]; baseline: boolean } {
  const changes: BolChange[] = [];
  let baseline = false;
  for (const list of current) {
    if (list.error) continue;
    const before = previous?.find((p) => p.query === list.query && !p.error);
    if (!before) {
      baseline = true;
      continue;
    }
    const old = new Map(before.items.map((i) => [i.ean, i]));
    for (const item of list.items) {
      const prev = old.get(item.ean);
      if (!prev) changes.push({ kind: 'nieuw', query: list.query, item });
      else {
        if (prev.rank - item.rank >= 10) changes.push({ kind: 'gestegen', query: list.query, item, from: prev.rank });
        if (prev.price && item.price && Math.abs(item.price - prev.price) / prev.price >= 0.1)
          changes.push({ kind: 'prijs', query: list.query, item, from: prev.price });
      }
    }
  }
  return { changes, baseline };
}

const euro = (n?: number) => (n === undefined ? '–' : `€${n.toFixed(2).replace('.', ',')}`);
const LIST_LIMIT = 25;

export function formatMarketReport(previous: MarketSnapshot | undefined, current: MarketSnapshot): {
  markdown: string;
  hasChanges: boolean;
} {
  const sites = diffSites(previous?.sites, current.sites);
  const bol = diffBol(previous?.bol, current.bol);
  const lines = [
    `# Marktverkenning ${current.date}`,
    '',
    previous
      ? `Vergeleken met ${previous.date}. Alleen lezen: openbare sitemaps van concurrenten en de bol.com-API.`
      : 'Nulmeting: dit is de eerste keer. Vanaf volgende week zie je hier wat er veranderd is.',
    '',
    '## Concurrenten',
    '',
    '| Winkel | Hockeypagina’s | Nieuw | Verdwenen |',
    '|---|---|---|---|',
    ...sites.map((s) =>
      s.error
        ? `| ${s.site} | ⚠️ niet gelezen: ${s.error} | | |`
        : `| ${s.site} | ${s.total} | ${s.baseline ? 'nulmeting' : s.added.length} | ${s.baseline ? '' : s.removed.length} |`,
    ),
    '',
  ];
  for (const s of sites) {
    if (s.added.length === 0) continue;
    lines.push(`### Nieuw bij ${s.site} (${s.added.length})`);
    for (const url of s.added.slice(0, LIST_LIMIT)) lines.push(`- [${labelFromUrl(url)}](${url})`);
    if (s.added.length > LIST_LIMIT) lines.push(`- … en ${s.added.length - LIST_LIMIT} meer`);
    lines.push('');
  }

  lines.push('## bol.com: populairste hockeysticks', '');
  for (const list of current.bol) {
    if (list.error) {
      lines.push(`- "${list.query}": ⚠️ niet gelezen: ${list.error}`);
      continue;
    }
    lines.push(`**Top 10 voor "${list.query}"**`, '');
    for (const item of list.items.slice(0, 10)) lines.push(`${item.rank}. ${item.title} — ${euro(item.price)}`);
    lines.push('');
  }
  if (bol.changes.length) {
    lines.push('### Verschuivingen sinds vorige week', '');
    for (const c of bol.changes.slice(0, LIST_LIMIT)) {
      if (c.kind === 'nieuw') lines.push(`- **Nieuw in de top** ("${c.query}", #${c.item.rank}): ${c.item.title}`);
      if (c.kind === 'gestegen') lines.push(`- **Gestegen** ("${c.query}", #${c.from} → #${c.item.rank}): ${c.item.title}`);
      if (c.kind === 'prijs') lines.push(`- **Prijs** ${euro(c.from)} → ${euro(c.item.price)}: ${c.item.title}`);
    }
    lines.push('');
  } else if (!bol.baseline && previous) {
    lines.push('Geen grote verschuivingen in de top sinds vorige week.', '');
  }

  lines.push('_Automatisch gegenereerd door de wekelijkse Marktverkenner. Prijzen zijn bol.com-prijzen op het moment van meten._');
  const hasChanges = sites.some((s) => s.added.length > 0 || s.removed.length > 0) || bol.changes.length > 0;
  return { markdown: lines.join('\n'), hasChanges };
}
