import { isReadDateFresh } from '@/catalog/offers/sort';
import { euro } from '@/content/offers';
import type { SearchItem } from './engine';

/**
 * The price line under a stick in the search results. Same rules as "Waar te
 * koop" (CLAUDE.md, Commerce): only a current feed price (read at most 14 days
 * ago, judged in the browser), with the number of shops; without one the
 * indicative price, marked as such; without that nothing. Never "cheapest",
 * "best price" or a discount.
 */
export type PriceLine = { text: string; indicative: boolean };

export function priceLine(item: SearchItem, now: Date): PriceLine | null {
  const price = item.price;
  if (!price) return null;
  const current = price.shopEur !== undefined && price.shopCount !== undefined && price.readAt !== undefined && isReadDateFresh(price.readAt, now);
  if (current) {
    const shops = price.shopCount as number;
    const amount = euro(price.shopEur as number);
    return {
      text: shops === 1 ? `${amount} incl. verzending bij 1 winkel` : `Vergelijk prijzen vanaf ${amount} bij ${shops} winkels`,
      indicative: false,
    };
  }
  if (price.indicativeEur != null) return { text: `Richtprijs ${euro(price.indicativeEur)}, geen actuele winkelprijs`, indicative: true };
  return null;
}

/** "70% carbon · Low bow", "geen carbon · Mid bow", or what is known. */
export function stickFacts(item: SearchItem): string {
  const parts: string[] = [];
  if (item.carbon !== undefined && item.carbon !== null) parts.push(item.carbon === 0 ? 'geen carbon' : `${item.carbon}% carbon`);
  if (item.bow) parts.push(item.bow);
  return parts.join(' · ');
}

/** The model name without the brand in front of it: the brand has its own line above. */
export function stickModel(item: SearchItem): string {
  const brand = item.brand;
  if (!brand || !item.title.toLowerCase().startsWith(`${brand.toLowerCase()} `)) return item.title;
  return item.title.slice(brand.length + 1);
}
