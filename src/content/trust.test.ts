import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getTrustFacts } from '@/catalog/trustFacts';
import { getCatalogStats } from '@/catalog/stats';
import { RETAILERS } from '@/lib/retailers';
import { WhyUs } from '@/components/home/WhyUs';
import { PROMISES, comparisonRows } from './trust';

describe('trust facts', () => {
  it('are counted from the catalog and the retailers, never typed in', () => {
    const facts = getTrustFacts();
    const stats = getCatalogStats();
    expect(facts.fieldSticks).toBe(stats.fieldSticks);
    expect(facts.brands).toBe(stats.brands.length);
    expect(facts.shops).toBe(Object.keys(RETAILERS).length);
    expect(facts.pricesReadOn ?? '2026-01-01').toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('trust copy', () => {
  const text = [
    ...PROMISES.flatMap((p) => [p.title, p.body]),
    ...comparisonRows({ brands: 21, shops: 4 }).flatMap((r) => [r.webshop, r.us]),
  ].join(' ');

  it('makes no claims the site may not make', () => {
    // CLAUDE.md: no "beste"/"goedkoopst", no discount claims, no reviews or ratings we cannot source.
    expect(text).not.toMatch(/\bbeste\b|goedkoopst|korting\s*\d|%\s*korting|sterren|reviews?|\d+\s*(tevreden|ouders|gebruikers)/i);
  });

  it('names no competing shop', () => {
    expect(text).not.toMatch(/hockeydirect|hockeyhouse|hockeyoranje|hockeyshop/i);
  });

  it('links every promise to a page on the site', () => {
    for (const promise of PROMISES) expect(promise.proof.href).toMatch(/^\//);
  });

  it('shows the counted facts on the homepage block', () => {
    const facts = getTrustFacts();
    const html = renderToStaticMarkup(createElement(WhyUs));
    expect(html).toContain(String(facts.fieldSticks));
    expect(html).toContain('Waarom niet meteen bij één webshop?');
  });
});
