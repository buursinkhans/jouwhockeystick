import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SEASON_BAND } from '@/content/home';
import { HomePage } from './HomePage';
import { SeasonBand } from './SeasonBand';

// The Instagram feed is an async server component that fetches; not needed here.
vi.mock('./InstagramFeed', () => ({ InstagramFeed: () => null }));
// The hero uses next/image with static imports, which the test setup cannot size.
vi.mock('./Hero', () => ({ Hero: () => createElement('h1', null, 'hero') }));

const render = (variant: 'season' | 'buying', isoNow: string) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(isoNow));
  return renderToStaticMarkup(createElement(HomePage, { variant }));
};

afterEach(() => vi.useRealTimers());

describe('SeasonBand (compact indoor block)', () => {
  const html = renderToStaticMarkup(createElement(SeasonBand));

  it('has both links in the first HTML, with the briefed texts', () => {
    expect(html).toContain('Een zaalhockeystick kiezen');
    expect(html).toContain('Vind zaalsticks in de juiste maat en binnen je budget.');
    expect(html).toMatch(/<a [^>]*href="\/zaalsticks"[^>]*>Vergelijk zaalhockeysticks<\/a>/);
    expect(html).toMatch(/<a [^>]*href="\/kennis\/zaalstick-voor-kinderen"[^>]*>Zaalstick voor je kind kiezen<\/a>/);
    expect(SEASON_BAND.cta.href).toBe('/zaalsticks');
  });

  it('is compact: no eyebrow and one heading', () => {
    expect(html).not.toContain('Zaalseizoen');
    expect(html.match(/<h2\b/g)).toHaveLength(1);
  });

  it('makes the button full width on a phone', () => {
    expect(html).toMatch(/class="[^"]*w-full[^"]*"[^>]*href="\/zaalsticks"|href="\/zaalsticks"[^>]*class="[^"]*w-full/);
  });
});

describe('HomePage: placement of the indoor block', () => {
  it('during the Black Friday campaign: hero, indoor block, campaign card, search block', () => {
    const html = render('season', '2026-11-20T10:00:00+01:00');
    const hero = html.indexOf('<h1');
    const zaal = html.indexOf('href="/zaalsticks"');
    const card = html.indexOf('/black-friday-hockey');
    expect(hero).toBeGreaterThan(-1);
    expect(zaal).toBeGreaterThan(hero);
    expect(card).toBeGreaterThan(zaal);
    expect(html).toContain('href="/kennis/zaalstick-voor-kinderen"');
  });

  it('without a campaign, in the indoor season: the block is still there', () => {
    const html = render('season', '2026-12-20T10:00:00+01:00');
    expect(html).not.toContain('/black-friday-hockey');
    expect(html).toContain('href="/zaalsticks"');
  });

  it('outside the indoor season: no indoor block', () => {
    const html = render('season', '2026-06-15T10:00:00+02:00');
    expect(html).not.toContain('Een zaalhockeystick kiezen');
  });

  it('with the buying variant: no indoor block', () => {
    const html = render('buying', '2026-11-20T10:00:00+01:00');
    expect(html).not.toContain('Een zaalhockeystick kiezen');
  });
});
