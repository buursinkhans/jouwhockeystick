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
  sizeLegend: 'Jouw maat',
  noCurrentPrice: 'prijs niet actueel',
  checkPrice: 'Bekijk de actuele prijs',
  howWeCompare: 'Hoe we vergelijken',
  howWeCompareText:
    'Gesorteerd op prijs plus verzendkosten, voor één stick. Alleen winkels waarmee we een partnerprogramma hebben. We krijgen een vergoeding als je via een link koopt; dat verandert de volgorde niet. Prijzen komen uit de productfeeds van de winkels en zijn hooguit 14 dagen oud; de winkel toont na de klik de actuele prijs. Verzendkosten komen uit de openbare voorwaarden van de winkel (de goedkoopste standaardoptie).',
  seller: 'De winkel is de verkoper: die levert en regelt retouren en garantie.',
} as const;

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
