'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/catalog/types';
import {
  INDOOR_BUDGETS,
  selectIndoorSticks,
  type IndoorBudget,
  type IndoorPlayer,
  type IndoorSelection,
} from '@/catalog/indoorSelection';
import { formatInch, sizeAdviceText } from '@/content/stickwijzer/resultCopy';
import { ProductImage } from '@/components/catalog/ProductImage';
import { Button } from '@/components/ui/Button';
import { AlertIcon, CheckIcon } from '@/components/ui/icons';
import { RetailerLinks } from '@/components/ui/RetailerLinks';
import { PartnerLinkNote } from '@/components/ui/PartnerLinkNote';
import { trackEvent } from '@/lib/analytics/track';

const OPTION_CLASSES =
  'flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-lijngrijs bg-white px-4 py-2.5 text-sm font-semibold has-[:checked]:border-veld has-[:checked]:bg-krijt has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-veld';

const PLAYERS: Array<{ value: IndoorPlayer; label: string }> = [
  { value: 'adult', label: 'Volwassene' },
  { value: 'child', label: 'Kind' },
];

const MIN_HEIGHT = 95;
const MAX_HEIGHT = 210;

function sourceNote(product: Product): string {
  return product.priceIndicativeEur.source === 'brand-website'
    ? `Gegevens van de website van ${product.brand}`
    : 'Gegevens van een winkel-listing op bol.com';
}

