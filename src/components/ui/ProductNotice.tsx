/**
 * Compact, single-line disclosure. Deliberately generic: most prices are
 * the manufacturer's own recommended retail price, but some (e.g. adidas,
 * whose own site blocks automated access) are a bol.com listing-price
 * snapshot instead — never claim "fabrikant" here, since that would be
 * wrong for the latter. See priceIndicativeEur.sourceLabel per product for
 * the exact provenance.
 */
export function ProductNotice({
  notSoldAtBol = false,
  passaSportsOnly = false,
  alsoAtPassaSports = false,
  alsoAtPlutosport = false,
}: {
  /** bol.com does not sell this model, so there is no price to check there. */
  notSoldAtBol?: boolean;
  /** The price is a PassaSports snapshot; the shop link goes there. */
  passaSportsOnly?: boolean;
  /** Sold at PassaSports (with or without bol.com). */
  alsoAtPassaSports?: boolean;
  /** Sold at Plutosport (with or without bol.com). */
  alsoAtPlutosport?: boolean;
}) {
  const shops = [
    ...(notSoldAtBol ? [] : ['bol.com']),
    ...(alsoAtPassaSports || passaSportsOnly ? ['PassaHockey'] : []),
    ...(alsoAtPlutosport ? ['Plutosport'] : []),
  ];
  const where =
    shops.length <= 1
      ? (shops[0] ?? '')
      : `${shops.slice(0, -1).join(', ')} of ${shops[shops.length - 1]}`;
  const text =
    shops.length === 0
      ? 'Richtprijs · niet verkrijgbaar bij bol.com'
      : notSoldAtBol && passaSportsOnly
        ? `Richtprijs van PassaHockey · bekijk actuele prijs bij ${where}`
        : `Richtprijs · bekijk actuele prijs bij ${where}`;
  return <p className="text-xs text-lijngrijs">{text}</p>;
}
