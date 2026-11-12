import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ShoePage from '@/app/hockeyschoenen/[slug]/page';
import { getAllProducts } from '@/catalog';
import { ProductDetail } from '@/components/catalog/ProductDetail';
import { getOffers, isPriceFresh } from './offers';
import { getCuratedShoes } from './shoes';
import { getShoeOffers } from './shoes/offers';

/**
 * Product structured data (decision log 2026-11-12). Google's product snippets
 * need `name` plus one of `offers`, `review` or `aggregateRating`. We have no
 * reviews and no current price on some pages, so those pages carry no Product
 * block at all, instead of an item Search Console counts as invalid. Written
 * from the catalog itself, so it holds on any date.
 */
const ldBlocks = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]!) as Record<string, unknown>);
const productBlock = (html: string) => ldBlocks(html).find((d) => d['@type'] === 'Product');
const stickPage = (slug: string) => {
  const product = getAllProducts().find((p) => p.slug === slug)!;
  return renderToStaticMarkup(createElement(ProductDetail, { product }));
};
const shoePage = async (slug: string) => renderToStaticMarkup(await ShoePage({ params: Promise.resolve({ slug }) }));

const hasCurrentPrice = (offers: Parameters<typeof isPriceFresh>[0][], now: Date) =>
  offers.some((o) => isPriceFresh(o, now) && o.priceEur !== null);

afterEach(() => vi.useRealTimers());

describe('Product JSON-LD on stick pages', () => {
  const now = new Date();

  it('has a Product block with offers exactly when there is a current price, and never a review or rating', () => {
    let withPrice = 0;
    let withoutPrice = 0;
    for (const product of getAllProducts()) {
      const html = stickPage(product.slug);
      const block = productBlock(html);
      if (hasCurrentPrice(getOffers(product), now)) {
        withPrice += 1;
        expect(block, product.slug).toBeDefined();
        expect(block!.offers, product.slug).toBeDefined();
        expect(['Offer', 'AggregateOffer']).toContain((block!.offers as { '@type': string })['@type']);
        expect(JSON.stringify(block), product.slug).not.toMatch(/Review|AggregateRating|ratingValue/);
      } else {
        withoutPrice += 1;
        expect(block, `${product.slug} has no current price, so no Product block`).toBeUndefined();
        expect(html, product.slug).not.toContain('"@type":"Product"');
      }
    }
    expect(withPrice).toBeGreaterThan(0);
    // The audit of 2026-11-12 found 7 to 9 sticks without a current price; the page still renders for them.
    expect(withPrice + withoutPrice).toBe(getAllProducts().length);
  });

  it('keeps the page itself (heading, shop block) when the Product block is left out', () => {
    const without = getAllProducts().find((p) => !hasCurrentPrice(getOffers(p), now));
    if (!without) return;
    const html = stickPage(without.slug);
    expect(html).toContain(`<h1`);
    expect(html).toContain(without.name);
  });

  it('leaves no Product block on any stick page once every price has expired', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2027-06-01'));
    for (const product of getAllProducts()) expect(productBlock(stickPage(product.slug)), product.slug).toBeUndefined();
  });
});

describe('Product JSON-LD on checked shoe pages', () => {
  it('has a Product block with offers exactly when there is a current price, and never a review or rating', async () => {
    const now = new Date();
    for (const shoe of getCuratedShoes()) {
      const block = productBlock(await shoePage(shoe.slug));
      if (hasCurrentPrice(getShoeOffers(shoe), now)) {
        expect(block, shoe.slug).toBeDefined();
        expect(block!.offers, shoe.slug).toBeDefined();
        expect(JSON.stringify(block), shoe.slug).not.toMatch(/Review|AggregateRating|ratingValue/);
      } else {
        expect(block, shoe.slug).toBeUndefined();
      }
    }
  });

  it('leaves no Product block on any shoe page once every price has expired', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2027-06-01'));
    for (const shoe of getCuratedShoes()) expect(productBlock(await shoePage(shoe.slug)), shoe.slug).toBeUndefined();
  });
});
