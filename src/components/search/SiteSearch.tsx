'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { freshnessNow } from '@/catalog/offers/sort';
import { markSearchSelection, markStickwijzerFromSearch } from '@/lib/analytics/searchContext';
import { trackEvent } from '@/lib/analytics/track';
import { SEARCH_CONFIG } from '@/search/config';
import { prepareIndex, search, type PreparedIndex, type Scored, type SearchIndex, type SearchLimits } from '@/search/engine';
import { priceLine, stickFacts, stickModel } from '@/search/display';
import { MAX_QUERY_LENGTH } from '@/search/tokens';

/**
 * The live search in the header (owner brief 2026-11-24, docs/spec/zoeken.md).
 * A button with Ctrl or Cmd + K opens a native <dialog>: it traps focus, closes
 * on Esc and is full screen on a phone. The index is a static file, loaded on
 * the first use and kept for the rest of the session. Without JavaScript the
 * button does nothing, but /zoeken keeps working as a plain form.
 */

const INDEX_URL = '/data/zoekindex.json';
const TYPING_PAUSE_MS = 800;
const LIMITS_WIDE: SearchLimits = { sticks: 4, brands: 2, articles: 3 };
const LIMITS_NARROW: SearchLimits = { sticks: 3, brands: 1, articles: 2 };

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

/** One index for every instance and every open of the dialog in this session. */
let indexPromise: Promise<PreparedIndex> | null = null;
function loadIndex(): Promise<PreparedIndex> {
  indexPromise ??= fetch(INDEX_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`index ${response.status}`);
      return response.json() as Promise<SearchIndex>;
    })
    .then(prepareIndex)
    .catch((error: unknown) => {
      // Let the next open try again.
      indexPromise = null;
      throw error;
    });
  return indexPromise;
}

