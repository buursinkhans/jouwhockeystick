import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { getAllProducts, isFeedImport } from './index';
import { PRODUCT_SECTIONS, productPath } from './paths';
import { resolveProductRoute } from './productRoute';

const all = getAllProducts(new Date(), { includeImported: true });
const imported = all.find(isFeedImport);
const curated = all.find((p) => !isFeedImport(p));

describe('productPath', () => {
  it('puts imported sticks under /aanbod and hand-kept sticks under /sticks', () => {
    expect(imported && productPath(imported)).toBe(`/aanbod/${imported?.slug}`);
    expect(curated && productPath(curated)).toBe(`/sticks/${curated?.slug}`);
  });
});

describe('resolveProductRoute', () => {
  it('shows a stick on its own path', () => {
    expect(
      resolveProductRoute(imported!.slug, PRODUCT_SECTIONS.imported).kind,
    ).toBe('page');
    expect(
      resolveProductRoute(curated!.slug, PRODUCT_SECTIONS.curated).kind,
    ).toBe('page');
  });

  it('redirects /sticks/<imported> to /aanbod and /aanbod/<curated> to /sticks', () => {
    expect(
      resolveProductRoute(imported!.slug, PRODUCT_SECTIONS.curated),
    ).toEqual({
      kind: 'redirect',
      to: `/aanbod/${imported!.slug}`,
    });
    expect(
      resolveProductRoute(curated!.slug, PRODUCT_SECTIONS.imported),
    ).toEqual({
      kind: 'redirect',
      to: `/sticks/${curated!.slug}`,
    });
  });

  it('gives a 404 for an unknown slug', () => {
    expect(
      resolveProductRoute('bestaat-niet', PRODUCT_SECTIONS.curated).kind,
    ).toBe('not-found');
    expect(
      resolveProductRoute('bestaat-niet', PRODUCT_SECTIONS.imported).kind,
    ).toBe('not-found');
  });
});

describe('crawling', () => {
  it('keeps /aanbod out of the sitemap', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => url.includes('/aanbod'))).toBe(false);
    expect(urls.some((url) => url.includes('/sticks/'))).toBe(true);
  });

  it('closes /aanbod/ to crawlers in robots.txt and leaves the rest open', () => {
    const rules = [robots().rules].flat();
    const all = rules.find((rule) => rule.userAgent === '*');
    expect([all?.disallow].flat()).toContain('/aanbod/');
    expect([all?.allow].flat()).toContain('/');
  });
});
