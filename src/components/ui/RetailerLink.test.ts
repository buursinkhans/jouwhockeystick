import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RetailerLink } from './RetailerLink';

describe('RetailerLink', () => {
  it('carries the retailer_click data for the site-wide tracker', () => {
    const html = renderToStaticMarkup(
      createElement(RetailerLink, {
        retailer: 'bolcom',
        brand: 'Grays',
        productName: 'Grays JB 10',
        placement: 'catalogus',
        productUrl: 'https://www.bol.com/nl/nl/p/grays-jb-10/9300000304766046/',
        children: 'Bekijk',
      }),
    );
    expect(html).toContain('data-retailer="bolcom"');
    expect(html).toContain('data-brand="Grays"');
    expect(html).toContain('data-product-name="Grays JB 10"');
    expect(html).toContain('data-placement="catalogus"');
    expect(html).toContain('data-link-type="product"');
    expect(html).toContain('rel="noopener noreferrer sponsored"');
  });
});
