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
  answers: [
    { terms: ['carbon'], text: 'Meer carbon maakt een stick stijver; of dat bij je past, hangt af van je techniek.', article: 'carbon' },
    { terms: ['lowbow'], text: 'Bij een low bow zit de kromming lager, dichter bij de krul en vraagt de aanname meer techniek.', article: 'low-bow-vs-mid-bow' },
    { terms: ['maat'], text: 'De maat van een hockeystick kies je op je lichaamslengte, zonder schoenen gemeten.', article: 'bestaat-niet' },
  ],
  stickwijzer: { terms: ['kind', 'junior', 'beginner', 'advies'] },
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
    stick('rc', 'Ravi', 'Carbon 70'),
    { type: 'brand', id: 'Grays', title: 'Grays', path: '/merken/grays', hasPage: true, stickCount: 3 },
    { type: 'article', id: '/kennis/low-bow-vs-mid-bow', title: 'Low bow of mid bow', path: '/kennis/low-bow-vs-mid-bow', keywords: 'Welke kromming past bij jou', category: 'Kennisbank', summary: 'x' },
    { type: 'article', id: '/kennis/carbon', title: 'Is meer carbon beter?', path: '/kennis/carbon', keywords: 'Carbonpercentage', category: 'Kennisbank', summary: 'x' },
    { type: 'article', id: '/kennis/kinderen', title: 'Hockeystick voor kinderen', path: '/kennis/kinderen', category: 'Kennisbank', summary: 'x' },
  ],
};
const prepared = prepareIndex(index);
const find = (q: string) => search(prepared, q, config, limits);
const ids = (entries: { item: SearchItem }[]) => entries.map((e) => e.item.id);

describe('answers, the stickwijzer pointer and knowledge questions', () => {
  it('answers a knowledge question above the results, with the article it comes from', () => {
    const result = find('carbon');
    expect(result.answer).toEqual({ text: expect.stringContaining('stijver'), path: '/kennis/carbon', title: 'Is meer carbon beter?' });
    expect(find('low bow').answer?.path).toBe('/kennis/low-bow-vs-mid-bow');
    expect(find('lowbow').answer?.path).toBe('/kennis/low-bow-vs-mid-bow');
  });

  it('does not call a generic description a model: "low bow" is a question, not a model', () => {
    expect(find('low bow').sticks.some((entry) => entry.exact)).toBe(false);
    expect(find('mid bow').sticks.some((entry) => entry.exact)).toBe(false);
  });

  it('gives no answer when a stick matches by name: an exact model match is never below an article', () => {
    const result = find('ravi carbon 70');
    expect(result.sticks[0]?.exact).toBe(true);
    expect(result.answer).toBeNull();
    expect(result.knowledgeFirst).toBe(false);
    expect(find('grays jb10').answer).toBeNull();
  });

  it('drops an answer whose article is not in the index', () => {
    expect(find('maat').answer).toBeNull();
  });

  it('lists the articles first for a knowledge question, and only then', () => {
    expect(find('carbon').knowledgeFirst).toBe(true);
    expect(find('grays').knowledgeFirst).toBe(false);
    expect(find('composite').knowledgeFirst).toBe(false);
  });

  it('points at the stickwijzer for general words, also by synonym, and not for a model', () => {
    expect(find('kind').wijzerHint).toBe(true);
    expect(find('kinderen').wijzerHint).toBe(true);
    expect(find('junior').wijzerHint).toBe(true);
    expect(find('junior mid bow').wijzerHint).toBe(false);
    expect(find('grays jb10').wijzerHint).toBe(false);
    expect(find('x60').wijzerHint).toBe(false);
  });

  it('keeps a long query a model search: no answer from the fourth word on', () => {
    expect(find('welke carbon stick voor een kind').answer).toBeNull();
  });
});

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
