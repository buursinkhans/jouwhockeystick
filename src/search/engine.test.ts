import { describe, expect, it } from 'vitest';
import type { SearchConfig } from './config';
import { prepareIndex, search, type SearchIndex, type SearchItem } from './engine';
import { searchTokens } from './tokens';

const config: SearchConfig = {
  popular: [],
  synonyms: [
    { terms: ['maharadja', 'maharaja'] },
    { terms: ['junior', 'kinderen'] },
  ],
  corrections: { maharaja: 'maharadja' },
};
const limits = { sticks: 4, brands: 2, articles: 3 };

const stick = (id: string, brand: string, title: string): SearchItem => ({ type: 'stick', id, brand, title, path: `/sticks/${id}`, carbon: 50 });
const index: SearchIndex = {
  generatedAt: '2026-11-24T10:00:00.000Z',
  items: [
    stick('gx', 'Grays', 'GX1000 Composite'),
    stick('jb10', 'Grays', 'JB10 Composite'),
    stick('jb8', 'Grays', 'JB8 Composite'),
    stick('x60', 'JDH', 'X60 Lowbow 50% carbon'),
    stick('mid5', 'Osaka', 'Midbow 5'),
    stick('mid500', 'Osaka', 'Midbow 500'),
    stick('maha', 'The Indian Maharadja', 'Gold Pro 10'),
    stick('kind', 'Ravi', 'Junior Mid Bow'),
    { type: 'brand', id: 'Grays', title: 'Grays', path: '/merken/grays', hasPage: true, stickCount: 3 },
    { type: 'article', id: '/kennis/low-bow-vs-mid-bow', title: 'Low bow of mid bow', path: '/kennis/low-bow-vs-mid-bow', keywords: 'Welke kromming past bij jou', category: 'Kennisbank', summary: 'x' },
    { type: 'article', id: '/kennis/carbon', title: 'Is meer carbon beter?', path: '/kennis/carbon', keywords: 'Carbonpercentage', category: 'Kennisbank', summary: 'x' },
    { type: 'article', id: '/kennis/kinderen', title: 'Hockeystick voor kinderen', path: '/kennis/kinderen', category: 'Kennisbank', summary: 'x' },
  ],
};
const prepared = prepareIndex(index);
const find = (q: string) => search(prepared, q, config, limits);
const ids = (entries: { item: SearchItem }[]) => entries.map((e) => e.item.id);

describe('search engine', () => {
  it('puts an exact model match at the top of the sticks', () => {
    const result = find('Grays GX1000');
    expect(ids(result.sticks)[0]).toBe('gx');
    expect(result.sticks[0]?.exact).toBe(true);
  });

  it('shows a brand match only for a brand search, not for a model', () => {
    expect(ids(find('grays').brands)).toEqual(['Grays']);
    expect(find('grays jb10').brands).toHaveLength(0);
  });

  it('treats "low bow" and "lowbow" alike, in the query and in the name', () => {
    expect(ids(find('low bow').sticks)).toContain('x60');
    expect(ids(find('lowbow').sticks)).toContain('x60');
    expect(ids(find('mid bow').sticks)).toContain('kind');
    expect(ids(find('midbow').sticks)).toEqual(expect.arrayContaining(['mid5', 'kind']));
    expect(ids(find('low bow').articles)).toEqual(['/kennis/low-bow-vs-mid-bow']);
  });

  it('reads 36,5 and 36.5 the same way', () => {
    expect(searchTokens('36,5')).toEqual(searchTokens('36.5'));
  });

  it('keeps a number a whole number: 5 is not 500', () => {
    expect(ids(find('midbow 5').sticks)).toEqual(['mid5']);
  });

  it('finds Maharadja by its spellings (corrections and synonyms)', () => {
    for (const spelling of ['maharadja', 'maharaja', 'Indian Maharadja']) expect(ids(find(spelling).sticks), spelling).toEqual(['maha']);
  });

  it('lets a synonym find the other word', () => {
    expect(ids(find('kinderen').sticks)).toContain('kind');
    expect(ids(find('junior').articles)).toContain('/kennis/kinderen');
  });

  it('finds an article by its headings', () => {
    expect(ids(find('carbonpercentage').articles)).toEqual(['/kennis/carbon']);
  });

  it('starts at two characters and cuts the query at the maximum length', () => {
    expect(find('g').total).toBe(0);
    expect(find(' ').total).toBe(0);
    expect(find('x'.repeat(200)).query).toHaveLength(80);
  });

  it('applies the limits per group and counts everything found', () => {
    const result = search(prepared, 'composite', config, { sticks: 2, brands: 1, articles: 1 });
    expect(result.sticks).toHaveLength(2);
    expect(result.total).toBe(3);
  });

  it('returns sticks and articles side by side for a general query, sticks listed first by the dropdown', () => {
    const result = find('mid bow');
    expect(result.sticks.length).toBeGreaterThan(0);
    expect(result.articles.length).toBeGreaterThan(0);
  });
});
