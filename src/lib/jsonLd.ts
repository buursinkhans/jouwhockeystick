/**
 * Serialises structured data for a <script type="application/ld+json"> tag.
 * JSON.stringify does not escape "<", so a value containing "</script>" (for
 * example a product name from an external feed) could close the tag and run
 * HTML. Escaping <, > and & as Unicode keeps the JSON identical for parsers.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/** The byline of the editorial team: marked up as an organisation. Any other name is a person. */
export const EDITORIAL_AUTHOR = 'Redactie jouwhockeystick.nl';

/**
 * The author in Article and BlogPosting markup. The editorial team is an
 * Organization; a named author (the owner, 2026-11-17) is a Person with a link
 * to /over-ons, where the name and portrait are shown.
 */
export function authorJsonLd(name: string) {
  return name === EDITORIAL_AUTHOR
    ? { '@type': 'Organization', name }
    : { '@type': 'Person', name, url: 'https://jouwhockeystick.nl/over-ons' };
}

/**
 * ItemList for an overview page (decision log 2026-11-08): the items it links
 * to, in the visible order. Google wants Product markup only on the page of
 * one product, so an overview lists links instead of products.
 */
export function itemListJsonLd(
  name: string,
  url: string,
  items: readonly { name: string; url: string; type?: 'Brand' }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      ...(item.type ? { item: { '@type': item.type, name: item.name, url: item.url } } : { name: item.name, url: item.url }),
    })),
  };
}

/** HowTo from steps that are visible on the page, in the same words. */
export function howToJsonLd(name: string, url: string, steps: readonly { name: string; text: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    url,
    step: steps.map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: step.name, text: step.text })),
  };
}
