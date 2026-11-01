'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AGE_LABEL, CATEGORY_LABEL } from '@/content/hockeyschoenen';
import { trackEvent } from '@/lib/analytics/track';

export type ShoeListItem = {
  slug: string;
  brand: string;
  model: string;
  category: 'veld' | 'zaal' | 'onbekend';
  ageGroup: 'junior' | 'senior';
};

type State = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error' } | { kind: 'done'; items: ShoeListItem[] };

/**
 * The button under the checked shoes that loads the models from the shop
 * feeds, like ImportedSticks (decision log 2026-11-01): not in the first page
 * load, and filtered like the page. An unknown kind never matches a type filter.
 */
export function ImportedShoes({
  count,
  type,
  age,
}: {
  count: number;
  type?: 'veld' | 'zaal';
  age?: 'junior' | 'senior';
}) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function load() {
    trackEvent({ name: 'catalog_block_click', page: 'hockeyschoenen', block: 'aanbod', target: 'aanbod-laden' });
    setState({ kind: 'loading' });
    try {
      const response = await fetch('/data/aanbod-schoenen.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const items = ((await response.json()) as ShoeListItem[]).filter(
        (item) => (!type || item.category === type) && (!age || item.ageGroup === age),
      );
      setState({ kind: 'done', items });
    } catch {
      setState({ kind: 'error' });
    }
  }

  if (count === 0) return null;

  if (state.kind === 'done') {
    return (
      <ul className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {state.items.map((item) => (
          <li key={item.slug}>
            <Link href={`/hockeyschoenen/${item.slug}`} className="inline-flex min-h-11 items-center hover:underline">
              {item.brand} {item.model}
            </Link>
            <span className="text-lijngrijs">
              {' '}
              · {CATEGORY_LABEL[item.category]} · {AGE_LABEL[item.ageGroup]}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-4" aria-live="polite">
      <Button variant="secondary" onClick={() => void load()} disabled={state.kind === 'loading'}>
        {state.kind === 'loading' ? 'Bezig met laden…' : `Toon ook ${count} modellen uit het aanbod van de winkels`}
      </Button>
      {state.kind === 'error' && <p className="mt-2 text-sm text-red-700">Laden lukte niet. Probeer het nog een keer.</p>}
    </div>
  );
}
