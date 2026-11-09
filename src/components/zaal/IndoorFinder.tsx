'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Product } from '@/catalog/types';
import type { ProductCard as ProductCardType } from '@/components/catalog/ProductCard';
import {
  INDOOR_BUDGETS,
  MAX_HEIGHT_CM,
  MIN_HEIGHT_CM,
  countByBudget,
  filterIndoor,
  hasAnyFilter,
  lengthsFor,
  shorterSizeMatches,
  sizeAdviceFor,
  sizesFromAdvice,
  type IndoorBudgetId,
  type IndoorFilters,
  type IndoorItem,
  type IndoorMatch,
  type IndoorPlayer,
} from '@/catalog/indoorFinder';
import { ZAAL } from '@/content/zaal';
import { inch } from '@/content/offers';
import { sizeAdviceText } from '@/content/stickwijzer/resultCopy';
import { LENGTH_TABLE_PATH } from '@/lib/site';
import { trackEvent } from '@/lib/analytics/track';
import { Button } from '@/components/ui/Button';
import { AlertIcon } from '@/components/ui/icons';

const TEXT = ZAAL.finder;

const CHIP =
  'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-rand bg-white px-4 text-sm font-semibold text-inkt transition-colors hover:border-veld has-[:checked]:border-veld has-[:checked]:bg-veld has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-veld';

/** Cards per step in the list from the shop feeds. */
const PAGE = 12;

const PLAYERS: Array<{ value: IndoorPlayer; label: string }> = [
  { value: 'kind', label: 'Kind' },
  { value: 'volwassene', label: 'Volwassene' },
];

type SizeChoice = { kind: 'maat'; inch: number } | { kind: 'lengte' } | null;
type BudgetChoice = IndoorBudgetId | 'geen' | null;

type Imported =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | {
      kind: 'done';
      Card: typeof ProductCardType;
      bySlug: ReadonlyMap<string, Product>;
      /** The light list of the shop-feed sticks (/data/zaal-index.json). */
      items: readonly IndoorItem[];
    };

/** The answers as ?voor=…&maat=…&budget=…, so a visitor who goes back finds them again. No height. */
function readUrl(): { player: IndoorPlayer | null; size: number | null; budget: BudgetChoice } {
  const params = new URLSearchParams(window.location.search);
  const player = params.get('voor');
  const size = Number(params.get('maat')?.replace(',', '.'));
  const budget = params.get('budget');
  return {
    player: player === 'kind' || player === 'volwassene' ? player : null,
    size: Number.isFinite(size) && size > 0 ? size : null,
    budget: budget === 'geen' || INDOOR_BUDGETS.some((b) => b.id === budget) ? (budget as BudgetChoice) : null,
  };
}

function writeUrl(player: IndoorPlayer | null, sizes: readonly number[] | null, budget: BudgetChoice) {
  const url = new URL(window.location.href);
  const set = (key: string, value: string | null) => (value === null ? url.searchParams.delete(key) : url.searchParams.set(key, value));
  set('voor', player);
  set('maat', sizes?.[0] !== undefined ? String(sizes[0]) : null);
  set('budget', budget);
  window.history.replaceState(window.history.state, '', url);
}

function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-base font-bold text-inkt">{legend}</legend>
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

/**
 * The zaalstick finder (2026-11-09): three questions that filter the one list
 * of indoor sticks on the page, live. Without an answer it shows the
 * hand-checked sticks, server-rendered, exactly like the page did before;
 * the sticks from the shop feeds (their light list and their cards) load
 * after the first answer or a click, so neither is in the first page load
 * (decision log 2026-10-24). Counts wait for the full list.
 */
