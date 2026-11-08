import { isJuniorStick } from '@/catalog/similar';
import type { Product } from '@/catalog/types';

const LEVEL_BADGE = {
  beginner: 'Voor beginners',
  gevorderd: 'Voor gevorderden',
  ervaren: 'Voor ervaren spelers',
} as const;

/**
 * Factual badges on a stick card (UX phase 2, 2026-11-08): only what the
 * catalog states with a source. No popularity ("meest gekozen"), no "beste
 * prijs/kwaliteit": we have no data for those, and inventing them would be
 * fake social proof. An estimated level gets no badge.
 */
export function productFacts(product: Product): string[] {
  const facts: string[] = [];
  if (product.experienceLevel.source !== 'editorial-estimate') facts.push(LEVEL_BADGE[product.experienceLevel.value]);
  if (isJuniorStick(product)) facts.push('Juniormaat');
  const carbon = product.carbonPercentage;
  if (carbon && carbon.source !== 'editorial-estimate') facts.push(carbon.value === 0 ? 'Zonder carbon' : `${carbon.value}% carbon`);
  return facts;
}

export function ProductFacts({ product }: { product: Product }) {
  const facts = productFacts(product);
  if (facts.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Kenmerken">
      {facts.map((fact) => (
        <li key={fact} className="rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-veld">
          {fact}
        </li>
      ))}
    </ul>
  );
}
