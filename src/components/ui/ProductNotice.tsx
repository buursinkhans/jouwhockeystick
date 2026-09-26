/**
 * Compact, single-line disclosure: the shown price is the manufacturer's
 * own recommended retail price, sourced with a real URL per product
 * (see priceIndicativeEur.sourceUrl) — not a live bol.com price.
 */
export function ProductNotice() {
  return <p className="text-xs text-zinc-500">Adviesprijs (fabrikant) · bekijk bij bol.com</p>;
}
