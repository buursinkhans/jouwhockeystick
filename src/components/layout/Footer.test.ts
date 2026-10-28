import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Footer } from './Footer';

describe('Footer', () => {
  it('names the three partner shops, says the shop is the seller, and how current prices are', () => {
    const html = renderToStaticMarkup(createElement(Footer));
    expect(html).toContain('bol.com, PassaHockey en Plutosport; de winkel is de verkoper');
    expect(html).toMatch(/Winkelprijzen werken we wekelijks bij/);
    expect(html).not.toMatch(/bol\.com of PassaHockey\./);
  });
});
