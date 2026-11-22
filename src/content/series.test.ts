import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SERIES, evaluateSeries, seriesPath } from '@/catalog/series';
import { plainText } from '@/components/article/inlineMarkup';
import { MAX_DESCRIPTION_LENGTH } from '@/lib/site';
import SeriesPage, { generateMetadata, generateStaticParams } from '@/app/vergelijk/[reeks]/page';
import { getArticleBySlug } from './index';
import { chooseBlocks, priceOnlyNote, seriesDescription, seriesFaq, seriesIntro, seriesReadMore, seriesTitle } from './series';

const evaluations = SERIES.map((s) => evaluateSeries(s));
const FORBIDDEN = /\b(beste|goedkoopst\w*|scherpste prijs|onafhankelijk\w*|objectief|objectieve|persoonlijk advies|korting\w*|bespaar\w*|gegarandeerd|ideaal|ideale|perfect\w*)\b/i;

describe.each(evaluations.map((e) => [e.series.slug, e] as const))('text of %s', (_slug, e) => {
  const all = () => [seriesTitle(e), seriesDescription(e), seriesIntro(e), priceOnlyNote(e) ?? '', ...chooseBlocks(e).flatMap((b) => b.points), ...seriesFaq(e).flatMap((f) => [f.question, f.answer])].join('\n');

  it('has a title of at most 60 characters and a description that fits without being cut', () => {
    expect(seriesTitle(e).length).toBeLessThanOrEqual(60);
    expect(seriesDescription(e).length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect(seriesTitle(e)).toContain('vergeleken');
  });

  it('answers in the first 80 words: it names every stick with its facts', () => {
    const intro = seriesIntro(e);
    expect(intro.split(/\s+/).length).toBeLessThanOrEqual(80);
    for (const m of e.members) expect(intro).toContain(m.label);
  });

  it('makes no ranking, discount or absolute claim, and follows the house style', () => {
    const text = all();
    expect(text).not.toMatch(FORBIDDEN);
    expect(text).not.toMatch(/[!—–]/);
    expect((text.match(/\bniet\b[^.]{0,60}\bmaar\b/gi) ?? []).length).toBeLessThanOrEqual(1);
  });

  it('gives each stick a "Kies de … als" block of two or three points from the data', () => {
    const blocks = chooseBlocks(e);
    expect(blocks.map((b) => b.label)).toEqual(e.members.map((m) => m.label));
    for (const b of blocks) {
      expect(b.points.length).toBeGreaterThanOrEqual(2);
      expect(b.points.length).toBeLessThanOrEqual(3);
      expect(new Set(b.points).size).toBe(b.points.length);
    }
    // Two sticks that differ only in price do not get the same block.
    const sig = blocks.map((b) => b.points.join('|'));
    expect(new Set(sig).size).toBe(sig.length);
  });

  it('has three to five questions, with no prices in the answers, and links that exist', () => {
    const faq = seriesFaq(e);
    expect(faq.length).toBeGreaterThanOrEqual(3);
    expect(faq.length).toBeLessThanOrEqual(5);
    for (const f of faq) expect(f.answer).not.toContain('€');
    const links = [...faq.map((f) => f.answer).join(' ').matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]!);
    for (const href of links) {
      const slug = href.split('/')[2];
      if (href.startsWith('/kennis/')) expect(getArticleBySlug(slug!), href).toBeDefined();
    }
  });

  it('uses the real titles of the articles it links to', () => {
    for (const link of seriesReadMore(e).filter((l) => l.href.startsWith('/kennis/'))) {
      expect(getArticleBySlug(link.href.split('/')[2]!)?.title, link.href).toBe(link.label);
    }
  });
});

describe('titles and descriptions', () => {
  it('are unique per series', () => {
    expect(new Set(evaluations.map(seriesTitle)).size).toBe(evaluations.length);
    expect(new Set(evaluations.map(seriesDescription)).size).toBe(evaluations.length);
  });
});

describe('the page /vergelijk/[reeks]', () => {
  it('is built for exactly the defined series', async () => {
    expect(generateStaticParams()).toEqual(SERIES.map((s) => ({ reeks: s.slug })));
  });

  it('returns a 404 for an address that is not a series', async () => {
    await expect(SeriesPage({ params: Promise.resolve({ reeks: 'bestaat-niet' }) })).rejects.toThrow();
  });

  it.each(evaluations.map((e) => [e.series.slug, e] as const))('%s: has one H1, unique ids, a price block per stick and FAQ data equal to the visible text', async (slug, e) => {
    const html = renderToStaticMarkup(await SeriesPage({ params: Promise.resolve({ reeks: slug }) }));
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!);
    expect(new Set(ids).size, 'duplicate ids').toBe(ids.length);
    for (const m of e.members) expect(html).toContain(`Waar te koop: ${m.label}`);
    expect(html).toContain('Hoe we vergelijken');
    expect(html).toContain('Partnerlink');
    // The shop block's own note on shipping says "de goedkoopste standaardoptie": that is no price claim.
    expect(html).not.toMatch(/goedkoopst(?!e standaardoptie)|beste prijs|scherpste prijs/i);
    const json = html.match(/<script type="application\/ld\+json">(\{"@context":"https:\/\/schema.org","@type":"FAQPage".*?\})<\/script>/)?.[1];
    expect(json).toBeDefined();
    const parsed = JSON.parse(json!.replace(/\\u003c/g, '<')) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    for (const [i, f] of seriesFaq(e).entries()) {
      expect(parsed.mainEntity[i]?.name).toBe(f.question);
      expect(parsed.mainEntity[i]?.acceptedAnswer.text).toBe(plainText(f.answer));
      expect(html).toContain(f.question);
    }
  });

  it.each(evaluations.map((e) => [e.series.slug, e] as const))('%s: has its own canonical and is not set to noindex while it passes the gate', async (slug, e) => {
    const meta = await generateMetadata({ params: Promise.resolve({ reeks: slug }) });
    expect(meta.alternates?.canonical).toBe(seriesPath(slug));
    expect(meta.robots).toBeUndefined();
    expect(e.indexable).toBe(true);
  });
});
