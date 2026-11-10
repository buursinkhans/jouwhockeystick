// Weekly Bing report (read-only). Reads the Bing Webmaster API with the key
// from BING_WEBMASTER_API_KEY and prints a Markdown report for the last
// complete week (Monday to Sunday). Only GET requests. The key goes in the
// query string, so every error message passes through redact() first.
// Run with: npm run seo:bing
import { writeFileSync } from 'node:fs';
import type { z } from 'zod';
import {
  dayRows,
  formatBingReport,
  lastWeek,
  redact,
  registeredSite,
  SitesAnswer,
  StatsAnswer,
  statRows,
  TrafficAnswer,
  type Part,
} from '../src/marketing/bingReport';
import { loadSiteConfig } from '../src/marketing/siteConfig';

const API = 'https://ssl.bing.com/webmaster/api.svc/json';
const KEY = process.env.BING_WEBMASTER_API_KEY;

async function get<S extends z.ZodType>(method: string, schema: S, siteUrl?: string): Promise<Part<z.infer<S>>> {
  if (!KEY) return { ok: false, reden: 'BING_WEBMASTER_API_KEY ontbreekt (GitHub Secrets).' };
  const params = new URLSearchParams({ apikey: KEY });
  if (siteUrl) params.set('siteUrl', siteUrl);
  try {
    const res = await fetch(`${API}/${method}?${params}`, { headers: { Accept: 'application/json' } });
    const text = await res.text();
    if (!res.ok) {
      // Bing answers errors as {"ErrorCode":3,"Message":"InvalidApiKey"}; show only the message.
      let msg = '';
      try {
        const body = JSON.parse(text) as { Message?: unknown };
        if (typeof body.Message === 'string') msg = `: ${body.Message.slice(0, 120)}`;
      } catch {
        /* not JSON */
      }
      return { ok: false, reden: redact(`${method} gaf HTTP ${res.status}${msg}.`, KEY) };
    }
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success) return { ok: false, reden: `${method}: antwoord had een onverwachte vorm (${redact(parsed.error.issues[0]?.message ?? '', KEY)}).` };
    return { ok: true, value: parsed.data };
  } catch (e) {
    // Never print the error object itself: it may hold the request url.
    return { ok: false, reden: `${method} kon niet worden gelezen (${e instanceof Error ? redact(e.name, KEY) : 'onbekende fout'}).` };
  }
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const { week, van, tot } = lastWeek(today);
  const config = loadSiteConfig();

  const sites = await get('GetUserSites', SitesAnswer);
  const site = sites.ok ? registeredSite(sites.value, config.merk.domein) : null;
  const noSite: Part<never> = {
    ok: false,
    reden: sites.ok ? `${config.merk.domein} staat niet bij de sites van deze sleutel in Bing Webmaster Tools.` : sites.reden,
  };

  const map = <T, U>(p: Part<T>, f: (v: T) => U): Part<U> => (p.ok ? { ok: true, value: f(p.value) } : p);
  const traffic = site ? map(await get('GetRankAndTrafficStats', TrafficAnswer, site), dayRows) : noSite;
  const queries = site ? map(await get('GetQueryStats', StatsAnswer, site), statRows) : noSite;
  const pages = site ? map(await get('GetPageStats', StatsAnswer, site), statRows) : noSite;

  process.stdout.write(`${formatBingReport({ week, van, tot, site, traffic, queries, pages, aiNagekeken: '2026-11-10' })}\n`);
  // The issue title for the workflow, in a file so it stays out of the body.
  if (process.env.BING_TITLE_FILE) writeFileSync(process.env.BING_TITLE_FILE, `Bing-rapport ${week}\n`);
  if (!site || !traffic.ok || !queries.ok || !pages.ok) process.exitCode = 2;
}

main().catch((e: unknown) => {
  process.stderr.write(`Bing-rapport mislukt: ${e instanceof Error ? redact(e.message, KEY) : 'onbekende fout'}\n`);
  process.exit(1);
});
