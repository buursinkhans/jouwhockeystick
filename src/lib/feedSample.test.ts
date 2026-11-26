import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { describeItem, detectItemTag, FeedSummary, kindOf, leafFields, maskSecrets, summaryReport } from './feedSample';

// DEMO — GEEN WERKELIJKE DATA: a synthetic feed, not Decathlon's.
const stick = (n: number, extra = '') => `<product>
  <id>${n}</id>
  <title><![CDATA[Demo hockeystick ${n} 36,5 inch]]></title>
  <description>Een stick voor veldhockey</description>
  <price>49.95</price>
  <ean>870000000000${n}</ean>
  <stock>in stock</stock>
  <link>https://tracking.example/l/abc?signature=0123456789abcdef0123456789abcdef&amp;utm_source=x</link>${extra}
</product>`;
const shoe = `<product><id>9</id><title>Hockeyschoenen demo</title><price>59</price></product>`;
const other = `<product><id>8</id><title>Voetbal demo</title><price>9.99</price></product>`;
const feed = `<?xml version="1.0"?><products>${stick(1)}${stick(2)}${shoe}${other}</products>`;

describe('detectItemTag', () => {
  it('kiest de tag die het vaakst voorkomt', () => {
    expect(detectItemTag(feed)).toBe('product');
    expect(detectItemTag('<rss><item>a</item><item>b</item><entry>c</entry></rss>')).toBe('item');
  });
  it('geeft null als er geen productregel is', () => {
    expect(detectItemTag('<a><b>1</b></a>')).toBeNull();
    expect(detectItemTag('')).toBeNull();
  });
  it('telt <products> niet als <product>', () => {
    expect(detectItemTag('<products></products>')).toBeNull();
  });
});

describe('maskSecrets', () => {
  it('vervangt de waarde van een handtekening of sleutel in een link', () => {
    expect(maskSecrets('https://x.example/feed.xml?signature=abc123&b=1')).toBe('https://x.example/feed.xml?signature=***&b=1');
    expect(maskSecrets('https://x.example/?token=geheim')).toBe('https://x.example/?token=***');
    expect(maskSecrets('https://x.example/?a=1&apikey=geheim&b=2')).toContain('apikey=***');
  });
  it('vervangt een lange hex-reeks waar die ook staat', () => {
    expect(maskSecrets('de code 267ce95648a7f90765e0f03e3971d4a2f1 hier')).toBe('de code *** hier');
  });
  it('laat gewone tekst en korte getallen met rust', () => {
    expect(maskSecrets('Demo hockeystick 36,5 inch, EAN 8700000000001')).toBe('Demo hockeystick 36,5 inch, EAN 8700000000001');
  });
});

describe('leafFields', () => {
  it('leest de velden van een product, met CDATA uitgepakt', () => {
    const fields = leafFields(stick(1));
    expect(fields.title).toBe('Demo hockeystick 1 36,5 inch');
    expect(fields.price).toBe('49.95');
    expect(fields.ean).toBe('8700000000001');
  });
  it('maakt van een genest veld een naam met een punt', () => {
    const fields = leafFields('<product><shipping><cost>4.95</cost></shipping><title>x</title></product>');
    expect(fields['shipping.cost']).toBe('4.95');
    expect(fields.title).toBe('x');
  });
});

describe('kindOf', () => {
  it('herkent een hockeystick, een hockeyschoen en de rest', () => {
    expect(kindOf(leafFields(stick(1)))).toBe('stick');
    expect(kindOf(leafFields(shoe))).toBe('schoen');
    expect(kindOf(leafFields(other))).toBe('ander');
  });
  it('een stick voor een ander spel is geen hockeystick', () => {
    expect(kindOf({ title: 'Honkbalstick demo' })).toBe('ander');
  });
});

describe('FeedSummary en het rapport', () => {
  const summary = new FeedSummary(1);
  for (const item of feed.match(/<product>[\s\S]*?<\/product>/g) ?? []) summary.add(item);
  const result = summary.result();

  it('telt sticks, schoenen en de rest, en houdt het aantal voorbeelden beperkt', () => {
    expect(result.total).toBe(4);
    expect(result.counts).toEqual({ stick: 2, schoen: 1, ander: 1 });
    expect(result.samples.stick).toHaveLength(1);
    expect(result.samples.schoen).toHaveLength(1);
  });
  it('telt bij de sticks de velden die er zijn: EAN, prijs, voorraad en link', () => {
    expect(result.stickFields).toEqual({ ean: 2, price: 2, stock: 2, link: 2 });
    expect(result.fieldNames).toEqual(expect.arrayContaining(['ean', 'price', 'link', 'title']));
  });
  it('het rapport noemt de aantallen en de velden, in het Nederlands', () => {
    const text = summaryReport(result, 'product', 2_097_152);
    expect(text).toContain('2.0 MB');
    expect(text).toContain('2 sticks, 1 schoenen');
    expect(text).toContain('een EAN 2, een prijs 2, voorraad 2, een link 2');
  });
  it('de handtekening in een link komt nooit in het rapport', () => {
    const text = summaryReport(result, 'product', 100);
    expect(text).not.toContain('0123456789abcdef0123456789abcdef');
    expect(text).toContain('signature=***');
    expect(describeItem(leafFields(stick(1)))).not.toContain('0123456789abcdef');
  });
  it('houdt de huisstijl: geen uitroeptekens in de vaste tekst', () => {
    const text = summaryReport(result, 'product', 100).split('\n').filter((line) => !line.startsWith('  ')).join('\n');
    expect(text).not.toContain('!');
  });
});

