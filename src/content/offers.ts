/**
 * Texts of "Waar te koop" (docs/spec/prijsvergelijking.md §2). Only the
 * current feed price with its date: no old or "from" prices, no discounts,
 * no "cheapest" or "best price".
 */
export const OFFER_TEXT = {
  heading: 'Waar te koop',
  none: 'We kennen nog geen partnerwinkel die deze stick verkoopt. Het advies blijft staan; vraag ernaar bij je hockeywinkel.',
  /** On a stick page there is no advice to keep. */
  noneOnPage: 'We kennen nog geen partnerwinkel die deze stick verkoopt. Vraag ernaar bij je hockeywinkel.',
  sortNote: 'op prijs incl. verzending',
  /** Badge on the top row when it is strictly the lowest total (hasLowestBadge); never "goedkoopst" or "beste prijs". */
  lowestBadge: 'Laagste prijs',
  sizeLegend: 'Jouw maat',
  noCurrentPrice: 'prijs niet actueel',
  checkPrice: 'Bekijk de actuele prijs',
  howWeCompare: 'Hoe we vergelijken',
  howWeCompareText:
    'Gesorteerd op prijs plus verzendkosten, voor één stick. Alleen winkels waarmee we een partnerprogramma hebben. We krijgen een vergoeding als je via een link koopt; dat verandert de volgorde niet. Prijzen komen uit de productfeeds van de winkels en zijn hooguit 14 dagen oud; de winkel toont na de klik de actuele prijs. Verzendkosten komen uit de openbare voorwaarden van de winkel (de goedkoopste standaardoptie).',
  /** The same for one pair of hockey shoes (decision log 2026-11-01). */
  howWeCompareTextShoe:
    'Gesorteerd op prijs plus verzendkosten, voor één paar. Alleen winkels waarmee we een partnerprogramma hebben. We krijgen een vergoeding als je via een link koopt; dat verandert de volgorde niet. Prijzen komen uit de productfeeds van de winkels en zijn hooguit 14 dagen oud; de winkel toont na de klik de actuele prijs. Verzendkosten komen uit de openbare voorwaarden van de winkel (de goedkoopste standaardoptie).',
  seller: 'De winkel is de verkoper: die levert en regelt retouren en garantie.',
  /**
   * Product cards (2026-11-05). "Laagste prijs" names the lowest current total
   * among our partner shops in stock, the same order as "Waar te koop"; never
   * "goedkoopst" or "beste prijs". The line under the price says what the
   * shipping is, or that it is unknown.
   */
  cardLowest: 'Laagste prijs',
  /** One shop with a current price, or unknown shipping: nothing to call "laagste" (2026-11-09). */
  cardPrice: 'Prijs',
  /** The card's main action, to the shops on the stick page; the count stands top right. */
  cardCompareShops: 'Bekijk maten en prijzen',
  cardIndicative: 'Richtprijs',
  cardNoCurrentPrice: 'geen actuele winkelprijs op voorraad',
  cardNoShop: 'nog geen partnerwinkel bekend',
  cardPartnerNote: 'Partnerlink bij doorklikken naar winkels',
  /** One shop: the line where the direct link stands on other cards, so prices stay level. */
  cardOnlyShop: (shop: string) => `Alleen bij ${shop} gevonden`,
} as const;

/** What the lowest price includes, and where: "incl. €4,95 verzending · bij Daka". */
export function shippingAt(shipping: number | null, shop: string): string {
  const what =
    shipping === null ? 'verzendkosten onbekend' : shipping === 0 ? 'gratis verzending' : `incl. ${euro(shipping)} verzending`;
  return `${what} · bij ${shop}`;
}

const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/** "26 okt" from 2026-10-26. */
export function shortDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-').map(Number);
  return `${day} ${MONTHS[(month ?? 1) - 1]}`;
}

/** €125,90 */
export const euro = (amount: number) => `€${amount.toFixed(2).replace('.', ',')}`;

/** 36,5" */
export const inch = (length: number) => `${String(length).replace('.', ',')}"`;

/** "1 partnerwinkel", "3 partnerwinkels" */
export const shopCount = (count: number) => `${count} partnerwinkel${count === 1 ? '' : 's'}`;

/** "gelezen op 26 okt" or, when the shops' prices were read on different days, "gelezen tussen 20 en 26 okt". */
export function readLine(dates: readonly string[]): string | null {
  if (dates.length === 0) return null;
  const sorted = [...new Set(dates)].sort();
  const first = sorted[0] as string;
  const last = sorted[sorted.length - 1] as string;
  return first === last ? `gelezen op ${shortDate(first)}` : `gelezen tussen ${shortDate(first)} en ${shortDate(last)}`;
}

/** "€119,95 + €5,95 verzending", "€119,95, gratis verzending", "€19,95 + verzendkosten onbekend" */
export function priceBreakdown(price: number, shipping: number | null): string {
  if (shipping === null) return `${euro(price)} + verzendkosten onbekend`;
  if (shipping === 0) return `${euro(price)}, gratis verzending`;
  return `${euro(price)} + ${euro(shipping)} verzending`;
}

/**
 * One line above the shops in an advice (UX phase 4, 2026-11-08): whether the
 * advised length is in stock, according to the feeds and with their date.
 * Never a delivery promise ("morgen in huis"): the feeds give no reliable
 * delivery time, and the shop confirms stock after the click. Null when no
 * shop has a current price in stock.
 */
export function sizeStockLine(
  stock: { inSize: number; unknown: number; stocked: number; total: number; readAt: readonly string[] },
  size: number,
): { tone: 'yes' | 'unknown' | 'none'; text: string } | null {
  if (stock.stocked === 0) return null;
  if (stock.inSize > 0) {
    const read = readLine(stock.readAt);
    const where =
      stock.total === 1
        ? 'volgens de feed van de winkel'
        : `bij ${stock.inSize === stock.total ? `alle ${stock.total}` : `${stock.inSize} van ${stock.total}`} winkels volgens hun feeds`;
    return { tone: 'yes', text: `${inch(size)} op voorraad ${where}${read ? `, ${read}` : ''}` };
  }
  if (stock.unknown > 0) return { tone: 'unknown', text: `Of ${inch(size)} op voorraad is, zie je na de klik bij de winkel` };
  return { tone: 'none', text: `${inch(size)} is volgens de feeds nu nergens op voorraad, andere lengtes wel` };
}

/** What the feed says about lengths, for one shop. */
export function stockLine({
  inStock,
  lengths,
  size,
}: {
  inStock: boolean;
  lengths?: readonly number[];
  size: number | null;
}): string {
  if (!inStock) return 'niet op voorraad volgens de feed';
  if (!lengths) return 'maat kiezen bij de winkel';
  if (size === null) return `op voorraad in ${lengths.map(inch).join(', ')}`;
  if (lengths.some((length) => Math.abs(length - size) < 0.01)) return `${inch(size)} op voorraad`;
  const others = lengths.map(inch);
  const listed = others.length <= 1 ? (others[0] ?? '') : `${others.slice(0, -1).join(', ')} en ${others[others.length - 1]}`;
  return `${inch(size)} niet op voorraad · wel ${listed}`;
}
