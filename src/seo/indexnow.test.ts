import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { getAllProducts, isFeedImport } from '@/catalog';
import {
  INDEXNOW_KEY,
  inSitemap,
  pathForFile,
  payload,
  urlsForFiles,
} from './indexnow';

describe('pathForFile', () => {
  it('maps a page’s own content file to its URL path', () => {
    expect(pathForFile('src/catalog/products/grays-jb10-composite.ts')).toBe(
      '/sticks/grays-jb10-composite',
    );
    expect(pathForFile('src/content/articles/low-bow-vs-mid-bow.ts')).toBe(
      '/kennis/low-bow-vs-mid-bow',
    );
    expect(pathForFile('src/content/blogPosts/hockeystick-kopen.ts')).toBe(
      '/blog/hockeystick-kopen',
    );
    expect(pathForFile('src/content/zaal.ts')).toBe('/zaalsticks');
    expect(pathForFile('src/app/methodiek/page.tsx')).toBe('/methodiek');
    expect(pathForFile('src/app/page.tsx')).toBe('/');
  });

  it('ignores shared code, dynamic routes, tests and docs', () => {
    for (const file of [
      'src/app/layout.tsx',
      'src/components/catalog/ProductCard.tsx',
      'src/app/sticks/[slug]/page.tsx',
      'src/catalog/imported/passahockey.ts',
      'src/catalog/metaDescription.test.ts',
      'docs/decision-log.md',
      '.github/workflows/ci.yml',
    ]) {
      expect(pathForFile(file), file).toBeNull();
    }
  });

  it('can use the file name, because it equals the slug', () => {
    for (const dir of [
      'src/catalog/products',
      'src/content/articles',
      'src/content/blogPosts',
    ]) {
      for (const name of readdirSync(dir).filter((n) => n.endsWith('.ts'))) {
        const slug = readFileSync(`${dir}/${name}`, 'utf8').match(
          /^\s*slug: '([^']+)'/m,
        )?.[1];
        expect(slug, `${dir}/${name}`).toBe(name.replace(/\.ts$/, ''));
      }
    }
  });
});

describe('inSitemap', () => {
  const sitemapUrls = sitemap().map((entry) => entry.url);

  it('never sends an imported stick or /interesse', () => {
    const imported = getAllProducts(new Date(), { includeImported: true }).find(
      isFeedImport,
    )!;
    const urls = [
      `https://jouwhockeystick.nl/aanbod/${imported.slug}`,
      `https://jouwhockeystick.nl/sticks/${imported.slug}`,
      'https://jouwhockeystick.nl/interesse',
      'https://jouwhockeystick.nl/stickwijzer/advies',
      'https://jouwhockeystick.nl/zaalsticks',
    ];
    expect(inSitemap(urls, sitemapUrls)).toEqual([
      'https://jouwhockeystick.nl/zaalsticks',
    ]);
  });

  it('keeps changed pages that are in the sitemap', () => {
    const urls = urlsForFiles([
      'src/catalog/products/grays-jb10-composite.ts',
      'src/app/layout.tsx',
    ]);
    expect(inSitemap(urls, sitemapUrls)).toEqual([
      'https://jouwhockeystick.nl/sticks/grays-jb10-composite',
    ]);
  });
});

describe('key', () => {
  it('is published at keyLocation with the key as its content', () => {
    expect(INDEXNOW_KEY).toMatch(/^[0-9a-f]{32}$/);
    expect(readFileSync(`public/${INDEXNOW_KEY}.txt`, 'utf8').trim()).toBe(
      INDEXNOW_KEY,
    );
    expect(payload([]).keyLocation).toBe(
      `https://jouwhockeystick.nl/${INDEXNOW_KEY}.txt`,
    );
  });
});
