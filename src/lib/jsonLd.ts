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
