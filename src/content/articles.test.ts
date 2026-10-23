import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import { getArticlesIncludingScheduled } from './index';
import { getBlogPostsIncludingScheduled } from './blog';
import { todayInSiteTimeZone } from './schedule';
import { articleSchema } from './types';
import { VELD, veldFaq } from './veld';
import { ZAAL } from './zaal';

// Scheduled content is checked too, before it goes live.
const ALL = [
  ...getArticlesIncludingScheduled().map((article) => ({
    base: '/kennis',
    article,
  })),
  ...getBlogPostsIncludingScheduled().map((article) => ({
    base: '/blog',
    article,
  })),
];

function linksIn(text: string): string[] {
  return [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1] ?? '');
}

/** The page exists and (for articles and posts) is live on `liveFrom`. */
function internalPathExists(path: string, liveFrom: string): boolean {
  const [pathname = ''] = path.split('?');
  const [, section, slug] = pathname.split('/');
  if (slug === undefined) {
    return existsSync(`src/app/${section}/page.tsx`);
  }
  const liveInTime = (a: { slug: string; publishedAt: string }) =>
    a.slug === slug && a.publishedAt <= liveFrom;
  if (section === 'kennis')
    return getArticlesIncludingScheduled().some(liveInTime);
  if (section === 'blog')
    return getBlogPostsIncludingScheduled().some(liveInTime);
  if (section === 'sticks')
    return getAllProducts().some((p) => p.slug === slug);
  return false;
}

describe('copy of the catalog landing pages', () => {
  // /sticks and /zaalsticks render the same inline links as articles.
  const pages = [
    {
      page: '/sticks',
      text: JSON.stringify([VELD, veldFaq(getAllProducts())]),
    },
    { page: '/zaalsticks', text: JSON.stringify(ZAAL) },
  ];

  it.each(pages)('$page only links to pages that exist', ({ text }) => {
    const today = todayInSiteTimeZone();
    for (const href of linksIn(text).filter((h) => h.startsWith('/'))) {
      expect(internalPathExists(href, today), href).toBe(true);
    }
  });
});

describe('articles and blog posts', () => {
  it.each(ALL)(
    '$base/$article.slug validates against the schema',
    ({ article }) => {
      expect(() => articleSchema.parse(article)).not.toThrow();
    },
  );

  it.each(ALL)(
    '$base/$article.slug only links to pages that exist and are live when it is',
    ({ article }) => {
      // A live page may only link to live pages; a scheduled page to pages live by its date.
      const today = todayInSiteTimeZone();
      const liveFrom =
        article.publishedAt > today ? article.publishedAt : today;
      const text = JSON.stringify([article.intro, article.sections]);
      for (const href of linksIn(text).filter((h) => h.startsWith('/'))) {
        expect(internalPathExists(href, liveFrom), href).toBe(true);
      }
    },
  );

  it.each(ALL)(
    '$base/$article.slug keeps sources out of the text and lists them below',
    ({ article }) => {
      // House style (docs/content-agent.md §3): no "[Bron: …]" links or
      // external links in the running text; sources go in the list below.
      const text = JSON.stringify([article.intro, article.sections]);
      expect(linksIn(text).filter((h) => h.startsWith('http'))).toEqual([]);
      expect(text).not.toContain('[Bron:');
      expect(article.sources.length).toBeGreaterThan(0);
    },
  );

  it.each(ALL)(
    '$base/$article.slug links to the stickwijzer',
    ({ article }) => {
      expect(JSON.stringify(article.sections)).toContain('](/stickwijzer)');
    },
  );

  it('uses unique slugs per section', () => {
    for (const list of [
      getArticlesIncludingScheduled(),
      getBlogPostsIncludingScheduled(),
    ]) {
      const slugs = list.map((a) => a.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});
