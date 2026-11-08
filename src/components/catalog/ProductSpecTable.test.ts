import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getCatalogProducts } from '@/catalog';
import { ProductSpecTable } from './ProductSpecTable';

const product = getCatalogProducts()[0]!;

describe('ProductSpecTable', () => {
  it('shows the catalog stock status without a current shop price', () => {
    const html = renderToStaticMarkup(createElement(ProductSpecTable, { product }));
    expect(html).toContain('Voorraadstatus');
  });

  it('leaves it out when "Waar te koop" shows current stock, so the two never disagree', () => {
    const html = renderToStaticMarkup(createElement(ProductSpecTable, { product, hasCurrentOffers: true }));
    expect(html).not.toContain('Voorraadstatus');
    expect(html).toContain('Beschikbare lengtes');
  });
});
