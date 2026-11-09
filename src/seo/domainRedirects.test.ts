import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SITE_URL } from '@/lib/site';

/**
 * Checks the domain-level redirects in netlify.toml (decision log 2026-11-09,
 * "Extra domeinen"). The rules are read from the file and replayed with
 * Netlify's matching: top to bottom, first match wins, "/*" fills ":splat",
 * and the query string is passed on for a 301. What this cannot check is the
 * live behaviour (DNS, certificates, domain aliases in Netlify); that is
 * scripts/check-domain-redirects.sh, after deployment.
 */

const ROOT = join(__dirname, '..', '..');
const PRIMARY_HOST = new URL(SITE_URL).host;
const EXTRA_DOMAINS = [
  'jouwhockeystick.info',
  'jouwhockeystick.be',
  'jouwhockeystick.com',
  'jouwhockeystick.store',
  'jouwhockeyschoenen.nl',
] as const;
const SHOES_DOMAIN = 'jouwhockeyschoenen.nl';

type Rule = { from: string; to: string; status: number; force: boolean };

/** Reads the [[redirects]] tables of netlify.toml (flat key = value lines only). */
function readRules(): Rule[] {
  const toml = readFileSync(join(ROOT, 'netlify.toml'), 'utf8');
  const tables: Record<string, string>[] = [];
  let current: Record<string, string> | null = null;
  for (const raw of toml.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('[')) {
      current = line === '[[redirects]]' ? {} : null;
      if (current) tables.push(current);
      continue;
    }
    const [, key, value] = /^(\w+)\s*=\s*(.+)$/.exec(line) ?? [];
    if (current && key && value) current[key] = value;
  }
  return tables.map((raw) => ({
    from: readString(raw, 'from'),
    to: readString(raw, 'to'),
    status: Number(raw.status),
    force: raw.force === 'true',
  }));
}

function readString(table: Record<string, string>, key: string): string {
  const value = table[key];
  if (value === undefined) throw new Error(`redirect without "${key}"`);
  return JSON.parse(value) as string;
}

const RULES = readRules();

/** Netlify's answer for a request URL, or null when no rule applies. */
function resolve(requestUrl: string): { status: number; location: string } | null {
  const url = new URL(requestUrl);
  for (const rule of RULES) {
    const from = new URL(rule.from.replace(/\*$/, ''));
    if (from.protocol !== url.protocol || from.host !== url.host) continue;
    const isSplat = rule.from.endsWith('/*');
    if (isSplat ? !url.pathname.startsWith(from.pathname) : from.pathname !== url.pathname) {
      continue;
    }
    const splat = url.pathname.slice(from.pathname.length);
    const target = rule.to.replace(':splat', splat);
    return { status: rule.status, location: target + url.search };
  }
  return null;
}

/** Existing pages, so the tests never expect a redirect to a missing route. */
const PAGES = ['/', '/zaalsticks', '/stickwijzer', '/kennis', '/sticks', '/hockeyschoenen', '/hockeyschoenen/wijzer'];

describe('domain redirects in netlify.toml', () => {
  it('only uses forced, permanent 301 rules', () => {
    expect(RULES.length).toBe(EXTRA_DOMAINS.length * 4 + 4);
    for (const rule of RULES) {
      expect(rule.status, rule.from).toBe(301);
      expect(rule.force, rule.from).toBe(true);
    }
  });

  it('tests only pages that exist', () => {
    for (const page of PAGES) {
      expect(existsSync(join(ROOT, 'src', 'app', page, 'page.tsx')), page).toBe(true);
    }
  });

  for (const domain of EXTRA_DOMAINS) {
    for (const host of [domain, `www.${domain}`]) {
      for (const protocol of ['http', 'https']) {
        it(`${protocol}://${host} goes to ${PRIMARY_HOST} in one 301`, () => {
          for (const page of PAGES) {
            const expectedPath =
              page === '/' && domain === SHOES_DOMAIN ? '/hockeyschoenen' : page;
            expect(resolve(`${protocol}://${host}${page}`), page).toEqual({
              status: 301,
              location: `${SITE_URL}${expectedPath}`,
            });
          }
          expect(resolve(`${protocol}://${host}/zaalsticks?utm_source=x&a=1`)).toEqual({
            status: 301,
            location: `${SITE_URL}/zaalsticks?utm_source=x&a=1`,
          });
          const home = domain === SHOES_DOMAIN ? '/hockeyschoenen' : '/';
          expect(resolve(`${protocol}://${host}/?ref=flyer`)?.location).toBe(
            `${SITE_URL}${home}?ref=flyer`,
          );
        });
      }
    }
  }

  it('never redirects the primary domain or the Netlify address', () => {
    for (const host of [PRIMARY_HOST, `www.${PRIMARY_HOST}`, 'jouwhockeystick.netlify.app']) {
      for (const protocol of ['http', 'https']) {
        for (const page of PAGES) {
          expect(resolve(`${protocol}://${host}${page}`), `${host}${page}`).toBeNull();
        }
      }
    }
  });

  it('always lands on https://jouwhockeystick.nl, so there is no loop or chain', () => {
    for (const rule of RULES) {
      const target = new URL(rule.to.replace(':splat', ''));
      expect(target.origin, rule.from).toBe(SITE_URL);
      expect(resolve(rule.to.replace(':splat', 'zaalsticks'))).toBeNull();
    }
  });
});