describe('het script en de workflow', () => {
  const script = readFileSync('scripts/decathlon-feed-check.ts', 'utf8');
  const workflow = readFileSync('.github/workflows/decathlon-feed-check.yml', 'utf8');
  it('het script drukt de feed-URL nooit af en gebruikt geen console', () => {
    expect(script).not.toMatch(/console\./);
    expect(script).not.toMatch(/(write|stop)\([^)]*\burl\b/);
    expect(script).toContain('De feed gaf HTTP ${response.status}');
  });
  it('de workflow is alleen-lezen, handmatig en haalt de URL uit een secret', () => {
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).not.toContain('schedule:');
    expect(workflow).toContain('contents: read');
    expect(workflow).not.toMatch(/issues: write|contents: write|pull-requests: write/);
    expect(workflow).toContain('ODYSSEY_FEED_URL: ${{ secrets.ODYSSEY_FEED_URL }}');
    expect(workflow).not.toMatch(/^\s*set -x/m);
  });
});

describe('categoriepad en merken (Decathlon-feed)', () => {
  const rowXml = (path: string, brand: string, page: string, name = 'Hockeystick demo') =>
    `<product><productURL>https://www.decathlon.nl/p/${page}?utm_source=x&amp;utm_campaign=1</productURL><name>${name}</name><brand>${brand}</brand><categoryPath>${path}</categoryPath><price>10</price></product>`;

  it('het categoriepad gaat voor de tekst: een tas met "hockeystick" in de naam is geen stick', () => {
    expect(kindOf(leafFields(rowXml('Hockey&gt;Hockey accessoires&gt;Hockeytassen', 'Korok', 'tas/1/2', 'Sticktas voor hockeysticks')))).toBe('ander');
    expect(kindOf(leafFields(rowXml('Hockey&gt;Hockeysticks&gt;Hockeysticks per merk&gt;Dita', 'Dita', 'x/1/2')))).toBe('stick');
    expect(kindOf(leafFields(rowXml('Hockey&gt;Hockeyschoenen&gt;Hockeyschoenen per merk', 'Grays', 'y/1/2', 'Schoenen')))).toBe('schoen');
    expect(kindOf(leafFields(rowXml('Ijshockey&gt;Ijshockeyschaatsen', 'Oxelo', 'z/1/2', 'Schaatsen hockey')))).toBe('ander');
  });
  it('decodeert de entiteiten van het pad', () => {
    expect(leafFields(rowXml('Hockey&gt;Hockeysticks', 'A', 'x/1/2')).categoryPath).toBe('Hockey>Hockeysticks');
  });

  const summary = new FeedSummary();
  for (const xml of [
    rowXml('Hockey&gt;Hockeysticks&gt;a', 'Dita', 'dita-a/1/2'),
    rowXml('Hockey&gt;Hockeysticks&gt;a', 'Dita', 'dita-a/1/2'), // a second size of the same page
    rowXml('Hockey&gt;Hockeysticks&gt;a', 'Dita', 'dita-b/3/4'),
    rowXml('Hockey&gt;Hockeysticks&gt;a', 'Kipsta', 'kip/5/6'),
    rowXml('Hockey&gt;Hockeyschoenen&gt;a', 'Dita', 'schoen/7/8', 'Schoen'),
  ]) summary.add(xml);
  const result = summary.result();

  it('telt per merk de productpagina\'s en niet de regels, gesplitst in sticks en schoenen', () => {
    expect(result.brands).toEqual([
      { brand: 'Dita', sticks: 2, schoenen: 1 },
      { brand: 'Kipsta', sticks: 1, schoenen: 0 },
    ]);
  });
  it('het rapport toont de merkentabel en zet erbij of het merk in onze catalogus staat', () => {
    const text = summaryReport(result, 'product', 100, (brand) => brand === 'Dita');
    expect(text).toContain('## Merken');
    expect(text).toContain('| Dita | 2 | 1 | ja |');
    expect(text).toContain('| Kipsta | 1 | 0 | **nee** |');
    expect(summaryReport(result, 'product', 100)).not.toContain('In onze catalogus');
  });
});
