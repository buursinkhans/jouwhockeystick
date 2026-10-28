import { describe, expect, it } from 'vitest';
import { getAllArticles } from '@/content';
import { VELD } from '@/content/veld';
import sitemap from './sitemap';

describe('sitemap', () => {
  const entries = sitemap();
  const at = (path: string) => entries.find((e) => e.url === `https://jouwhockeystick.nl${path === '/' ? '' : path}` || e.url === `https://jouwhockeystick.nl${path}`);

  it('gives hub pages the date they show themselves, and the newest article for /kennis', () => {
    expect(at('/sticks')?.lastModified).toBe(VELD.updatedAt);
    const newest = getAllArticles().map((a) => a.updatedAt).sort().pop();
    expect(at('/kennis')?.lastModified).toBe(newest);
  });

  it('leaves pages without a real date without lastmod, and lists every URL once', () => {
    expect(at('/stickwijzer')?.lastModified).toBeUndefined();
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.some((u) => u.includes('/aanbod/'))).toBe(false);
  });
});