export function IndoorFinder({
  items: checkedItems,
  checkedCards,
  importedCount,
}: {
  /** The hand-checked sticks only. */
  items: readonly IndoorItem[];
  /** The hand-checked sticks as server-rendered cards, by slug. */
  checkedCards: Readonly<Record<string, ReactNode>>;
  /** How many shop-feed sticks there are; their data loads on demand. */
  importedCount: number;
}) {
  const [player, setPlayer] = useState<IndoorPlayer | null>(null);
  const [size, setSize] = useState<SizeChoice>(null);
  const [height, setHeight] = useState('');
  const [budget, setBudget] = useState<BudgetChoice>(null);
  const [imported, setImported] = useState<Imported>({ kind: 'idle' });
  const [importedShown, setImportedShown] = useState(PAGE);
  const started = useRef(false);
  const lastSent = useRef('');
  const items = useMemo(
    () => (imported.kind === 'done' ? [...checkedItems, ...imported.items] : checkedItems),
    [checkedItems, imported],
  );
  // Every stick is known: counts and the selection event may use the totals.
  const complete = importedCount === 0 || imported.kind === 'done';

  const heightCm = height === '' ? NaN : Number(height);
  const advice = size?.kind === 'lengte' ? sizeAdviceFor(heightCm) : null;
  // A string key keeps the derived sizes stable between renders.
  const sizesKey = size?.kind === 'maat' ? String(size.inch) : advice ? sizesFromAdvice(advice).join('+') : '';
  const sizes = useMemo<readonly number[] | null>(() => (sizesKey ? sizesKey.split('+').map(Number) : null), [sizesKey]);

  const filters: IndoorFilters = useMemo(
    () => ({ player, sizes, budget: budget === 'geen' ? null : budget }),
    [player, sizes, budget],
  );
  const filtered = hasAnyFilter(filters) || budget === 'geen';
  const matches = useMemo(() => filterIndoor(items, filters), [items, filters]);
  const budgetCounts = useMemo(() => countByBudget(items, filters), [items, filters]);
  const withoutBudget = useMemo(
    () => (filters.budget === null ? matches.length : filterIndoor(items, { ...filters, budget: null }).length),
    [items, filters, matches.length],
  );
  const inSizeAnyBudget = filters.sizes !== null ? filterIndoor(items, { ...filters, budget: null }).length : 1;
  const shorter = useMemo(
    () => (advice && inSizeAnyBudget === 0 ? shorterSizeMatches(items, filters) : []),
    [advice, inSizeAnyBudget, items, filters],
  );

  const sizeButtons = player ? lengthsFor(items, player) : [];
  const checkedMatches = matches.filter((m) => m.item.checked);
  const importedMatches = matches.filter((m) => !m.item.checked);
  const importedTotal = importedCount;

  // Answers from the URL (back from a stick page); the first render stays the server's.
  useEffect(() => {
    const fromUrl = readUrl();
    /* eslint-disable react-hooks/set-state-in-effect -- the URL is only known in the browser. */
    if (fromUrl.player) setPlayer(fromUrl.player);
    if (fromUrl.size !== null) setSize({ kind: 'maat', inch: fromUrl.size });
    if (fromUrl.budget) setBudget(fromUrl.budget);
    /* eslint-enable react-hooks/set-state-in-effect */
    if (fromUrl.player || fromUrl.size !== null || fromUrl.budget) started.current = true;
  }, []);

  useEffect(() => {
    if (!started.current) return;
    writeUrl(player, sizes, budget);
  }, [player, sizes, budget]);

  // The funnel step "selection complete": who, which length and a budget (also "Geen voorkeur").
  useEffect(() => {
    if (!player || !sizes || budget === null || !complete) return;
    const key = `${player}|${sizes.join('+')}|${budget}`;
    if (key === lastSent.current) return;
    const timer = window.setTimeout(() => {
      lastSent.current = key;
      trackEvent({
        name: 'indoor_selection',
        player,
        budget,
        sizes: sizes.join('+'),
        resultCount: matches.length,
        sizeSource: size?.kind === 'lengte' ? 'lengte' : 'maat',
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [player, sizes, budget, matches.length, size?.kind, complete]);

  async function loadImported() {
    if (imported.kind === 'loading' || imported.kind === 'done') return;
    setImported({ kind: 'loading' });
    try {
      const [card, response, index] = await Promise.all([
        import('@/components/catalog/ProductCard'),
        fetch('/data/aanbod-zaal.json'),
        fetch('/data/zaal-index.json'),
      ]);
      if (!response.ok || !index.ok) throw new Error(`HTTP ${response.status}/${index.status}`);
      const [products, list] = (await Promise.all([response.json(), index.json()])) as [Product[], IndoorItem[]];
      setImported({
        kind: 'done',
        Card: card.ProductCard,
        bySlug: new Map(products.map((p) => [p.slug, p])),
        items: list,
      });
    } catch {
      setImported({ kind: 'error' });
    }
  }

  function answered(first: 'speler' | 'maat' | 'lengte' | 'budget') {
    if (!started.current) {
      started.current = true;
      trackEvent({ name: 'indoor_finder_start', first });
    }
    setImportedShown(PAGE);
  }

  // With any answer (clicked or from the URL) the shop-feed sticks belong to the list: load them.
  useEffect(() => {
    // loadImported only reads `imported`, which is a dependency already; it fetches data, a side effect by nature.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (filtered && imported.kind === 'idle') void loadImported();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, imported.kind]);

  function clear() {
    setPlayer(null);
    setSize(null);
    setHeight('');
    setBudget(null);
    setImportedShown(PAGE);
    writeUrl(null, null, null);
  }

  // Card clicks to a stick page, with their place in the list as shown (one listener for all cards).
  const listRef = useRef<HTMLDivElement>(null);
  const filteredRef = useRef(filtered);
  useEffect(() => {
    filteredRef.current = filtered;
  }, [filtered]);
  useEffect(() => {
    const element = listRef.current;
    if (!element) return;
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      const li = target.closest<HTMLElement>('li[data-slug]');
      // Only the card's own link to the stick page; shop links have their own event.
      if (!link || !li || link.target === '_blank' || !element) return;
      const list = Array.from(element.querySelectorAll<HTMLElement>('li[data-slug]'));
      trackEvent({
        name: 'product_card_click',
        page: 'zaalsticks',
        position: list.indexOf(li) + 1,
        checked: li.dataset.checked === 'true',
        filtered: filteredRef.current,
      });
    }
    element.addEventListener('click', onClick);
    return () => element.removeEventListener('click', onClick);
  }, []);

  function cardFor(match: IndoorMatch): ReactNode {
    if (match.item.checked) return checkedCards[match.item.slug] ?? null;
    if (imported.kind !== 'done') return null;
    const product = imported.bySlug.get(match.item.slug);
    const { Card } = imported;
    return product ? <Card product={product} placement="zaalkeuze" showLengths compact /> : null;
  }

  function grid(list: readonly IndoorMatch[]) {
    return (
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((match) => {
          const card = cardFor(match);
          return card ? (
            <li key={match.item.slug} className="h-full" data-slug={match.item.slug} data-checked={match.item.checked}>
              {card}
            </li>
          ) : null;
        })}
      </ul>
    );
  }

  const summary = [
    player ? PLAYERS.find((p) => p.value === player)?.label : null,
    sizes ? sizes.map(inch).join(' of ') : null,
    budget && budget !== 'geen' ? INDOOR_BUDGETS.find((b) => b.id === budget)?.label : null,
  ].filter((part): part is string => Boolean(part));

  return (
    <div>
      <form noValidate onSubmit={(event) => event.preventDefault()} className="card space-y-6 p-4 sm:p-6">
        <Fieldset legend={TEXT.playerLabel}>
          <div className="flex flex-wrap gap-2">
            {PLAYERS.map((option) => (
              <label key={option.value} className={CHIP}>
                <input
                  type="radio"
                  name="zaal-voor"
                  className="sr-only"
                  checked={player === option.value}
                  onChange={() => {
                    setPlayer(option.value);
                    // A chosen length of the other group no longer fits.
                    if (size?.kind === 'maat' && lengthsFor(items, option.value).every((l) => l !== size.inch)) setSize(null);
                    answered('speler');
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </Fieldset>

        {player && (
          <Fieldset legend={TEXT.sizeLabel}>
            <div className="flex flex-wrap gap-2">
              {sizeButtons.map((length) => (
                <label key={length} className={CHIP}>
                  <input
                    type="radio"
                    name="zaal-maat"
                    className="sr-only"
                    checked={size?.kind === 'maat' && size.inch === length}
                    onChange={() => {
                      setSize({ kind: 'maat', inch: length });
                      answered('maat');
                    }}
                  />
                  {inch(length)}
                </label>
              ))}
              <label className={CHIP}>
                <input
                  type="radio"
                  name="zaal-maat"
                  className="sr-only"
                  checked={size?.kind === 'lengte'}
                  onChange={() => {
                    setSize({ kind: 'lengte' });
                    answered('lengte');
                  }}
                />
                {TEXT.sizeUnknown}
              </label>
            </div>
            {size?.kind === 'lengte' && (
              <div className="mt-4 rounded-xl bg-krijt p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="zaal-lengte" className="text-sm font-semibold">
                    {TEXT.heightLabel}
                  </label>
                  <input
                    id="zaal-lengte"
                    type="number"
                    inputMode="numeric"
                    min={MIN_HEIGHT_CM}
                    max={MAX_HEIGHT_CM}
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    aria-describedby="zaal-lengte-hulp"
                    aria-invalid={height !== '' && !advice ? true : undefined}
                    className="min-h-11 w-24 rounded-lg border border-lijngrijs bg-white px-3"
                  />
                  <span className="text-sm text-inkt/80">{TEXT.heightUnit}</span>
                </div>
                <div id="zaal-lengte-hulp" className="mt-2 text-sm text-inkt/80" aria-live="polite">
                  {height !== '' && !advice ? (
                    <p className="text-red-700">{`Vul een hele lengte in tussen ${MIN_HEIGHT_CM} en ${MAX_HEIGHT_CM} cm.`}</p>
                  ) : advice ? (
                    <>
                      <p className="font-semibold text-inkt">
                        Lengteadvies: {inch(advice.primaryInch)}
                        {advice.alternativeInch !== undefined && ` (of ${inch(advice.alternativeInch)})`}
                      </p>
                      {sizeAdviceText(advice).map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </>
                  ) : (
                    <p>
                      {TEXT.heightHelp}{' '}
                      <Link href={LENGTH_TABLE_PATH} className="text-veld underline">
                        Bekijk de lengtetabel
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            )}
          </Fieldset>
        )}

        <Fieldset legend={TEXT.budgetLabel}>
          <div className="flex flex-wrap gap-2">
            {INDOOR_BUDGETS.map((range) => (
              <label key={range.id} className={CHIP}>
                <input
                  type="radio"
                  name="zaal-budget"
                  className="sr-only"
                  checked={budget === range.id}
                  onChange={() => {
                    setBudget(range.id);
                    answered('budget');
                  }}
                />
                {range.label}
                {complete && <span className="font-normal opacity-75">({budgetCounts[range.id]})</span>}
              </label>
            ))}
            <label className={CHIP}>
              <input
                type="radio"
                name="zaal-budget"
                className="sr-only"
                checked={budget === 'geen'}
                onChange={() => {
                  setBudget('geen');
                  answered('budget');
                }}
              />
              {TEXT.budgetNone}
            </label>
          </div>
          <p className="mt-2 text-xs text-lijngrijs">{TEXT.budgetNote}</p>
        </Fieldset>
      </form>

      <div className="mt-10" ref={listRef}>
        <h2 id="alle-zaalsticks" className="scroll-mt-24 text-2xl font-bold">
          {filtered ? TEXT.resultsHeadingFiltered : TEXT.resultsHeading}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1" aria-live="polite">
          <p className="font-semibold text-inkt">
            {filtered
              ? complete
                ? `${matches.length} ${matches.length === 1 ? 'zaalstick past' : 'zaalsticks passen'}${summary.length ? `: ${summary.join(' · ')}` : ''}`
                : TEXT.counting
              : `${checkedItems.length + importedTotal} zaalsticks: ${checkedItems.length} met de hand nagekeken, ${importedTotal} uit de winkelfeeds`}
          </p>
          {filtered && (
            <button type="button" onClick={clear} className="min-h-11 text-sm font-semibold text-veld underline hover:no-underline">
              {TEXT.clear}
            </button>
          )}
        </div>
        <p className="mt-1 max-w-3xl text-sm text-inkt/80">{TEXT.sortNote}</p>

        {filtered && complete && matches.length === 0 && (
          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            {filters.budget !== null && withoutBudget > 0 ? (
              <p>
                {TEXT.noneInBudget(withoutBudget)}{' '}
                <button type="button" onClick={() => setBudget('geen')} className="font-semibold underline">
                  {TEXT.showAllBudgets}
                </button>
              </p>
            ) : (
              <p>
                {TEXT.noneInSize}{' '}
                <Link href="/interesse?source=algemeen" className="font-semibold underline">
                  {TEXT.personalAdvice}
                </Link>
              </p>
            )}
          </div>
        )}

        <div>
          {checkedMatches.length > 0 && <div className="mt-6">{grid(checkedMatches)}</div>}

          {filtered && importedMatches.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-bold">
                {TEXT.importedHeading} ({importedMatches.length})
              </h3>
              <p className="mt-1 max-w-3xl text-sm text-inkt/80">{TEXT.importedNote}</p>
              {imported.kind === 'done' ? (
                <>
                  <div className="mt-4">{grid(importedMatches.slice(0, importedShown))}</div>
                  {importedMatches.length > importedShown && (
                    <div className="mt-6 flex justify-center">
                      <Button variant="secondary" onClick={() => setImportedShown((n) => n + PAGE)}>
                        {TEXT.more} ({importedMatches.length - importedShown})
                      </Button>
                    </div>
                  )}
                </>
              ) : imported.kind === 'error' ? (
                <p className="mt-3 text-sm text-red-700">
                  {TEXT.loadError}{' '}
                  <button type="button" onClick={() => void loadImported()} className="font-semibold underline">
                    Opnieuw
                  </button>
                </p>
              ) : (
                <p className="mt-3 text-sm text-inkt/80">{TEXT.loading}</p>
              )}
            </div>
          )}

          {shorter.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-bold">{TEXT.shorterHeading}</h3>
              <p className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                <AlertIcon size={16} className="mt-0.5 shrink-0" />
                {TEXT.shorterNote}
              </p>
              {imported.kind !== 'done' && shorter.some((m) => !m.item.checked) && (
                <p className="mt-3 text-sm text-inkt/80">{TEXT.loading}</p>
              )}
              <div className="mt-4">{grid(shorter)}</div>
            </div>
          )}
        </div>

        {!filtered && importedTotal > 0 && (
          <div className="mt-8">
            {imported.kind === 'done' ? (
              <div>
                <h3 className="text-lg font-bold">
                  {TEXT.importedHeading} ({importedTotal})
                </h3>
                <p className="mt-1 max-w-3xl text-sm text-inkt/80">{TEXT.importedNote}</p>
                <div className="mt-4">
                  {grid(matches.filter((m) => !m.item.checked).slice(0, importedShown))}
                </div>
                {importedTotal > importedShown && (
                  <div className="mt-6 flex justify-center">
                    <Button variant="secondary" onClick={() => setImportedShown((n) => n + PAGE)}>
                      {TEXT.more} ({importedTotal - importedShown})
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    trackEvent({ name: 'catalog_block_click', page: 'zaalsticks', block: 'aanbod', target: 'aanbod-laden' });
                    void loadImported();
                  }}
                  disabled={imported.kind === 'loading'}
                >
                  {imported.kind === 'loading'
                    ? 'Bezig met laden…'
                    : `Toon ook ${importedTotal} sticks uit het aanbod van PassaHockey, Plutosport, HockeyCity en Daka`}
                </Button>
                {imported.kind === 'error' && <p className="mt-2 text-sm text-red-700">{TEXT.loadError}</p>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
