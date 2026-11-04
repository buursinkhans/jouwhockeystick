import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import OverOnsPage from './page';

describe('/over-ons', () => {
  it('names all four partner shops and how the site earns money', () => {
    const html = renderToStaticMarkup(createElement(OverOnsPage));
    expect(html).toContain('bol.com, PassaHockey, Plutosport, HockeyCity of Daka');
    expect(html).toContain('Zo verdienen we geld');
    expect(html).toContain('nooit op vergoeding');
  });

  it('shows who is behind the site, as the owner gave it', () => {
    const html = renderToStaticMarkup(createElement(OverOnsPage));
    expect(html).toContain('Hans Buursink');
    expect(html).toContain('Hockeyvader');
    expect(html).toContain('alt="Portret van Hans Buursink"');
  });

  it('is the only place with the name and "Hockeyvader" (owner, 2026-11-04)', async () => {
    const { Footer } = await import('@/components/layout/Footer');
    expect(renderToStaticMarkup(createElement(Footer))).not.toMatch(/Buursink|hockeyvader/i);
    // The homepage and the header need the image pipeline or the router to render: check their source.
    const { readdirSync, readFileSync } = await import('node:fs');
    for (const dir of ['src/components/home', 'src/components/layout']) {
      for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
        expect(readFileSync(`${dir}/${file}`, 'utf8'), file).not.toMatch(/Buursink|hockeyvader/i);
      }
    }
  });
});
