import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getAllProducts } from '@/catalog';
import { getOffers } from '@/catalog/offers';
import { OFFER_TEXT } from '@/content/offers';
import { WhereToBuy } from './WhereToBuy';

// Edge cases of "Waar te koop" (redesign fase 6): the block must never look broken.
const products = getAllProducts(new Date(), { includeImported: true });
const withShops = (n: number) => products.find((p) => getOffers(p).length === n);

const render = (product: NonNullable<ReturnType<typeof withShops>>, variant: 'full' | 'compact') =>
  renderToStaticMarkup(createElement(WhereToBuy, { product, placement: 'stickwijzer', variant, size: product.lengthsInches.value[0] ?? null }));

describe('WhereToBuy edge cases', () => {
  it('says so plainly when no partner shop sells the stick', () => {
    const product = withShops(0);
    if (!product) return; // the catalog may one day have no such stick
    expect(render(product, 'compact')).toContain(OFFER_TEXT.none);
    expect(render(product, 'full')).toContain(OFFER_TEXT.noneOnPage);
  });

  it('shows one complete shop row when only one shop sells it', () => {
    const product = withShops(1);
    expect(product).toBeDefined();
    const html = render(product!, 'compact');
    // The visible label; the button's aria-label says it once more for screen readers.
    expect(html.match(/>Bekijk prijs bij /g)?.length ?? 0).toBe(1);
    expect(html).not.toContain(OFFER_TEXT.none);
  });

  it('never shows a discount, a struck-through price or a "cheapest" label', () => {
    for (const product of products.filter((p) => getOffers(p).length > 1).slice(0, 20)) {
      const html = render(product, 'full');
      // "de goedkoopste standaardoptie" explains the shipping cost, not a shop label.
      expect(html).not.toMatch(/goedkoopst(?!e standaardoptie)|beste prijs|<s>|line-through|% korting/i);
    }
  });
});
