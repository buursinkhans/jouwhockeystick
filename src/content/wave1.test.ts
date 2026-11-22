import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import VergelijkPage from '@/app/vergelijk/page';
import { getFieldProducts, getIndoorProducts, getProductBySlug } from '@/catalog';
import { SERIES, seriesPath } from '@/catalog/series';
import { StickPriceExamples } from '@/components/article/StickPriceExamples';
import { ProductDetail } from '@/components/catalog/ProductDetail';
import { inSitemap, urlsForFiles } from '@/seo/indexnow';
import { disciplineTable } from './disciplineCompare';
import { getArticleBySlug } from './index';
import { articleSchema } from './types';

describe('sitemap and IndexNow (wave 1)', () => {
  const urls = sitemap().map((entry) => entry.url);

  it('lists every series that passes the gate, with a lastmod date', () => {
    for (const s of SERIES) {
      const entry = sitemap().find((e) => e.url === `https://jouwhockeystick.nl${seriesPath(s.slug)}`);
      expect(entry, s.slug).toBeDefined();
      expect(entry?.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('reports both series pages when their members, gate or text change, and only those in the sitemap', () => {
    for (const file of ['src/catalog/seriesDefinitions.ts', 'src/catalog/series.ts', 'src/content/series.ts']) {
      expect(inSitemap(urlsForFiles([file]), urls).sort(), file).toEqual([
        'https://jouwhockeystick.nl/vergelijk/grays-jb-serie',
        'https://jouwhockeystick.nl/vergelijk/grays-zaalsticks',
      ]);
    }
  });

  it('reports the changed article of the veldstick page by its file name', () => {
    expect(inSitemap(urlsForFiles(['src/content/articles/veldstick-zaalhockey.ts']), urls)).toEqual([
      'https://jouwhockeystick.nl/kennis/veldstick-zaalhockey',
    ]);
  });
});

describe('links to the series comparisons', () => {
  it('/vergelijk lists them as plain text links under a neutral heading', async () => {
    const html = renderToStaticMarkup(await VergelijkPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain('Vergelijkingen om mee te beginnen');
    expect(html).not.toMatch(/populair/i);
    for (const s of SERIES) expect(html).toContain(`href="${seriesPath(s.slug)}"`);
  });

  it('a stick page links to its series, and a stick outside every series links to none', () => {
    const jb10 = renderToStaticMarkup(createElement(ProductDetail, { product: getProductBySlug('grays-jb10-composite')! }));
    expect(jb10).toContain('href="/vergelijk/grays-jb-serie"');
    const db2xi = renderToStaticMarkup(createElement(ProductDetail, { product: getProductBySlug('grays-db2xi-dynabow-indoor')! }));
    expect(db2xi).toContain('href="/vergelijk/grays-zaalsticks"');
    const other = renderToStaticMarkup(createElement(ProductDetail, { product: getProductBySlug('jdh-x93-pro-bow')! }));
    expect(other).not.toContain('/vergelijk/grays');
  });

  it.each([
    ['low-bow-vs-mid-bow', '/vergelijk/grays-jb-serie'],
    ['meer-carbon-hockeystick-beter', '/vergelijk/grays-jb-serie'],
    ['zaalstick-budget', '/vergelijk/grays-zaalsticks'],
    ['veldstick-zaalhockey', '/vergelijk/grays-zaalsticks'],
  ])('/kennis/%s links to %s', (slug, href) => {
    expect(JSON.stringify(getArticleBySlug(slug)!.sections)).toContain(`](${href})`);
  });
});

describe('/kennis/veldstick-zaalhockey (wave 1)', () => {
  const article = getArticleBySlug('veldstick-zaalhockey')!;

  it('still validates, with a table, a price block and a meta description that fits', () => {
    expect(() => articleSchema.parse(article)).not.toThrow();
    const blocks = article.sections.flatMap((s) => s.body).filter((b) => typeof b !== 'string');
    expect(blocks.some((b) => b.type === 'table')).toBe(true);
    expect(blocks.some((b) => b.type === 'stickPrices')).toBe(true);
    expect(article.metaDescription.length).toBeLessThanOrEqual(158);
    expect(article.metaDescription).toContain('tabel');
  });

  it('builds the table from the catalog, with the indicative price named as such', () => {
    const table = disciplineTable(getFieldProducts(), getIndoorProducts());
    expect(table?.columns).toEqual(['In onze catalogus', 'Veldsticks', 'Zaalsticks']);
    expect(table?.rows.map((r) => r[0])).toContain('Richtprijs (mediaan, geen winkelprijs)');
    expect(JSON.stringify(table)).not.toMatch(/undefined|NaN|Infinity/);
  });

  it('leaves out every row that has too little data, and returns nothing without data', () => {
    expect(disciplineTable([], [])).toBeNull();
    // Two sticks per side: no price row (a median of two is not shown); the other rows follow their own minimum.
    const few = disciplineTable(getFieldProducts().slice(0, 2), getIndoorProducts().slice(0, 2));
    expect(few?.rows.map((r) => r[0]) ?? []).not.toContain('Richtprijs (mediaan, geen winkelprijs)');
    expect(few?.rows.map((r) => r[0]) ?? []).not.toContain('Kromming die het vaakst voorkomt');
  });

  it('shows two example sticks with real shop prices, with no price claim', () => {
    const html = renderToStaticMarkup(createElement(StickPriceExamples));
    expect(html).toContain('Veldstick');
    expect(html).toContain('Zaalstick');
    expect(html).toMatch(/€\d+,\d{2}/);
    expect(html).not.toMatch(/goedkoopst|beste prijs|scherpste prijs|korting|bespaar/i);
  });
});
