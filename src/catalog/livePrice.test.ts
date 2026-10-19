import { describe, expect, it } from 'vitest';
import { buildProduct } from '@/advice-engine/testFixtures';
import { getAllProducts } from './index';
import { livePricesFromFeed, withLivePrice } from './livePrice';

const passaUrl = 'https://www.passasports.nl/grays-jb-10-27052';
const jb10 = buildProduct({
  slug: 'grays-jb10-composite',
  passaSportsProductUrl: passaUrl,
  priceIndicativeEur: {
    value: 350,
    source: 'brand-website',
    sourceLabel: 'Adviesprijs van Grays.',
    lastVerifiedAt: '2026-10-13',
  },
});

describe('current PassaHockey price', () => {
  const live = { date: '2026-10-19', prices: { 'grays-jb10-composite': 290.95 } };

  it('replaces the list price by what PassaHockey asks today, and says so', () => {
    const priced = withLivePrice(jb10, live).priceIndicativeEur;
    expect(priced.value).toBe(290.95);
    expect(priced.source).toBe('partner-shop');
    expect(priced.sourceUrl).toBe(passaUrl);
    expect(priced.sourceLabel).toContain('€350');
    expect(priced.lastVerifiedAt).toBe('2026-10-19');
  });

  it('leaves sticks without a PassaHockey page or price alone', () => {
    const noPassa = buildProduct({ slug: 'grays-jb10-composite' });
    expect(withLivePrice(noPassa, live)).toBe(noPassa);
    expect(withLivePrice(jb10, { date: '2026-10-19', prices: {} })).toBe(jb10);
  });

  it('takes the lowest in-stock price per PassaHockey page from the feed', () => {
    expect(
      livePricesFromFeed(
        [jb10],
        [
          { url: passaUrl, priceMin: 290.95, inStock: true },
          { url: 'https://www.passasports.nl/other', priceMin: 10, inStock: true },
        ],
      ),
    ).toEqual({ 'grays-jb10-composite': 290.95 });
    expect(livePricesFromFeed([jb10], [{ url: passaUrl, priceMin: 290.95, inStock: false }])).toEqual({});
  });

  it('is what the site uses for curated sticks', () => {
    const live = getAllProducts().find((p) => p.slug === 'grays-jb10-composite');
    expect(live?.priceIndicativeEur.source).toBe('partner-shop');
  });
});
