/**
 * Partner-link disclosure, in two sizes: a short label at every shop button
 * and one sentence per advice result and product page. The full
 * explanation lives on /methodiek#partnerlinks.
 */
export const PARTNER_LINK_LABEL = 'Partnerlink';

export const PARTNER_LINK_NOTE =
  'Links naar bol.com, PassaHockey en Plutosport zijn partnerlinks: we kunnen een vergoeding krijgen als je via zo’n link koopt.';

export const PARTNER_LINK_URL = '/methodiek#partnerlinks';

/** How the disclosure names each shop other than bol.com. */
export const SHOP_SELLER_NAMES = {
  passasports: 'PassaHockey (PassaSports)',
  plutosport: 'Plutosport',
} as const;

const joinShops = (shops: readonly string[]) =>
  shops.length <= 1
    ? (shops[0] ?? '')
    : `${shops.slice(0, -1).join(', ')} en ${shops[shops.length - 1]}`;

const seller = (shops: readonly string[]) =>
  shops.length === 1
    ? `${shops[0]} is dan de verkoper.`
    : 'De winkel waar je koopt, is dan de verkoper.';

/** For sticks that bol.com does not sell, but other partner shops do. */
export function notAtBolNote(shops: readonly string[]): string {
  return `Niet te koop bij bol.com, wel bij ${joinShops(shops)}. ${seller(shops)}`;
}

/** For feed-imported sticks: we have not checked bol.com, so we say nothing about it. */
export function sellerNote(shops: readonly string[]): string {
  return shops.length === 1
    ? `${shops[0]} is de verkoper.`
    : 'De winkel waar je koopt, is de verkoper.';
}