function ResultCard({
  product,
  sizeInch,
  alternativeSize,
  shorterSize = false,
  hasBudget,
}: {
  product: Product;
  sizeInch: number;
  alternativeSize: boolean;
  /** One size shorter than advised: shown with a warning instead of a check. */
  shorterSize?: boolean;
  hasBudget: boolean;
}) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-rand bg-white p-5 sm:flex-row">
      <div className="bg-hex-light flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-krijt sm:w-28">
        <ProductImage product={product} className="h-24 w-24" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold tracking-wide text-veld uppercase">
          {product.brand}
        </p>
        <h4 className="mt-1 font-bold">
          <Link href={`/sticks/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h4>
        <ul className="mt-2 space-y-1 text-sm text-inkt/80">
          {shorterSize ? (
            <li className="flex items-start gap-2 text-amber-900">
              <AlertIcon size={16} className="mt-0.5 shrink-0" />
              {`Eén maat korter: ${formatInch(sizeInch)}`}
            </li>
          ) : (
            <li className="flex items-start gap-2">
              <CheckIcon size={16} className="mt-0.5 shrink-0 text-veld" />
              {alternativeSize
                ? `Beschikbaar in ${formatInch(sizeInch)}, de tweede maat uit het lengteadvies`
                : `Beschikbaar in ${formatInch(sizeInch)}`}
            </li>
          )}
          {hasBudget && (
            <li className="flex items-start gap-2">
              <CheckIcon size={16} className="mt-0.5 shrink-0 text-veld" />
              Valt binnen je budget
            </li>
          )}
          <li className="flex items-start gap-2 text-xs text-lijngrijs">
            {sourceNote(product)}
          </li>
        </ul>
      </div>
      <div className="sm:w-56">
        <p className="text-xl font-bold">
          €{product.priceIndicativeEur.value.toFixed(2)}
        </p>
        <p className="text-xs text-lijngrijs">Richtprijs</p>
        <RetailerLinks
          brand={product.brand}
          productName={product.name}
          bolProductUrl={product.bolProductUrl}
          placement="zaalkeuze"
          className="mt-3"
          stack
        />
      </div>
    </li>
  );
}

/**
 * Short three-question filter for indoor sticks: who plays, how tall (for a
 * child) and the budget. Gives a first selection, not an advice.
 */
export function IndoorSelector({ products }: { products: Product[] }) {
  const [player, setPlayer] = useState<IndoorPlayer | null>(null);
  const [height, setHeight] = useState('');
  const [budget, setBudget] = useState<IndoorBudget | null>(null);
  const [selection, setSelection] = useState<IndoorSelection | null>(null);
  const [submitted, setSubmitted] = useState<{ budget: IndoorBudget } | null>(
    null,
  );

  const heightCm = height === '' ? undefined : Number(height);
  const heightValid =
    heightCm !== undefined &&
    Number.isInteger(heightCm) &&
    heightCm >= MIN_HEIGHT &&
    heightCm <= MAX_HEIGHT;
  const complete =
    player !== null && budget !== null && (player === 'adult' || heightValid);

  function showSelection() {
    if (!complete || player === null || budget === null) {
      return;
    }
    const result = selectIndoorSticks(products, {
      player,
      heightCm: player === 'child' ? heightCm : undefined,
      budget,
    });
    setSelection(result);
    setSubmitted({ budget });
    trackEvent({
      name: 'indoor_selection',
      player,
      budget,
      sizes: result.sizes.join('+'),
      resultCount: result.matches.length,
    });
  }

  return (
    <div className="rounded-3xl border border-rand bg-white p-6 sm:p-8">
      <form
        noValidate
        className="grid gap-6 lg:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          showSelection();
        }}
      >
        <fieldset>
          <legend className="font-bold">1. Voor wie is de stick?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLAYERS.map((option) => (
              <label key={option.value} className={OPTION_CLASSES}>
                <input
                  type="radio"
                  name="indoor-player"
                  value={option.value}
                  checked={player === option.value}
                  onChange={() => setPlayer(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="indoor-height" className="block font-bold">
            2. Lengte van het kind
          </label>
          {player === 'child' ? (
            <>
              <div className="mt-3 flex items-center gap-2">
                <input
                  id="indoor-height"
                  type="number"
                  inputMode="numeric"
                  min={MIN_HEIGHT}
                  max={MAX_HEIGHT}
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  aria-describedby="indoor-height-help"
                  aria-invalid={
                    height !== '' && !heightValid ? true : undefined
                  }
                  className="w-28 rounded-xl border border-lijngrijs bg-white px-3 py-2.5"
                />
                <span className="text-sm text-lijngrijs">
                  cm, met schoenen aan
                </span>
              </div>
              <p
                id="indoor-height-help"
                className="mt-2 text-xs text-lijngrijs"
              >
                {height !== '' && !heightValid
                  ? `Vul een hele lengte in tussen ${MIN_HEIGHT} en ${MAX_HEIGHT} cm.`
                  : 'Hiermee bepalen we de sticklengte, net als in de stickwijzer.'}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-lijngrijs">
              {player === 'adult'
                ? `Voor volwassenen zoeken we in ${formatInch(36.5)} en ${formatInch(37.5)}.`
                : 'Alleen nodig bij een kind.'}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="font-bold">3. Wat is je budget?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(INDOOR_BUDGETS) as IndoorBudget[]).map((key) => (
              <label key={key} className={OPTION_CLASSES}>
                <input
                  type="radio"
                  name="indoor-budget"
                  value={key}
                  checked={budget === key}
                  onChange={() => setBudget(key)}
                />
                {INDOOR_BUDGETS[key].label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="lg:col-span-3">
          <Button type="submit" disabled={!complete}>
            Toon zaalsticks
          </Button>
        </div>
      </form>

      <div aria-live="polite">
        {selection && submitted && (
          <div className="mt-8 border-t border-rand pt-6">
            {selection.sizeAdvice && (
              <div className="mb-5 text-sm text-inkt/80">
                <p className="font-bold text-inkt">
                  Lengteadvies: {formatInch(selection.sizeAdvice.primaryInch)}
                  {selection.sizeAdvice.alternativeInch !== undefined &&
                    ` (of ${formatInch(selection.sizeAdvice.alternativeInch)})`}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {sizeAdviceText(selection.sizeAdvice).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {selection.matches.length > 0 ? (
              <>
                <h3 className="text-lg font-bold">
                  {selection.matches.length === 1
                    ? '1 zaalstick past bij je antwoorden'
                    : `${selection.matches.length} zaalsticks passen bij je antwoorden`}
                </h3>
                <p className="mt-1 text-sm text-lijngrijs">
                  Een eerste selectie op maat en budget, van laag naar hoog in
                  prijs. Dit is geen persoonlijk advies: kijk bij elke stick ook
                  naar het profiel en het gevoel.
                </p>
                <PartnerLinkNote />
                <ul className="mt-4 space-y-4">
                  {selection.matches.map((match) => (
                    <ResultCard
                      key={match.product.slug}
                      product={match.product}
                      sizeInch={match.sizeInch}
                      alternativeSize={match.alternativeSize}
                      hasBudget={submitted.budget !== 'geen'}
                    />
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                  {selection.noMatchReason === 'size'
                    ? `We hebben op dit moment geen zaalstick in ${selection.sizes
                        .map(formatInch)
                        .join(' of ')}. ${
                        selection.shorterSizeMatches.length > 0
                          ? 'Hieronder staan sticks die één maat korter zijn; een langere stick tonen we bewust niet.'
                          : 'Ook één maat korter hebben we niets, en een langere stick tonen we bewust niet.'
                      }`
                    : 'In deze maat hebben we op dit moment geen zaalstick binnen dit budget. Kies een ruimer budget om de sticks in deze maat te zien.'}{' '}
                  <Link
                    href="/interesse?source=algemeen"
                    className="font-semibold underline"
                  >
                    Vraag persoonlijk advies
                  </Link>
                </p>

                {selection.shorterSizeMatches.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold">Eén maat korter</h3>
                    <p className="mt-1 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                      <AlertIcon size={16} className="mt-0.5 shrink-0" />
                      Deze sticks zijn één maat korter dan het lengteadvies. Dat
                      kan werken, maar pas de stick bij voorkeur eerst in de
                      hand of vraag persoonlijk advies. We tonen bewust geen
                      langere stick.
                    </p>
                    <ul className="mt-4 space-y-4">
                      {selection.shorterSizeMatches.map((match) => (
                        <ResultCard
                          key={match.product.slug}
                          product={match.product}
                          sizeInch={match.sizeInch}
                          alternativeSize={false}
                          shorterSize
                          hasBudget={submitted.budget !== 'geen'}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
