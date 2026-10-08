import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getAllProducts } from '@/catalog';
import { getAllArticles } from './index';
import { getAllBlogPosts } from './blog';
import { articleSchema } from './types';

const ALL = [
  ...getAllArticles().map((article) => ({ base: '/kennis', article })),
  ...getAllBlogPosts().map((article) => ({ base: '/blog', article })),
];

function linksIn(text: string): string[] {
  return [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1] ?? '');
}

function internalPathExists(path: string): boolean {
  const [, section, slug] = path.split('/');
  if (slug === undefined) {
    return existsSync(`src/app/${section}/page.tsx`);
  }
  if (section === 'kennis')
    return getAllArticles().some((a) => a.slug === slug);
  if (section === 'blog') return getAllBlogPosts().some((a) => a.slug === slug);
  if (section === 'sticks')
    return getAllProducts().some((p) => p.slug === slug);
  return false;
}

describe('articles and blog posts', () => {
  it.each(ALL)(
    '$base/$article.slug validates against the schema',
    ({ article }) => {
      expect(() => articleSchema.parse(article)).not.toThrow();
    },
  );

  it.each(ALL)(
    '$base/$article.slug only links to pages that exist',
    ({ article }) => {
      const text = JSON.stringify([article.intro, article.sections]);
      for (const href of linksIn(text).filter((h) => h.startsWith('/'))) {
        expect(internalPathExists(href), href).toBe(true);
      }
    },
  );

  it.each(ALL)(
    '$base/$article.slug lists every inline source below the article',
    ({ article }) => {
      const listed = new Set(article.sources.map((source) => source.url));
      const text = JSON.stringify(article.sections);
      for (const href of linksIn(text).filter((h) => h.startsWith('http'))) {
        expect(listed.has(href), href).toBe(true);
      }
    },
  );

  it.each(ALL)(
    '$base/$article.slug links to the stickwijzer',
    ({ article }) => {
      expect(JSON.stringify(article.sections)).toContain('](/stickwijzer)');
    },
  );

  it('uses unique slugs per section', () => {
    for (const list of [getAllArticles(), getAllBlogPosts()]) {
      const slugs = list.map((a) => a.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});
