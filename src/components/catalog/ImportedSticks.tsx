'use client';

import { useState } from 'react';
import type { Product } from '@/catalog/types';
import { trackEvent } from '@/lib/analytics/track';
import { Button } from '@/components/ui/Button';
import type { ProductGrid } from './ProductGrid';

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'done'; Grid: typeof ProductGrid; products: Product[] };

/**
 * The button under the hand-checked sticks that loads the sticks imported
 * from the PassaHockey feed (decision log 2026-10-24). They are not in the
 * first page load: the JSON and the grid code are fetched only after the
 * click, and rendered with the same ProductGrid as the list above.
 */
export function ImportedSticks({
  page,
  file,
  count,
}: {
  page: 'sticks' | 'zaalsticks';
  file: 'aanbod-veld.json' | 'aanbod-zaal.json';
  count: number;
}) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function load() {
    trackEvent({
      name: 'catalog_block_click',
      page,
      block: 'aanbod',
      target: 'aanbod-laden',
    });
    setState({ kind: 'loading' });
    try {
      const [grid, response] = await Promise.all([
        import('./ProductGrid'),
        fetch(`/data/${file}`),
      ]);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const products = (await response.json()) as Product[];
      setState({ kind: 'done', Grid: grid.ProductGrid, products });
    } catch {
      setState({ kind: 'error' });
    }
  }

  if (count === 0) return null;

  if (state.kind === 'done') {
    const { Grid, products } = state;
    return (
      <div className="mt-6">
        <p className="text-sm text-lijngrijs">
          Uit het aanbod van PassaHockey ({products.length}). Deze gegevens
          komen uit de productfeed van de winkel en zijn nog niet met de hand
          gecontroleerd.
        </p>
        <div className="mt-4">
          <Grid products={products} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6" aria-live="polite">
      <Button
        variant="secondary"
        onClick={() => void load()}
        disabled={state.kind === 'loading'}
      >
        {state.kind === 'loading'
          ? 'Bezig met laden…'
          : `Toon ook ${count} sticks uit het aanbod van PassaHockey`}
      </Button>
      {state.kind === 'error' && (
        <p className="mt-2 text-sm text-red-700">
          Laden lukte niet. Probeer het nog een keer.
        </p>
      )}
    </div>
  );
}
