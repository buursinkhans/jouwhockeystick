/**
 * Reads and writes the imported Google Trends exports in data/trends/ (one JSON file per
 * export). Node only: used by scripts/trends-import.ts and scripts/seo-opportunities.ts,
 * never by the site. A Trends export is a public, aggregated index, so these files are
 * committed to the repository (unlike Search Console or PostHog figures).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TrendExport } from './trends';

export const TRENDS_DIR = 'data/trends';

export type Loaded = { exports: TrendExport[]; problems: string[] };

/** Every valid export in the folder; a file that does not fit the format is reported, not read. */
export function readTrendExports(dir: string = TRENDS_DIR): Loaded {
  if (!existsSync(dir)) return { exports: [], problems: [] };
  const exports: TrendExport[] = [];
  const problems: string[] = [];
  for (const name of readdirSync(dir).filter((file) => file.endsWith('.json')).sort()) {
    try {
      const parsed = TrendExport.safeParse(JSON.parse(readFileSync(join(dir, name), 'utf8')));
      if (parsed.success) exports.push(parsed.data);
      else problems.push(`${name}: past niet bij het formaat`);
    } catch {
      problems.push(`${name}: geen geldige JSON`);
    }
  }
  return { exports, problems };
}

export const fileNameOf = (e: Pick<TrendExport, 'thema' | 'geexporteerd'>) =>
  `${e.thema.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${e.geexporteerd}.json`;

/** Writes one export; `replace` removes the file of an older export of the same comparison first. */
export function writeTrendExport(e: TrendExport, replace: TrendExport | null, dir: string = TRENDS_DIR): string {
  mkdirSync(dir, { recursive: true });
  if (replace) rmSync(join(dir, fileNameOf(replace)), { force: true });
  const path = join(dir, fileNameOf(e));
  writeFileSync(path, `${JSON.stringify(e)}\n`);
  return path;
}
