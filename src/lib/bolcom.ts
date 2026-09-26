/**
 * Generic bol.com search link — not a real affiliate/tracking link yet.
 * Once a real bol.com Partnerprogramma account exists, add its tracking
 * parameter here (e.g. from an env var) rather than hardcoding one now.
 */
export function getBolComSearchUrl(productName: string): string {
  const params = new URLSearchParams({ searchtext: productName });
  return `https://www.bol.com/nl/nl/s/?${params.toString()}`;
}
