/**
 * The site configuration of the marketing engine (docs/marketing/bouwplan-2.0.md,
 * fase 4): everything that belongs to one website lives in
 * marketing/sites/<site>.json, with its schema in siteConfigSchema.ts. The
 * engine modules (calendar, research, learning, abtest, metricoolBudget,
 * voorstellenIssue, kpi, editorCheck) read only this configuration, so the
 * engine can serve another site by adding one file. A test keeps words of this
 * site's subject out of them. No runtime dependency: the types are erased.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MarketConfig, SiteConfig } from './siteConfigSchema';

export type { MarketConfig, SiteConfig } from './siteConfigSchema';

/** The configuration of a site, from marketing/sites/<site>.json (from the repo root). Checked by the tests (parseSiteConfig), not here. */
/** The site the engine serves: MARKETING_SITE, else the name in marketing/sites/standaard.txt. */
export function defaultSite(root = process.cwd()): string {
  return (process.env.MARKETING_SITE || readFileSync(join(root, 'marketing', 'sites', 'standaard.txt'), 'utf8')).trim();
}

export function loadSiteConfig(site = defaultSite(), root = process.cwd()): SiteConfig {
  if (!/^[a-z0-9-]{1,40}$/.test(site)) throw new Error(`Ongeldige site: ${site}`);
  return JSON.parse(readFileSync(join(root, 'marketing', 'sites', `${site}.json`), 'utf8')) as SiteConfig;
}

export function market(config: SiteConfig, marketId: string): MarketConfig {
  const m = config.markten.find((x) => x.id === marketId);
  if (!m) throw new Error(`Onbekende markt: ${marketId}`);
  return m;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A text in the words of a market: longer words first, whole words only, the capital kept. */
export function localize(text: string, m: MarketConfig): string {
  const pairs = Object.entries(m.woordenlijst).sort((a, b) => b[0].length - a[0].length);
  let out = text;
  for (const [from, to] of pairs) {
    out = out.replace(new RegExp(`(?<![\\p{L}\\d])${escape(from)}(?![\\p{L}\\d])`, 'giu'), (hit) =>
      hit[0] === hit[0]!.toUpperCase() && hit[0] !== hit[0]!.toLowerCase() ? to[0]!.toUpperCase() + to.slice(1) : to,
    );
  }
  return out;
}

/** Home-market words left in a text for this market: each one should have been localised. */
export function foreignWords(text: string, m: MarketConfig): string[] {
  return Object.keys(m.woordenlijst).filter((w) => new RegExp(`(?<![\\p{L}\\d])${escape(w)}(?![\\p{L}\\d])`, 'iu').test(text));
}

/** The claim patterns of the site as one expression. */
export const claimPattern = (config: SiteConfig) => new RegExp(config.verbodenClaims.join('|'), 'i');
