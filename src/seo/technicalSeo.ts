/**
 * Technical SEO check (read-only): parses crawled pages and turns them into a
 * Dutch report. Pure functions; the crawl itself lives in
 * scripts/technical-seo.ts. Regex parsing is enough here because it only
 * reads our own, server-rendered markup.
 */

export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 158;
export const SLOW_MS = 2000;

export type ParsedPage = {
  title: string | null;
  description: string | null;
  canonical: string | null;
  noindex: boolean;
  h1Count: number;
  links: string[];
  imagesWithoutAlt: number;
};

export type CrawledPage = {
  url: string;
  status: number;
  ms: number;
  /** Final URL after redirects, when it differs. */
  redirectedTo?: string;
  parsed?: ParsedPage;
};

export type LinkCheck = { url: string; status: number; foundOn: string[] };

export type Severity = 'fout' | 'waarschuwing';
export type Finding = { severity: Severity; check: string; url: string; detail?: string };

const decode = (text: string) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

function attributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of tag.matchAll(/([a-zA-Z:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g)) {
    const name = match[1];
    if (name) attrs[name.toLowerCase()] = match[2] ?? match[3] ?? '';
  }
  return attrs;
}

function tags(html: string, name: string): Record<string, string>[] {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map((m) => attributes(m[1] ?? ''));
}

export function parsePage(html: string, pageUrl: string): ParsedPage {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const metas = tags(html, 'meta');
  const description = metas.find((m) => m.name === 'description')?.content;
  const robots = metas.find((m) => m.name === 'robots')?.content ?? '';
  const canonical = tags(html, 'link').find((l) => (l.rel ?? '').split(/\s+/).includes('canonical'))?.href;

  const links = new Set<string>();
  for (const a of tags(html, 'a')) {
    const href = a.href;
    if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) continue;
    try {
      const url = new URL(decode(href), pageUrl);
      url.hash = '';
      links.add(url.href);
    } catch {
      // ignore malformed hrefs
    }
  }

  return {
    title: title === undefined ? null : decode(title),
    description: description === undefined ? null : decode(description),
    canonical: canonical === undefined ? null : new URL(decode(canonical), pageUrl).href,
    noindex: /noindex/i.test(robots),
    h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
    links: [...links],
    imagesWithoutAlt: tags(html, 'img').filter((img) => !('alt' in img)).length,
  };
}

/** Internal links: same host as the site. */
export function internalLinks(pages: CrawledPage[], siteUrl: string): Map<string, string[]> {
  const host = new URL(siteUrl).host;
  const found = new Map<string, string[]>();
  for (const page of pages) {
    for (const link of page.parsed?.links ?? []) {
      if (new URL(link).host !== host) continue;
      const list = found.get(link) ?? [];
      list.push(page.url);
      found.set(link, list);
    }
  }
  return found;
}

const sameUrl = (a: string, b: string) => a.replace(/\/$/, '') === b.replace(/\/$/, '');

