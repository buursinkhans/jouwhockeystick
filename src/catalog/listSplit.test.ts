import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import SticksPage from '@/app/sticks/page';
import ZaalsticksPage from '@/app/zaalsticks/page';
import { getFieldProducts, getIndoorProducts, isFeedImport } from './index';
import { productPath } from './paths';

const query = { includeImported: true };
const linksIn = (html: string) =>
  new Set(
    [...html.matchAll(/href="(\/(?:sticks|aanbod)\/[^"?#]+)"/g)].map(
      (m) => m[1],
    ),
  );

describe('server HTML of the catalog lists (decision log 2026-10-24)', () => {
  it('/sticks has every hand-checked field stick and no imported one', async () => {
    const html = renderToStaticMarkup(
      await SticksPage({ searchParams: Promise.resolve({}) }),
    );
    const links = linksIn(html);
    const all = getFieldProducts(new Date(), query);
    for (const p of all.filter((p) => !isFeedImport(p)))
      expect(links, p.slug).toContain(productPath(p));
    for (const p of all.filter(isFeedImport))
      expect(html, p.slug).not.toContain(p.slug);
    expect(html).toContain(
      `Toon ook ${all.filter(isFeedImport).length} sticks uit het aanbod van PassaHockey`,
    );
  });

  it('/zaalsticks has every hand-checked indoor stick and no imported one', () => {
    const html = renderToStaticMarkup(ZaalsticksPage());
    const links = linksIn(html);
    const all = getIndoorProducts(new Date(), query);
    for (const p of all.filter((p) => !isFeedImport(p)))
      expect(links, p.slug).toContain(productPath(p));
    for (const p of all.filter(isFeedImport))
      expect(html, p.slug).not.toContain(p.slug);
  });

  it('with a brand filter, /sticks shows every stick of that brand, imported ones too', async () => {
    const all = getFieldProducts(new Date(), query);
    const brand = all.find(isFeedImport)!.brand;
    const html = renderToStaticMarkup(
      await SticksPage({ searchParams: Promise.resolve({ brand }) }),
    );
    const links = linksIn(html);
    for (const p of all.filter((p) => p.brand === brand))
      expect(links, p.slug).toContain(productPath(p));
    expect(html).not.toContain('uit het aanbod van PassaHockey');
  });
});
