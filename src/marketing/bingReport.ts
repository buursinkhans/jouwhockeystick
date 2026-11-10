/**
 * The weekly Bing report (docs/marketing/bouwplan-2.0.md, Bing-rapport):
 * clicks, impressions, CTR and average position of the last week next to the
 * week before, the top queries and pages, and queries that grow or are new.
 * Read-only: the script (scripts/bing-webmaster-report.ts) fetches the Bing
 * Webmaster API; this module validates the answers with Zod and builds the
 * Markdown. Pure: no clock and no network inside. Missing data is shown as
 * "ontbreekt", never as zero.
 */
import { z } from 'zod';

/** Microsoft JSON date: "/Date(1399100400000)/" or "/Date(1399100400000-0700)/". The number is UTC milliseconds. */
const MsDate = z.string().transform((s, ctx) => {
  const m = /\/Date\((-?\d+)(?:[+-]\d{4})?\)\//.exec(s);
  if (!m) {
    ctx.addIssue({ code: 'custom', message: `Onbekende datum: ${s.slice(0, 40)}` });
    return z.NEVER;
  }
  return new Date(Number(m[1])).toISOString().slice(0, 10);
});

const num = z.number().finite();

/** GetUserSites: the sites of the key's owner. */
export const SitesAnswer = z.object({
  d: z.array(z.object({ Url: z.string(), IsVerified: z.boolean().optional() }).passthrough()),
});

/** GetQueryStats and GetPageStats: one row per query (or page, in `Query`) per weekly bucket. */
export const StatsAnswer = z.object({
  d: z.array(
    z
      .object({
        Query: z.string(),
        Date: MsDate,
        Clicks: num,
        Impressions: num,
        AvgClickPosition: num.optional(),
        AvgImpressionPosition: num.optional(),
      })
      .passthrough(),
  ),
});

/** GetRankAndTrafficStats: clicks and impressions per day for the whole site. */
export const TrafficAnswer = z.object({
  d: z.array(z.object({ Date: MsDate, Clicks: num, Impressions: num }).passthrough()),
});

export type StatRow = { key: string; date: string; clicks: number; impressions: number; position: number | null };
export type DayRow = { date: string; clicks: number; impressions: number };

export const statRows = (a: z.infer<typeof StatsAnswer>): StatRow[] =>
  a.d.map((r) => ({
    key: r.Query,
    date: r.Date,
    clicks: r.Clicks,
    impressions: r.Impressions,
    // Bing sends 0 or -1 when it has no position.
    position: typeof r.AvgImpressionPosition === 'number' && r.AvgImpressionPosition > 0 ? r.AvgImpressionPosition : null,
  }));

export const dayRows = (a: z.infer<typeof TrafficAnswer>): DayRow[] =>
  a.d.map((r) => ({ date: r.Date, clicks: r.Clicks, impressions: r.Impressions }));

const normalize = (url: string) => url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');

/** The registered site url for a domain, as Bing has it (with its own scheme, www and slash), or null. */
export function registeredSite(sites: z.infer<typeof SitesAnswer>, domain: string): string | null {
  const want = normalize(domain);
  const hits = sites.d.filter((s) => normalize(s.Url) === want);
  return (hits.find((s) => s.IsVerified !== false) ?? hits[0])?.Url ?? null;
}

// ---- weeks ----

