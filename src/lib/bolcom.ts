/**
 * Generic bol.com search link — not a real affiliate/tracking link yet.
 * Once a real bol.com Partnerprogramma account exists, add its tracking
 * parameter here (e.g. from an env var) rather than hardcoding one now.
 *
 * Always appends "hockeystick" to the search text: a bare model name (e.g.
 * "JDH X93 Pro Bow") can otherwise match unrelated bol.com products such as
 * headphones, since bol.com's search matches on loose word overlap.
 */
export function getBolComSearchUrl(productName: string): string {
  const params = new URLSearchParams({ searchtext: `${productName} hockeystick` });
  return `https://www.bol.com/nl/nl/s/?${params.toString()}`;
}