export function checkSite(pages: CrawledPage[], links: LinkCheck[]): Finding[] {
  const findings: Finding[] = [];
  const add = (severity: Severity, check: string, url: string, detail?: string) =>
    findings.push({ severity, check, url, ...(detail !== undefined && { detail }) });

  for (const page of pages) {
    if (page.status !== 200) {
      add('fout', 'Pagina uit de sitemap geeft geen 200', page.url, `HTTP ${page.status}`);
      continue;
    }
    if (page.redirectedTo) add('waarschuwing', 'Sitemap-URL wordt doorgestuurd', page.url, page.redirectedTo);
    if (page.ms > SLOW_MS) add('waarschuwing', 'Trage pagina', page.url, `${(page.ms / 1000).toFixed(1).replace('.', ',')} s`);
    const p = page.parsed;
    if (!p) continue;
    if (p.noindex) add('fout', 'Pagina uit de sitemap staat op noindex', page.url);
    if (!p.title) add('fout', 'Geen title', page.url);
    else if (p.title.length > MAX_TITLE_LENGTH) add('waarschuwing', 'Title langer dan 60 tekens', page.url, `${p.title.length} tekens`);
    if (!p.description) add('fout', 'Geen meta description', page.url);
    else if (p.description.length > MAX_DESCRIPTION_LENGTH)
      add('waarschuwing', 'Meta description langer dan 158 tekens', page.url, `${p.description.length} tekens`);
    if (!p.canonical) add('fout', 'Geen canonical', page.url);
    else if (!sameUrl(p.canonical, page.redirectedTo ?? page.url))
      add('fout', 'Canonical wijst naar een andere URL', page.url, p.canonical);
    if (p.h1Count !== 1) add('fout', 'Niet precies één H1', page.url, `${p.h1Count} H1's`);
    if (p.imagesWithoutAlt > 0) add('waarschuwing', 'Afbeelding zonder alt-tekst', page.url, `${p.imagesWithoutAlt}×`);
  }

  for (const field of ['title', 'description'] as const) {
    const byValue = new Map<string, string[]>();
    for (const page of pages) {
      const value = page.parsed?.[field];
      if (!value) continue;
      byValue.set(value, [...(byValue.get(value) ?? []), page.url]);
    }
    for (const [value, urls] of byValue) {
      if (urls.length < 2) continue;
      for (const url of urls)
        add('fout', field === 'title' ? 'Dubbele title' : 'Dubbele meta description', url, `"${value}" (${urls.length}×)`);
    }
  }

  for (const link of links) {
    if (link.status >= 400 || link.status === 0)
      for (const from of link.foundOn) add('fout', 'Kapotte interne link', from, `${link.url} → ${link.status || 'geen antwoord'}`);
  }
  return findings;
}

const path = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

export function formatReport(input: {
  siteUrl: string;
  date: string;
  pages: CrawledPage[];
  linksChecked: number;
  findings: Finding[];
}): string {
  const errors = input.findings.filter((f) => f.severity === 'fout');
  const warnings = input.findings.filter((f) => f.severity === 'waarschuwing');
  const ok200 = input.pages.filter((p) => p.status === 200).length;
  const avgMs = input.pages.length ? Math.round(input.pages.reduce((s, p) => s + p.ms, 0) / input.pages.length) : 0;

  const lines = [
    `# Technical SEO ${input.date}`,
    '',
    `Gecontroleerd: ${input.pages.length} pagina's uit de sitemap van ${input.siteUrl} en ${input.linksChecked} interne links. Alleen lezen; er is niets aan de site veranderd.`,
    '',
    '| | |',
    '|---|---|',
    `| Pagina's met status 200 | ${ok200} van ${input.pages.length} |`,
    `| Fouten | ${errors.length} |`,
    `| Waarschuwingen | ${warnings.length} |`,
    `| Gemiddelde laadtijd HTML | ${avgMs} ms |`,
    '',
  ];

  const section = (title: string, list: Finding[]) => {
    lines.push(`## ${title}`, '');
    if (list.length === 0) {
      lines.push('Geen.', '');
      return;
    }
    const byCheck = new Map<string, Finding[]>();
    for (const f of list) byCheck.set(f.check, [...(byCheck.get(f.check) ?? []), f]);
    for (const [check, items] of byCheck) {
      lines.push(`### ${check} (${items.length})`);
      for (const f of items.slice(0, 25)) lines.push(`- \`${path(f.url)}\`${f.detail ? ` — ${f.detail}` : ''}`);
      if (items.length > 25) lines.push(`- … en ${items.length - 25} meer`);
      lines.push('');
    }
  };
  section('Fouten', errors);
  section('Waarschuwingen', warnings);
  lines.push('_Automatisch gegenereerd door de wekelijkse Technical SEO-agent._');
  return lines.join('\n');
}
