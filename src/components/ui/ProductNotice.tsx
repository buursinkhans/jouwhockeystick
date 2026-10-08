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
}: {
  /** bol.com does not sell this model, so there is no price to check there. */
  notSoldAtBol?: boolean;
}) {
  return (
    <p className="text-xs text-lijngrijs">
      {notSoldAtBol
        ? 'Richtprijs · niet verkrijgbaar bij bol.com'
        : 'Richtprijs · bekijk actuele prijs bij bol.com'}
    </p>
  );
}
