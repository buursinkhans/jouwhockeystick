import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import OverOnsPage from './page';

describe('/over-ons', () => {
  it('names all four partner shops and how the site earns money', () => {
    const html = renderToStaticMarkup(createElement(OverOnsPage));
    expect(html).toContain('bol.com, PassaHockey, Plutosport of HockeyCity');
    expect(html).toContain('Zo verdienen we geld');
    expect(html).toContain('nooit op vergoeding');
  });

  it('shows who is behind the site, as the owner gave it', () => {
    const html = renderToStaticMarkup(createElement(OverOnsPage));
    expect(html).toContain('Hans Buursink');
    expect(html).toContain('Hockeyvader');
    expect(html).toContain('alt="Portret van Hans Buursink"');
  });
});
