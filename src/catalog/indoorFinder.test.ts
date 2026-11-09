import { describe, expect, it } from 'vitest';
import { getIndoorProducts } from './index';
import { indoorItem } from './indoorItems';
import { cardPrice, getOffers } from './offers';
import {
  INDOOR_BUDGETS,
  NO_FILTERS,
  countByBudget,
  filterIndoor,
  lengthsFor,
  playerForSize,
  shorterSizeMatches,
  sizeAdviceFor,
  sizesFromAdvice,
  type IndoorItem,
} from './indoorFinder';
import { INDOOR_TIERS } from './indoorTiers';
import { GET } from '@/app/data/[file]/route';

// The zaalstick finder (2026-11-09).
const item = (o: Partial<IndoorItem> & Pick<IndoorItem, 'slug'>): IndoorItem => ({
  checked: true,
  priceEur: 60,
  priceKind: 'shop',
  lengths: [36.5, 37.5],
  ...o,
});
const items: IndoorItem[] = [
  item({ slug: 'junior-cheap', priceEur: 25, lengths: [30, 31] }),
  item({ slug: 'junior-50', priceEur: 50, lengths: [32, 33] }),
  item({ slug: 'adult-99', priceEur: 99.99 }),
  item({ slug: 'adult-100', priceEur: 100, lengths: [37.5, 38.5] }),
  item({ slug: 'adult-250', priceEur: 250, checked: false }),
  item({ slug: 'no-price', priceEur: null, priceKind: 'indicative' }),
];
const slugs = (list: { item: IndoorItem }[]) => list.map((m) => m.item.slug);

describe('budget ranges', () => {
  it('cover every price once: no overlap and no gap, a stick of exactly €50 or €100 in the higher range', () => {
    for (let i = 1; i < INDOOR_BUDGETS.length; i += 1) {
      expect(INDOOR_BUDGETS[i]!.min).toBe(INDOOR_BUDGETS[i - 1]!.max);
    }
    expect(INDOOR_BUDGETS[0]!.min).toBe(0);
    expect(INDOOR_BUDGETS.at(-1)!.max).toBe(Number.POSITIVE_INFINITY);
    expect(slugs(filterIndoor(items, { ...NO_FILTERS, budget: 'onder-50' }))).toEqual(['junior-cheap']);
    expect(slugs(filterIndoor(items, { ...NO_FILTERS, budget: '50-100' }))).toEqual(['junior-50', 'adult-99']);
    expect(slugs(filterIndoor(items, { ...NO_FILTERS, budget: '100-200' }))).toEqual(['adult-100']);
    expect(slugs(filterIndoor(items, { ...NO_FILTERS, budget: 'vanaf-200' }))).toEqual(['adult-250']);
  });

  it('use the same limits as the price groups of the budget article', () => {
    const limits = INDOOR_TIERS.flatMap((t) => [t.min, ...(t.max !== undefined ? [t.max] : [])]);
    for (const limit of limits) expect(INDOOR_BUDGETS.some((b) => b.min === limit)).toBe(true);
  });

  it('leave out a stick without any price once a budget is chosen, and never crash on it', () => {
    expect(slugs(filterIndoor(items, NO_FILTERS))).toContain('no-price');
    for (const range of INDOOR_BUDGETS) {
      expect(slugs(filterIndoor(items, { ...NO_FILTERS, budget: range.id }))).not.toContain('no-price');
    }
    expect(slugs(filterIndoor(items, NO_FILTERS)).at(-1)).toBe('no-price');
  });

  it('count per range with the other answers, matching what the list shows', () => {
    const filters = { ...NO_FILTERS, player: 'volwassene' as const };
    const counts = countByBudget(items, filters);
    for (const range of INDOOR_BUDGETS) {
      expect(counts[range.id]).toBe(filterIndoor(items, { ...filters, budget: range.id }).length);
    }
  });
});

