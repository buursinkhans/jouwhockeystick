import { describe, expect, it } from 'vitest';
import { LENGTH_GUIDE, getSizeAdvice } from '@/advice-engine/sizeAdvice';
import { hockeystickLengteTabel as article } from './articles/hockeystick-lengte-tabel';
import { COMPARISON_HEIGHTS, COMPARISON_ROWS, SIZE_CHARTS, chartRow, ourAdvice } from './sizeCharts';

const section = (heading: string) => JSON.stringify(article.sections.find((s) => s.heading === heading)?.body ?? []);
const chart = (id: string) => SIZE_CHARTS.find((c) => c.id === id)!;
const sizesAt = (id: string, height: number) => chartRow(chart(id), height)?.sizes ?? [];

describe('size charts of other sources (decision log 2026-11-13)', () => {
  it('names each source with its own URL and the date it was read, in the article sources', () => {
    expect(SIZE_CHARTS.map((c) => c.id)).toEqual(['grays', 'osaka', 'princess']);
    for (const c of SIZE_CHARTS) {
      expect(c.url).toMatch(/^https:\/\//);
      expect(c.readOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(article.sources.some((s) => s.url === c.url && /gelezen op \d+ \w+ \d{4}/.test(s.label)), c.id).toBe(true);
    }
  });

  it('copies the rows as printed (spot checks against the source pages of 2026-11-13)', () => {
    expect(sizesAt('grays', 175)).toEqual([36.5]); // "162-184" -> 36.5
    expect(sizesAt('grays', 187)).toEqual([37.5]); // "184-193" -> 37.5
    expect(sizesAt('osaka', 155)).toEqual([36.5]); // "152-180 cm" -> 36.5"
    expect(sizesAt('osaka', 182)).toEqual([37.5]); // "180-192 cm" -> 37.5"
    expect(sizesAt('osaka', 195)).toEqual([38]); // "> 192 cm" -> 38"
    expect(sizesAt('princess', 165)).toEqual([36, 36.5]); // "1.6 - 1.7 m" -> 36" or 36.5"
    expect(sizesAt('princess', 175)).toEqual([36.5]); // "1.7 - 1.8 m" -> 36.5"
    expect(sizesAt('princess', 190)).toEqual([36.5, 37.5]); // "1.8 m and over" -> 36.5" or 37.5"
  });

  it('never puts a comparison height on the edge of a range, so no boundary is interpreted', () => {
    // Only the charts of other sources have ambiguous edges ("152-162", "162-184"); our own
    // bands are inclusive and unambiguous (LENGTH_GUIDE, used as is by getSizeAdvice).
    const edges = new Set(SIZE_CHARTS.flatMap((c) => c.rows.flatMap((r) => [r.minCm, r.maxCm ?? -1])));
    expect(LENGTH_GUIDE.length).toBeGreaterThan(0);
    for (const h of COMPARISON_HEIGHTS) expect(edges.has(h), `${h} cm`).toBe(false);
    for (const h of COMPARISON_HEIGHTS) expect(h >= 155 && h <= 195).toBe(true);
  });

  it('shows our own advice exactly as the stickwijzer gives it, without changing the length table', () => {
    for (const [i, h] of COMPARISON_HEIGHTS.entries()) {
      const advice = getSizeAdvice(h);
      expect(COMPARISON_ROWS[i]![1]).toBe(ourAdvice(h));
      expect(COMPARISON_ROWS[i]![1]!.startsWith(String(advice.primaryInch).replace('.', ','))).toBe(true);
    }
  });

  it('only says in the text what the charts show', () => {
    const why = section('Waarom verschillen de tabellen?');
    // "Osaka noemt voor de langste spelers 38 inch, Grays en wij 38,5."
    expect(sizesAt('osaka', 195)).toEqual([38]);
    expect(sizesAt('grays', 195)).toEqual([38.5]);
    expect(getSizeAdvice(195).primaryInch).toBe(38.5);
    // "Princess geeft tussen 1,60 en 1,70 meter en vanaf 1,80 meter twee maten."
    expect(sizesAt('princess', 165)).toHaveLength(2);
    expect(sizesAt('princess', 175)).toHaveLength(1);
    expect(sizesAt('princess', 185)).toHaveLength(2);
    // "Tussen 1,70 en 1,80 meter zijn de tabellen het eens"; "Osaka geeft al vanaf 1,52 meter 36,5 inch, waar de andere 35 noemen."
    for (const h of [172, 175, 178]) for (const c of SIZE_CHARTS) expect(sizesAt(c.id, h), `${c.id} ${h}`).toEqual([36.5]);
    expect(sizesAt('osaka', 153)).toEqual([36.5]);
    expect(sizesAt('grays', 153)).toEqual([35]);
    expect(sizesAt('princess', 153)).toEqual([35]);
    expect(why).toContain('Osaka geeft al vanaf 1,52 meter 36,5 inch');
  });

  it('answers "Ik ben 175 cm" with what the charts and the stickwijzer say', () => {
    const faq = section('Ik ben 175 cm, welke sticklengte?');
    const advice = getSizeAdvice(175);
    expect(advice.primaryInch).toBe(36.5);
    expect(advice.alternativeInch).toBe(37.5);
    for (const c of SIZE_CHARTS) expect(sizesAt(c.id, 175)).toEqual([advice.primaryInch]);
    expect(faq).toContain('allemaal 36,5 inch');
    expect(faq).toContain('37,5 inch als alternatief');
    expect(faq).toContain('van 163 tot 184 cm');
  });

  it('describes the stickwijzer as it is: by height only, without style or position', () => {
    const between = section('Tussen twee maten: 36,5 of 37,5 inch?');
    expect(between).toContain('De stickwijzer kijkt alleen naar de lichaamslengte.');
    expect(between).toContain('Onze tip');
    expect(between).not.toMatch(/\bbeste\b|!|[—–]/);
  });
});
