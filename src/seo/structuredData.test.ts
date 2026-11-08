import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaqSection } from '@/components/article/FaqSection';
import { howToJsonLd, itemListJsonLd } from '@/lib/jsonLd';
import MerkenPage from '@/app/merken/page';

// Structured data of SEO step A (decision log 2026-11-08): valid JSON, and only what the page shows.
const blocks = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1] ?? '{}') as Record<string, unknown>,
  );

describe('structured data', () => {
  it('FaqSection shows each question and puts exactly that text in FAQPage, without markup', () => {
    const items = [
      { question: 'Hoe lang moet mijn stick zijn?', answer: 'Kijk in de [lengtetabel](/kennis/hockeystick-lengte-tabel).' },
      { question: 'Wat kost een stick?', answer: 'Dat hangt af van het **niveau**.' },
    ];
    const html = renderToStaticMarkup(createElement(FaqSection, { id: 'faq', heading: 'Vragen', items, url: 'https://jouwhockeystick.nl/x' }));
    for (const item of items) expect(html).toContain(`>${item.question}</h3>`);
    const [faq] = blocks(html);
    expect(faq).toMatchObject({ '@type': 'FAQPage', url: 'https://jouwhockeystick.nl/x' });
    const answers = (faq!.mainEntity as { acceptedAnswer: { text: string } }[]).map((q) => q.acceptedAnswer.text);
    expect(answers).toEqual(['Kijk in de lengtetabel.', 'Dat hangt af van het niveau.']);
    expect(renderToStaticMarkup(createElement(FaqSection, { id: 'faq', heading: 'Vragen', items: [], url: 'x' }))).toBe('');
  });

  it('ItemList numbers the items in order and never marks them up as Product', () => {
    const list = itemListJsonLd('Merken', 'https://jouwhockeystick.nl/merken', [
      { name: 'Grays', url: 'https://jouwhockeystick.nl/merken#merk-grays', type: 'Brand' },
      { name: 'Brabo', url: 'https://jouwhockeystick.nl/merken#merk-brabo', type: 'Brand' },
    ]);
    expect(list).toMatchObject({ '@type': 'ItemList', numberOfItems: 2 });
    expect(list.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(JSON.stringify(list)).not.toContain('"Product"');
  });

  it('HowTo numbers its steps', () => {
    const howTo = howToJsonLd('Kiezen', 'https://jouwhockeystick.nl/stickwijzer', [
      { name: 'Een', text: 'Eerste stap.' },
      { name: 'Twee', text: 'Tweede stap.' },
    ]);
    expect(howTo.step.map((s) => [s['@type'], s.position])).toEqual([
      ['HowToStep', 1],
      ['HowToStep', 2],
    ]);
  });

  it('/merken lists every brand on the page, each with its own anchor', () => {
    const html = renderToStaticMarkup(MerkenPage());
    const list = blocks(html).find((b) => b['@type'] === 'ItemList') as { itemListElement: { item: { name: string; url: string } }[] };
    expect(list.itemListElement.length).toBeGreaterThan(5);
    for (const { item } of list.itemListElement) {
      const anchor = item.url.split('#')[1]!;
      expect(html, item.name).toContain(`id="${anchor}"`);
    }
  });
});