type Option =
  | { kind: 'result'; id: string; href: string; resultType: 'stick' | 'merk' | 'kennisbank'; itemName: string; entry: Scored }
  | { kind: 'popular'; id: string; label: string; query: string }
  | { kind: 'answer'; id: string; href: string; text: string; title: string }
  | { kind: 'all'; id: string; href: string };

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function SiteSearch() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<LoadState>('idle');
  const [index, setIndex] = useState<PreparedIndex | null>(null);
  const [active, setActive] = useState(-1);
  const [wide, setWide] = useState(true);
  // The moment the dialog was opened: prices older than 14 days then lose their amount (freshnessNow).
  const [openedAt, setOpenedAt] = useState(0);
  const lastReported = useRef('');

  const ensureIndex = useCallback(() => {
    if (index || state === 'loading') return;
    setState('loading');
    loadIndex().then(
      (loaded) => {
        setIndex(loaded);
        setState('ready');
      },
      () => setState('error'),
    );
  }, [index, state]);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const openDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setOpenedAt(Date.now());
    ensureIndex();
    // showModal focuses the first control; be explicit for browsers that do not.
    inputRef.current?.focus();
  }, [ensureIndex]);

  // Ctrl or Cmd + K, from anywhere on the site.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openDialog();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openDialog]);

  // The number of results per group depends on the screen (phone: fewer).
  useEffect(() => {
    const media = window.matchMedia('(min-width: 640px)');
    const update = () => setWide(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // A navigation (a click on a result) closes the dialog and empties the field.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const outcome = useMemo(
    () => (index && query.trim().length >= 2 ? search(index, query, SEARCH_CONFIG, wide ? LIMITS_WIDE : LIMITS_NARROW) : null),
    [index, query, wide],
  );

  const options = useMemo<Option[]>(() => {
    if (!outcome) {
      if (query.trim().length > 0) return [];
      return SEARCH_CONFIG.popular.map((entry, i) => ({ kind: 'popular', id: `${listId}-p${i}`, label: entry.label, query: entry.query }));
    }
    const list: Option[] = [];
    if (outcome.answer) {
      list.push({ kind: 'answer', id: `${listId}-a`, href: outcome.answer.path, text: outcome.answer.text, title: outcome.answer.title });
    }
    const add = (entries: Scored[], resultType: 'stick' | 'merk' | 'kennisbank') =>
      entries.forEach((entry) => list.push({ kind: 'result', id: `${listId}-s${list.length}`, href: entry.item.path, resultType, itemName: entry.item.title, entry }));
    // A knowledge question lists the articles first and one stick fewer, so an article stays in view.
    if (outcome.knowledgeFirst) {
      add(outcome.articles, 'kennisbank');
      add(outcome.sticks.slice(0, wide ? 3 : 2), 'stick');
      add(outcome.brands, 'merk');
    } else {
      add(outcome.sticks, 'stick');
      add(outcome.brands, 'merk');
      add(outcome.articles, 'kennisbank');
    }
    if (outcome.total > 0) {
      list.push({ kind: 'all', id: `${listId}-all`, href: `/zoeken?q=${encodeURIComponent(outcome.query)}` });
    }
    return list;
  }, [outcome, query, listId, wide]);

  // Counts only, never the text (owner decision 2026-11-24). One report per pause and query.
  useEffect(() => {
    if (!outcome) return;
    const timer = window.setTimeout(() => {
      if (lastReported.current === outcome.query) return;
      lastReported.current = outcome.query;
      trackEvent({ name: 'search', queryLength: outcome.query.length, resultsCount: outcome.total });
      if (outcome.total === 0) trackEvent({ name: 'search_no_results', queryLength: outcome.query.length });
    }, TYPING_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [outcome]);

  /** Counts the choice and closes the dialog; a link navigates by itself. */
  const choose = useCallback(
    (option: Option) => {
      if (option.kind === 'result') {
        trackEvent({ name: 'select_search_result', resultType: option.resultType, itemName: option.itemName });
        if (option.resultType === 'stick') markSearchSelection(option.href);
      }
      if (option.kind === 'answer') {
        trackEvent({ name: 'select_search_result', resultType: 'kennisbank', itemName: option.title });
      }
      close();
    },
    [close],
  );

  /** Enter on a row: a suggestion runs its search, anything else is opened. */
  const select = useCallback(
    (option: Option) => {
      if (option.kind === 'popular') {
        trackEvent({ name: 'select_search_result', resultType: 'popular_suggestion', itemName: option.label });
        setQuery(option.query);
        setActive(-1);
        inputRef.current?.focus();
        return;
      }
      choose(option);
      router.push(option.href);
    },
    [choose, router],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (options.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => (current + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => (current <= 0 ? options.length - 1 : current - 1));
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const chosen = options[active];
    if (chosen) return select(chosen);
    const text = query.trim();
    if (text.length === 0) return;
    // Without a choice: a clear model match opens directly; otherwise all results.
    const top = outcome?.sticks[0];
    if (top?.exact) {
      const first = options.find((option) => option.kind === 'result' && option.entry === top);
      if (first) return select(first);
    }
    close();
    router.push(`/zoeken?q=${encodeURIComponent(text)}`);
  };

  const activeId = options[active]?.id;
  const now = index ? freshnessNow(index.generatedAt, openedAt) : new Date(0);
  const hasResults = Boolean(outcome && outcome.total > 0);
  const showEmpty = Boolean(outcome && outcome.total === 0);

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        onMouseEnter={ensureIndex}
        onFocus={ensureIndex}
        aria-label="Zoeken (Ctrl of Cmd + K)"
        aria-haspopup="dialog"
        title="Zoeken (Ctrl + K)"
        className="order-1 inline-flex h-11 w-10 shrink-0 items-center justify-center rounded-full border border-rand text-inkt hover:bg-krijt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-veld sm:w-11 lg:order-9 lg:w-10"
      >
        <SearchIcon />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Zoeken op de site"
        onClose={() => {
          setQuery('');
          setActive(-1);
          lastReported.current = '';
        }}
        onClick={(event) => {
          // A click on the dim background (the dialog element itself, outside the panel) closes it.
          if (event.target === dialogRef.current) close();
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-white p-0 text-inkt backdrop:bg-black/40 sm:inset-x-0 sm:bottom-auto sm:top-[8vh] sm:mx-auto sm:h-auto sm:max-h-[80vh] sm:max-w-2xl sm:rounded-2xl sm:shadow-xl"
      >
        {(
          <div className="flex h-dvh flex-col sm:h-auto sm:max-h-[80vh]">
            <form role="search" onSubmit={onSubmit} className="flex items-center gap-2 border-b border-rand px-3 py-3 sm:px-4">
              <label htmlFor={`${listId}-q`} className="sr-only">
                Zoek op merk, model of onderwerp
              </label>
              <span className="text-lijngrijs" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                id={`${listId}-q`}
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={options.length > 0}
                aria-controls={`${listId}-lijst`}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="search"
                maxLength={MAX_QUERY_LENGTH}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(-1);
                }}
                onKeyDown={onKeyDown}
                placeholder="Zoek op merk, model of onderwerp..."
                className="min-h-11 min-w-0 flex-1 bg-transparent text-base text-inkt placeholder:text-lijngrijs focus:outline-none"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Zoeken sluiten"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-inkt hover:bg-krijt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-veld"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </form>

            {/* Own scroll area, so results do not disappear behind a phone keyboard. */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
              <p className="sr-only" role="status" aria-live="polite">
                {state === 'loading'
                  ? 'Zoekindex laden'
                  : outcome
                    ? outcome.total === 0
                      ? 'Geen resultaten'
                      : `${outcome.total} ${outcome.total === 1 ? 'resultaat' : 'resultaten'}`
                    : ''}
              </p>

              {state === 'loading' && <p className="px-1 py-2 text-sm text-lijngrijs">Zoekindex laden...</p>}

              {state === 'error' && (
                <div className="space-y-3 px-1 py-2">
                  <p>Zoeken is momenteel niet beschikbaar. Gebruik de Stickwijzer om een passende hockeystick te vinden.</p>
                  <WijzerButton itemName="Stickwijzer (zoeken niet beschikbaar)" onNavigate={close} />
                </div>
              )}

              {state !== 'error' && options.length > 0 && (
                <ul id={`${listId}-lijst`} role="listbox" aria-label="Zoekresultaten" className="space-y-1">
                  {!outcome && query.trim().length === 0 && (
                    <li role="presentation" className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-lijngrijs">
                      Populair
                    </li>
                  )}
                  {options.map((option, i) => {
                    const isActive = i === active;
                    const rowClass = `block rounded-xl px-3 py-2.5 ${isActive ? 'bg-mist outline outline-2 outline-veld' : 'hover:bg-krijt'}`;
                    if (option.kind === 'popular') {
                      return (
                        <li key={option.id} id={option.id} role="option" aria-selected={isActive} onMouseMove={() => setActive(i)}>
                          <button type="button" tabIndex={-1} onClick={() => select(option)} className={`${rowClass} w-full text-left`}>
                            {option.label}
                          </button>
                        </li>
                      );
                    }
                    if (option.kind === 'answer') {
                      return (
                        <li key={option.id} id={option.id} role="option" aria-selected={isActive} onMouseMove={() => setActive(i)}>
                          <div className={`rounded-xl border border-rand bg-mist px-3 py-3 ${isActive ? 'outline outline-2 outline-veld' : ''}`}>
                            {/* Two lines on a phone (owner brief); the whole text on a larger screen. */}
                            <p className="line-clamp-2 text-sm text-inkt sm:line-clamp-none">{option.text}</p>
                            <Link href={option.href} tabIndex={-1} onClick={() => choose(option)} className="mt-1.5 inline-block text-sm font-semibold text-veld hover:underline">
                              Lees volledig artikel
                            </Link>
                          </div>
                        </li>
                      );
                    }
                    if (option.kind === 'all') {
                      return (
                        <li key={option.id} id={option.id} role="option" aria-selected={isActive} onMouseMove={() => setActive(i)}>
                          <Link href={option.href} tabIndex={-1} onClick={() => choose(option)} className={`${rowClass} text-sm font-semibold text-veld`}>
                            Alle resultaten bekijken (inclusief schoenen)
                          </Link>
                        </li>
                      );
                    }
                    const { item } = option.entry;
                    const previous = options[i - 1];
                    const startsGroup = !previous || previous.kind !== 'result' || previous.resultType !== option.resultType;
                    const groupLabel = option.resultType === 'stick' ? 'Sticks' : option.resultType === 'merk' ? 'Merken' : 'Kennisbank en advies';
                    return (
                      <li key={option.id} role="presentation">
                        {startsGroup && <p className="px-1 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-lijngrijs">{groupLabel}</p>}
                        <div id={option.id} role="option" aria-selected={isActive} onMouseMove={() => setActive(i)}>
                          <Link href={option.href} tabIndex={-1} onClick={() => choose(option)} className={`${rowClass} flex items-center gap-3`}>
                            {option.resultType === 'stick' &&
                              (item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-lg bg-krijt object-contain" />
                              ) : (
                                <span className="h-12 w-12 shrink-0 rounded-lg bg-krijt" aria-hidden="true" />
                              ))}
                            <span className="min-w-0 flex-1">
                              {option.resultType === 'stick' && (
                                <>
                                  <span className="block text-xs text-lijngrijs">{item.brand}</span>
                                  <span className="block font-semibold">{stickModel(item)}</span>
                                  <span className="block text-sm text-lijngrijs">{stickFacts(item)}</span>
                                  <StickPrice item={item} now={now} />
                                </>
                              )}
                              {option.resultType === 'merk' && (
                                <>
                                  <span className="block font-semibold">
                                    {item.hasPage ? `Alle ${item.title} hockeysticks vergelijken` : `Meer over ${item.title}`}
                                  </span>
                                  <span className="block text-sm text-lijngrijs">
                                    {item.stickCount} {item.stickCount === 1 ? 'stick' : 'sticks'} in onze catalogus
                                  </span>
                                </>
                              )}
                              {option.resultType === 'kennisbank' && (
                                <>
                                  <span className="block text-xs text-lijngrijs">{item.category}</span>
                                  <span className="block font-semibold">{item.title}</span>
                                  <span className="hidden text-sm text-lijngrijs sm:line-clamp-2">{item.summary}</span>
                                </>
                              )}
                            </span>
                            {option.resultType === 'stick' && <span className="shrink-0 text-sm font-semibold text-veld">Bekijk stick</span>}
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Never an empty search: no match leads to the stickwijzer. */}
              {showEmpty && state === 'ready' && !hasResults && (
                <div className="space-y-3 px-1 py-2">
                  <p>Geen exacte match gevonden. Laat onze Stickwijzer binnen 1 minuut de juiste stick voor je kiezen.</p>
                  <WijzerButton itemName="Stickwijzer (geen resultaat)" onNavigate={close} />
                </div>
              )}

              {/* A general word (kind, junior, beginner, advice, size): a quiet pointer under the results. */}
              {outcome?.wijzerHint && hasResults && (
                <p className="px-1 pt-3 text-sm text-lijngrijs">
                  Weet je nog niet welke stick bij je past?{' '}
                  <WijzerLink itemName="Stickwijzer (algemene zoekterm)" onNavigate={close} className="font-semibold text-veld hover:underline">
                    Laat de Stickwijzer kiezen
                  </WijzerLink>
                  .
                </p>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

/** A link to the stickwijzer from the search: counted, and remembered so the quiz events say `source: search`. */
function WijzerLink({ itemName, onNavigate, className, children }: { itemName: string; onNavigate: () => void; className: string; children: ReactNode }) {
  return (
    <Link
      href="/stickwijzer"
      className={className}
      onClick={() => {
        trackEvent({ name: 'select_search_result', resultType: 'stickwijzer', itemName });
        markStickwijzerFromSearch();
        onNavigate();
      }}
    >
      {children}
    </Link>
  );
}

function WijzerButton({ itemName, onNavigate }: { itemName: string; onNavigate: () => void }) {
  return (
    <WijzerLink
      itemName={itemName}
      onNavigate={onNavigate}
      className="inline-flex min-h-11 items-center rounded-full bg-bal px-5 py-2.5 font-semibold text-inkt hover:bg-bal-donker focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-veld"
    >
      Start de Stickwijzer
    </WijzerLink>
  );
}

function StickPrice({ item, now }: { item: Scored['item']; now: Date }) {
  const line = priceLine(item, now);
  if (!line) return null;
  return <span className={`block text-sm ${line.indicative ? 'text-lijngrijs' : 'font-medium text-inkt'}`}>{line.text}</span>;
}
