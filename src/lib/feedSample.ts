/**
 * Helpers for a read-only look at an unknown XML product feed (scripts/decathlon-feed-check.ts):
 * which tag is one product, which fields a product has, a masked sample of the hockey products.
 * Pure functions, tested with small synthetic XML. A feed URL can hold a signature or key, so
 * everything that is printed goes through maskSecrets() first.
 */

/** Tags that usually mean "one product" in a feed, in the order they are tried when counts tie. */
export const ITEM_TAGS = ['product', 'item', 'entry', 'offer', 'Product', 'Item'] as const;

/** The product tag: the candidate that occurs most often in a sample of the feed, or null. */
export function detectItemTag(sample: string): string | null {
  let best: { tag: string; count: number } | null = null;
  for (const tag of ITEM_TAGS) {
    const count = sample.split(new RegExp(`<${tag}[\\s>]`)).length - 1;
    if (count > 0 && (!best || count > best.count)) best = { tag, count };
  }
  return best?.tag ?? null;
}

/** Query values of keys that look like a secret are replaced, and so are long hex strings. */
export function maskSecrets(text: string): string {
  return text
    .replace(/([?&;](?:signature|sig|token|key|apikey|api_key|secret|password)=)[^&\s"'<>]+/gi, '$1***')
    .replace(/\b[0-9a-f]{32,}\b/gi, '***');
}

const unwrap = (value: string) => value.replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '').trim();

/** The leaf fields of one product (`<name>value</name>`), nested products flattened with a dotted name; attributes ignored. */
export function leafFields(itemXml: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const walk = (xml: string, prefix: string) => {
    for (const match of xml.matchAll(/<([A-Za-z_][\w:.-]*)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
      const name = prefix ? `${prefix}.${match[1]}` : (match[1] as string);
      const inner = match[2] as string;
      if (/<([A-Za-z_][\w:.-]*)(?:\s[^>]*)?>[\s\S]*?<\/\1>/.test(inner) && !inner.trimStart().startsWith('<![CDATA[')) walk(inner, name);
      else if (!(name in fields)) fields[name] = unwrap(inner);
    }
  };
  // The product element itself is not a field: read what is inside it.
  const outer = itemXml.trim().match(/^<([A-Za-z_][\w:.-]*)(?:\s[^>]*)?>([\s\S]*)<\/\1>$/);
  walk(outer ? (outer[2] as string) : itemXml, '');
  return fields;
}

const HOCKEY = /hockey/i;
const STICK = /\b(stick|sticks|hockeystick|hockeysticks)\b/i;
const SHOE = /schoen|shoe/i;

export type Kind = 'stick' | 'schoen' | 'ander';

/** A product is a hockey stick or a hockey shoe when its text says hockey and stick or shoe; everything else is "ander". */
export function kindOf(fields: Record<string, string>): Kind {
  const text = Object.values(fields).join(' ');
  if (!HOCKEY.test(text)) return 'ander';
  if (SHOE.test(text) && !STICK.test(fields.title ?? fields.name ?? '')) return 'schoen';
  return STICK.test(text) ? 'stick' : 'ander';
}

const clip = (value: string, max = 160) => (value.length > max ? `${value.slice(0, max)}…` : value);

/** One product as a few readable lines, with secrets masked and long values clipped. */
export function describeItem(fields: Record<string, string>): string {
  return Object.entries(fields)
    .filter(([, value]) => value !== '')
    .map(([name, value]) => `  ${name}: ${maskSecrets(clip(value))}`)
    .join('\n');
}

export type Summary = {
  total: number;
  fieldNames: string[];
  counts: Record<Kind, number>;
  samples: Record<'stick' | 'schoen', Record<string, string>[]>;
  /** Of the hockey sticks: how many have a value in a field that looks like an EAN, a price, a stock or a link field. */
  stickFields: { ean: number; price: number; stock: number; link: number };
};

const EAN = /^(ean|gtin|barcode|gtin13|ean13)$/i;
const PRICE = /price|prijs/i;
const STOCK = /stock|voorraad|availability|beschikbaar/i;
const LINK = /link|url/i;

/** Collects what a look at the feed needs, one product at a time, without keeping them all in memory. */
export class FeedSummary {
  total = 0;
  private names = new Set<string>();
  private counts: Record<Kind, number> = { stick: 0, schoen: 0, ander: 0 };
  private samples: Summary['samples'] = { stick: [], schoen: [] };
  private stickFields = { ean: 0, price: 0, stock: 0, link: 0 };

  private readonly maxSamples: number;

  // No parameter property (`private readonly x`): Node's type stripping does not support it, and the script runs on plain Node.
  constructor(maxSamples = 6) {
    this.maxSamples = maxSamples;
  }

  add(itemXml: string) {
    const fields = leafFields(itemXml);
    this.total += 1;
    if (this.total <= 200) for (const name of Object.keys(fields)) this.names.add(name);
    const kind = kindOf(fields);
    this.counts[kind] += 1;
    if (kind === 'ander') return;
    const samples = this.samples[kind];
    if (samples.length < this.maxSamples) samples.push(fields);
    if (kind === 'stick') {
      const filled = (test: RegExp, check: (value: string) => boolean = () => true) =>
        Object.entries(fields).some(([name, value]) => test.test(name) && value.trim() !== '' && check(value));
      if (filled(EAN, (value) => /^\d{8,14}$/.test(value.trim()))) this.stickFields.ean += 1;
      if (filled(PRICE, (value) => /\d/.test(value))) this.stickFields.price += 1;
      if (filled(STOCK)) this.stickFields.stock += 1;
      if (filled(LINK)) this.stickFields.link += 1;
    }
  }

  result(): Summary {
    return { total: this.total, fieldNames: [...this.names].sort(), counts: this.counts, samples: this.samples, stickFields: this.stickFields };
  }
}

/** The report in Dutch Markdown. */
export function summaryReport(summary: Summary, itemTag: string, bytes: number): string {
  const sticks = summary.counts.stick;
  const lines = [
    '# Decathlon-feed (alleen lezen)',
    '',
    `Gelezen: ${(bytes / 1_048_576).toFixed(1)} MB. Productregels (tag \`<${itemTag}>\`): ${summary.total}.`,
    `Hockey: ${sticks} sticks, ${summary.counts.schoen} schoenen, ${summary.counts.ander} regels zonder hockey of zonder stick of schoen.`,
    '',
    `Velden bij een stick (aantal van ${sticks}): een EAN ${summary.stickFields.ean}, een prijs ${summary.stickFields.price}, voorraad ${summary.stickFields.stock}, een link ${summary.stickFields.link}.`,
    '',
    '## Velden van een product',
    '',
    summary.fieldNames.length ? summary.fieldNames.map((name) => `\`${name}\``).join(', ') : 'Geen velden gevonden.',
    '',
  ];
  for (const kind of ['stick', 'schoen'] as const) {
    lines.push(`## Voorbeeld${kind === 'stick' ? 'en van een stick' : 'en van een schoen'}`, '');
    if (summary.samples[kind].length === 0) lines.push('Geen.', '');
    for (const sample of summary.samples[kind]) lines.push('```', describeItem(sample), '```', '');
  }
  lines.push('Waarden zijn ingekort, en een sleutel of handtekening in een link is vervangen door `***`.');
  return lines.join('\n');
}