const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** ISO week of a date, e.g. "2026-W46". */
export function isoWeek(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day); // the Thursday of this week
  const year = d.getUTCFullYear();
  const week = Math.ceil(((d.getTime() - Date.UTC(year, 0, 1)) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** The last complete week (Monday to Sunday) before `today`. */
export function lastWeek(today: string): { week: string; van: string; tot: string } {
  const day = new Date(`${today}T00:00:00Z`).getUTCDay() || 7; // 1 = Monday
  const tot = addDays(today, -day); // the Sunday before
  return { week: isoWeek(tot), van: addDays(tot, -6), tot };
}

// ---- totals ----

export type Totals = { clicks: number; impressions: number; ctr: number | null; position: number | null };

/** Clicks and impressions of the days in [van, tot]; null when Bing has no day in that range. */
export function trafficTotals(days: readonly DayRow[], van: string, tot: string): Omit<Totals, 'position'> | null {
  const inRange = days.filter((d) => d.date >= van && d.date <= tot);
  if (!inRange.length) return null;
  const clicks = inRange.reduce((a, d) => a + d.clicks, 0);
  const impressions = inRange.reduce((a, d) => a + d.impressions, 0);
  return { clicks, impressions, ctr: impressions > 0 ? clicks / impressions : null };
}

/** The weekly buckets in the rows, newest first. */
export const buckets = (rows: readonly StatRow[]) => [...new Set(rows.map((r) => r.date))].sort().reverse();

/** Average position over the rows of one bucket, weighted by impressions; null without positions. */
export function weightedPosition(rows: readonly StatRow[], bucket: string): number | null {
  const r = rows.filter((x) => x.date === bucket && x.position !== null && x.impressions > 0);
  const w = r.reduce((a, x) => a + x.impressions, 0);
  return w > 0 ? r.reduce((a, x) => a + (x.position as number) * x.impressions, 0) / w : null;
}

// ---- top lists and growth ----

type Agg = { key: string; clicks: number; impressions: number; position: number | null };

function aggregate(rows: readonly StatRow[], bucket: string): Map<string, Agg> {
  const out = new Map<string, Agg & { posWeight: number; posSum: number }>();
  for (const r of rows) {
    if (r.date !== bucket) continue;
    const a = out.get(r.key) ?? { key: r.key, clicks: 0, impressions: 0, position: null, posWeight: 0, posSum: 0 };
    a.clicks += r.clicks;
    a.impressions += r.impressions;
    if (r.position !== null && r.impressions > 0) {
      a.posSum += r.position * r.impressions;
      a.posWeight += r.impressions;
    }
    a.position = a.posWeight > 0 ? a.posSum / a.posWeight : null;
    out.set(r.key, a);
  }
  return new Map([...out].map(([k, a]) => [k, { key: a.key, clicks: a.clicks, impressions: a.impressions, position: a.position }]));
}

/** The top `n` of a bucket: most clicks, then most impressions. */
export function top(rows: readonly StatRow[], bucket: string, n = 20): Agg[] {
  return [...aggregate(rows, bucket).values()]
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions || a.key.localeCompare(b.key))
    .slice(0, n);
}

export type Growth = { key: string; nu: number; ervoor: number; nieuw: boolean };

/** Thresholds for "grows": at least this many more impressions, and at least this share more. */
export const GROWTH = { minExtra: 3, minShare: 0.5 } as const;

/**
 * Queries that are new in the latest bucket (no impressions the bucket before)
 * or that grow (GROWTH). Biggest increase first. Without a bucket before,
 * nothing can be called new: then the list is empty.
 */
export function growing(rows: readonly StatRow[], now: string, before: string | null, n = 20): Growth[] {
  if (!before) return [];
  const a = aggregate(rows, now);
  const b = aggregate(rows, before);
  const out: Growth[] = [];
  for (const x of a.values()) {
    const prev = b.get(x.key)?.impressions ?? 0;
    if (x.impressions <= 0) continue;
    if (prev === 0) out.push({ key: x.key, nu: x.impressions, ervoor: 0, nieuw: true });
    else if (x.impressions - prev >= GROWTH.minExtra && x.impressions >= prev * (1 + GROWTH.minShare))
      out.push({ key: x.key, nu: x.impressions, ervoor: prev, nieuw: false });
  }
  return out.sort((p, q) => q.nu - q.ervoor - (p.nu - p.ervoor) || p.key.localeCompare(q.key)).slice(0, n);
}

// ---- report ----

/** One part of the data: present, or missing with the reason (never contains the API key). */
export type Part<T> = { ok: true; value: T } | { ok: false; reden: string };

export type ReportInput = {
  week: string;
  van: string;
  tot: string;
  site: string | null;
  traffic: Part<DayRow[]>;
  queries: Part<StatRow[]>;
  pages: Part<StatRow[]>;
  /** When the AI Performance answer below was last checked (YYYY-MM-DD). */
  aiNagekeken: string;
};

const MISSING = 'ontbreekt';
const nl = (n: number, digits = 0) => n.toLocaleString('nl-NL', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const pct = (x: number | null) => (x === null ? MISSING : `${nl(x * 100, 1)}%`);
const pos = (x: number | null) => (x === null ? MISSING : nl(x, 1));
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ').slice(0, 120);

/** The sources on which the AI Performance answer rests. */
export const AI_SOURCES = [
  'https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api.interfaces.iwebmasterapi?view=bing-webmaster-dotnet',
  'https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview',
] as const;

export function formatBingReport(r: ReportInput): string {
  const lines: string[] = [`# Bing-rapport ${r.week}`, ''];
  lines.push(`Week ${r.week} (${r.van} t/m ${r.tot}) naast de week ervoor. Site in Bing Webmaster Tools: ${r.site ?? MISSING}. Dit rapport leest alleen.`, '');

  // Totals
  lines.push('## Totaal', '');
  const prevVan = addDays(r.van, -7);
  const prevTot = addDays(r.tot, -7);
  const now = r.traffic.ok ? trafficTotals(r.traffic.value, r.van, r.tot) : null;
  const before = r.traffic.ok ? trafficTotals(r.traffic.value, prevVan, prevTot) : null;
  const qb = r.queries.ok ? buckets(r.queries.value) : [];
  const posNow = r.queries.ok && qb[0] ? weightedPosition(r.queries.value, qb[0]) : null;
  const posBefore = r.queries.ok && qb[1] ? weightedPosition(r.queries.value, qb[1]) : null;
  lines.push('| Cijfer | Deze week | Week ervoor |', '|---|---:|---:|');
  lines.push(`| Kliks | ${now ? nl(now.clicks) : MISSING} | ${before ? nl(before.clicks) : MISSING} |`);
  lines.push(`| Vertoningen | ${now ? nl(now.impressions) : MISSING} | ${before ? nl(before.impressions) : MISSING} |`);
  lines.push(`| CTR | ${now ? pct(now.ctr) : MISSING} | ${before ? pct(before.ctr) : MISSING} |`);
  lines.push(`| Gemiddelde positie | ${pos(posNow)} | ${pos(posBefore)} |`);
  lines.push('');
  if (!r.traffic.ok) lines.push(`Kliks en vertoningen ontbreken: ${r.traffic.reden}`, '');
  lines.push(
    `Kliks en vertoningen per dag uit GetRankAndTrafficStats. De positie is het gemiddelde over de zoekvragen, gewogen naar vertoningen, uit de laatste twee Bing-weken van GetQueryStats${qb[0] ? ` (tot ${qb[0]}${qb[1] ? ` en tot ${qb[1]}` : ''})` : ''}. Bing telt een week anders dan maandag tot en met zondag.`,
    '',
  );

  // Top lists
  const topTable = (title: string, label: string, part: Part<StatRow[]>) => {
    lines.push(`## ${title}`, '');
    if (!part.ok) return lines.push(`Ontbreekt: ${part.reden}`, '');
    const b = buckets(part.value)[0];
    if (!b) return lines.push('Ontbreekt: Bing gaf geen rijen.', '');
    lines.push(`Bing-week tot ${b}.`, '', `| ${label} | Kliks | Vertoningen | CTR | Positie |`, '|---|---:|---:|---:|---:|');
    for (const x of top(part.value, b)) {
      lines.push(`| ${cell(x.key)} | ${nl(x.clicks)} | ${nl(x.impressions)} | ${pct(x.impressions > 0 ? x.clicks / x.impressions : null)} | ${pos(x.position)} |`);
    }
    lines.push('');
  };
  topTable('Top 20 zoekvragen', 'Zoekvraag', r.queries);
  topTable("Top 20 pagina's", 'Pagina', r.pages);

  // Growth
  lines.push('## Zoekvragen die groeien of nieuw zijn', '');
  if (!r.queries.ok) lines.push(`Ontbreekt: ${r.queries.reden}`, '');
  else if (qb.length < 2) lines.push('Ontbreekt: er is nog geen Bing-week ervoor om mee te vergelijken.', '');
  else {
    const g = growing(r.queries.value, qb[0]!, qb[1]!);
    if (!g.length) lines.push(`Geen zoekvraag groeide met minstens ${GROWTH.minExtra} vertoningen en ${GROWTH.minShare * 100}%, en er is geen nieuwe.`, '');
    else {
      lines.push(`Vertoningen in de Bing-week tot ${qb[0]} tegenover die tot ${qb[1]}. Groeien is minstens ${GROWTH.minExtra} vertoningen en ${GROWTH.minShare * 100}% meer.`, '');
      lines.push('| Zoekvraag | Nu | Ervoor | |', '|---|---:|---:|---|');
      for (const x of g) lines.push(`| ${cell(x.key)} | ${nl(x.nu)} | ${nl(x.ervoor)} | ${x.nieuw ? 'nieuw' : 'groeit'} |`);
      lines.push('');
    }
  }

  // AI Performance
  lines.push('## Citaties in Copilot (AI Performance)', '');
  lines.push(
    `Ontbreekt: het AI Performance-rapport is niet via de Bing Webmaster API te lezen. De lijst met methoden van de API heeft geen methode voor citaties, Copilot of grounding-zoekvragen; het rapport staat alleen in de webomgeving van Bing Webmaster Tools. Nagekeken op ${r.aiNagekeken}. Bronnen: ${AI_SOURCES.join(' en ')}.`,
    '',
  );

  // Machine-readable numbers for the Weekrapport and the Onderzoeker.
  const data = {
    week: r.week,
    kliks: now?.clicks ?? null,
    vertoningen: now?.impressions ?? null,
    groei: r.queries.ok && qb.length >= 2 ? growing(r.queries.value, qb[0]!, qb[1]!).map((x) => x.key) : null,
  };
  lines.push(`<!-- bingcijfers ${JSON.stringify(data).replace(/--/g, '- -')} -->`);
  return lines.join('\n');
}

/** Removes the key from any text before it reaches a log or an issue. */
export function redact(text: string, secret: string | undefined): string {
  let out = text.replace(/apikey=[^&\s"']+/gi, 'apikey=***');
  if (secret) out = out.split(secret).join('***');
  return out;
}