describe('who and which length', () => {
  it('splits child and adult lengths at 36.5 inch, the size buttons come from the list', () => {
    expect(lengthsFor(items, 'kind')).toEqual([30, 31, 32, 33]);
    expect(lengthsFor(items, 'volwassene')).toEqual([36.5, 37.5, 38.5]);
    expect(playerForSize(36)).toBe('kind');
    expect(playerForSize(36.5)).toBe('volwassene');
  });

  it('filters on the player alone, on one size, and combines every answer', () => {
    expect(slugs(filterIndoor(items, { ...NO_FILTERS, player: 'kind' }))).toEqual(['junior-cheap', 'junior-50']);
    expect(slugs(filterIndoor(items, { ...NO_FILTERS, sizes: [38.5] }))).toEqual(['adult-100']);
    expect(slugs(filterIndoor(items, { player: 'volwassene', sizes: [37.5], budget: '50-100' }))).toEqual(['adult-99']);
  });

  it('"Ik weet mijn maat niet": the same length method as the stickwijzer, advised size first', () => {
    expect(sizeAdviceFor(94)).toBeNull();
    expect(sizeAdviceFor(211)).toBeNull();
    expect(sizeAdviceFor(130.5)).toBeNull();
    const advice = sizeAdviceFor(130)!;
    expect(advice.primaryInch).toBe(30);
    const sizes = sizesFromAdvice(advice);
    expect(sizes[0]).toBe(30);
    const list = filterIndoor(items, { ...NO_FILTERS, sizes });
    expect(list[0]?.sizeInch).toBe(30);
    expect(list[0]?.alternativeSize).toBe(false);
    expect(sizesFromAdvice(sizeAdviceFor(178)!)[0]).toBe(36.5);
  });

  it('offers one size shorter, never longer, when nothing exists in the advised size', () => {
    const shorter = shorterSizeMatches(items, { ...NO_FILTERS, sizes: [34] });
    expect(slugs(shorter)).toEqual(['junior-50']);
    expect(shorter[0]?.sizeInch).toBe(33);
    expect(shorterSizeMatches(items, { ...NO_FILTERS, sizes: [29] })).toEqual([]);
  });
});

describe('the real indoor catalog', () => {
  const now = new Date('2026-11-09T12:00:00Z');
  const products = getIndoorProducts(now, { includeImported: true });
  const list = products.map((p) => indoorItem(p, now));

  it('filters every indoor stick, the shop-feed sticks too', () => {
    expect(list.length).toBe(products.length);
    expect(list.some((i) => !i.checked)).toBe(true);
    expect(filterIndoor(list, NO_FILTERS)).toHaveLength(list.length);
  });

  it('filters on the price the card shows, so the two never disagree', () => {
    for (const product of products) {
      const shown = cardPrice(getOffers(product), product.priceIndicativeEur.value, now);
      const indexed = list.find((i) => i.slug === product.slug)!;
      expect(indexed.priceEur, product.slug).toBe(shown.totalEur);
      expect(indexed.priceKind, product.slug).toBe(shown.kind);
    }
  });

  it('puts every priced stick in exactly one budget range', () => {
    const total = INDOOR_BUDGETS.reduce((sum, range) => sum + filterIndoor(list, { ...NO_FILTERS, budget: range.id }).length, 0);
    expect(total).toBe(list.filter((i) => i.priceEur !== null).length);
  });

  it('has sticks for both players', () => {
    expect(lengthsFor(list, 'kind').length).toBeGreaterThan(0);
    expect(lengthsFor(list, 'volwassene')).toEqual(expect.arrayContaining([36.5, 37.5]));
  });
});

describe('/data/zaal-index.json', () => {
  it('holds only the shop-feed sticks, with the same card price, and stays out of the index', async () => {
    const response = await GET(new Request('http://localhost/data/zaal-index.json'), {
      params: Promise.resolve({ file: 'zaal-index.json' }),
    });
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
    const list = (await response.json()) as IndoorItem[];
    const feed = getIndoorProducts(new Date(), { includeImported: true }).filter((p) => !getIndoorProducts(new Date()).some((c) => c.slug === p.slug));
    expect(list.length).toBe(feed.length);
    expect(list.every((i) => !i.checked)).toBe(true);
  });
});
