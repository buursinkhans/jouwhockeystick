import { useState, type RefObject } from 'react';
import Link from 'next/link';
import { ADVICE_MODE_TEXT } from '@/content/stickwijzer/quick';
import type { AdviceAnswers } from '@/advice-engine/answers';
import type { AdviceResult } from '@/advice-engine/types';
import {
  ADVICE_DISCLAIMER,
  bestModelOtherSizeText,
  brandNotFoundText,
  candidateCountText,
  playerLevelText,
  NO_AMBITIOUS_TEXT,
  NO_MATCH_TEXT,
  ROUTE_RESULT_COPY,
  SELLER_NOTE,
  START_FOOTNOTE,
  TRANSPARENCY_NOTE,
  ADVICE_TRUST_POINTS,
  adviceSteps,
  formatInch,
  levelLabel,
  roleLead,
  sizeAdviceText,
} from '@/content/stickwijzer/resultCopy';
import { ROUTE_SHORT_LABELS } from '@/content/stickwijzer/questions';
import { CheckIcon } from '@/components/ui/icons';
import { AdviceClick, adviceClickContext, type AdviceClickAnswers } from '@/lib/analytics/adviceContext';
import { trackEvent } from '@/lib/analytics/track';
import { Button, ButtonLink } from '@/components/ui/Button';
import { RecommendationCard } from './RecommendationCard';
import { PartnerLinkNote } from '@/components/ui/PartnerLinkNote';
import { ShareAdviceButton } from './ShareAdviceButton';

const INTEREST_HREF = '/interesse?source=stickwijzer-resultaat';

function Feedback({ onFeedback }: { onFeedback: (helpful: boolean) => void }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="text-sm text-inkt/80" role="status">
        Dank je, daar leren we van.
      </p>
    );
  }
  const answer = (helpful: boolean) => {
    onFeedback(helpful);
    setSubmitted(true);
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm font-medium">Was dit advies nuttig?</p>
      <Button variant="secondary" onClick={() => answer(true)}>
        Ja
      </Button>
      <Button variant="secondary" onClick={() => answer(false)}>
        Nee
      </Button>
    </div>
  );
}

export function QuizResult({
  advice,
  adviceGoal,
  headingRef,
  onEdit,
  onRestart,
  onFeedback,
  shareHref,
  shared = false,
  quick = false,
  trackingAnswers,
}: {
  advice: AdviceResult;
  adviceGoal: AdviceAnswers['advice_goal'] | undefined;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onEdit: () => void;
  onRestart: () => void;
  onFeedback: (helpful: boolean) => void;
  /** Link to this advice for "Deel dit advies"; no button without it. */
  shareHref?: string;
  /** Opened from a shared link: one "do it yourself" button instead of edit/restart. */
  shared?: boolean;
  /** Quick advice (UX phase 1): say what it is based on, and offer the full stickwijzer. */
  quick?: boolean;
  /** Budget band and reason for a new stick, added to the shop clicks of this advice (not in a shared advice). */
  trackingAnswers?: AdviceClickAnswers;
}) {
  const copy = ROUTE_RESULT_COPY[advice.route];
  const hasResults = advice.results.length > 0;
  const [first, second] = advice.results;
  const compare =
    first && second
      ? {
          href: `/vergelijk?a=${first.product.slug}&b=${second.product.slug}`,
          a: first.product.name,
          b: second.product.name,
          pair: `${first.role}+${second.role}`,
        }
      : null;
  const size = `${formatInch(advice.sizeAdvice.primaryInch)}${advice.sizeAdvice.alternativeInch !== undefined ? ` (of ${formatInch(advice.sizeAdvice.alternativeInch)})` : ''}`;

  // Since 2026-10-22 the result starts with the sticks (and the size in one
  // line), so the shop buttons come first; the explanation moved down.
  return (
    <div className="space-y-8" data-advice-result>
      {hasResults && (
        <section aria-labelledby="results-heading">
          <h2
            id="results-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold focus:outline-none"
          >
            {advice.results.length === 1
              ? 'Onze aanbeveling'
              : 'Onze aanbevelingen'}
          </h2>
          {quick && (
            <p className="mt-3 max-w-2xl rounded-xl border border-rand bg-krijt px-4 py-3 text-sm text-inkt/80">
              {ADVICE_MODE_TEXT.resultNote}{' '}
              {!shared && (
                <button type="button" onClick={onRestart} className="font-semibold text-veld underline hover:no-underline">
                  Doe de uitgebreide stickwijzer
                </button>
              )}
            </p>
          )}
          {/*
            Profile card (redesign fase 2): what the advice is based on, in
            one glance, before the sticks. Everything here comes from the
            advice itself; the full explanation stays below.
          */}
          <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-rand bg-rand shadow-card">
            <div className="bg-white px-3 py-3 sm:px-4">
              <dt className="text-xs font-semibold tracking-wide text-lijngrijs uppercase">Jouw maat</dt>
              <dd className="mt-1 text-[0.9375rem] leading-tight font-bold break-words text-inkt sm:text-xl">{size}</dd>
              <dd className="text-xs">
                <a href="#lengteadvies" className="text-veld underline hover:no-underline">
                  Waarom deze maat?
                </a>
              </dd>
            </div>
            <div className="bg-white px-3 py-3 sm:px-4">
              <dt className="text-xs font-semibold tracking-wide text-lijngrijs uppercase">Niveau</dt>
              <dd className="mt-1 text-[0.9375rem] leading-tight font-bold break-words text-inkt sm:text-xl">{levelLabel(advice.playerLevel.band)}</dd>
            </div>
            <div className="bg-white px-3 py-3 sm:px-4">
              <dt className="text-xs font-semibold tracking-wide text-lijngrijs uppercase">Route</dt>
              <dd className="mt-1 text-[0.9375rem] leading-tight font-bold break-words text-inkt sm:text-xl">{ROUTE_SHORT_LABELS[advice.route]}</dd>
            </div>
          </dl>
          {advice.candidateCount > 0 && (
            <p className="mt-3 text-sm text-inkt/80">
              {candidateCountText(advice.candidateCount, advice.results.length)}
            </p>
          )}
          {/* Why this ranking can be trusted, before the first stick (redesign fase 4). */}
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-inkt/80">
            {ADVICE_TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <CheckIcon size={14} className="shrink-0 text-veld" />
                {point}
              </li>
            ))}
          </ul>
          {advice.brandPreference && !advice.brandPreference.matched && (
            <p className="mt-3 rounded-lg bg-krijt px-4 py-3 text-sm text-inkt/80">
              {brandNotFoundText(
                advice.brandPreference.brand,
                advice.brandPreference.missReason,
              )}
            </p>
          )}
          {advice.bestModelOtherSize && (
            <p className="mt-2 rounded-lg bg-krijt px-4 py-3 text-sm text-inkt/80">
              {bestModelOtherSizeText(
                advice.bestModelOtherSize,
                advice.sizeAdvice,
              )}
            </p>
          )}
          {advice.isUncertain && (
            <p className="mt-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Dit advies is minder zeker dan we zouden willen. Lees de
              aandachtspunten goed en pas de stick bij voorkeur eerst in de
              hand.
            </p>
          )}
          <PartnerLinkNote />
          <div className="mt-3 space-y-4">
            {advice.results.map((item, index) => (
              <div key={item.product.slug} className="space-y-3">
                {roleLead(item.role) && (
                  <p className="text-sm font-semibold text-inkt">{roleLead(item.role)}</p>
                )}
                <AdviceClick.Provider value={adviceClickContext(item, index + 1, advice.route, trackingAnswers)}>
                  <RecommendationCard item={item} route={advice.route} />
                </AdviceClick.Provider>
              </div>
            ))}
          </div>
          {compare && (
            // The doubt is largest between the first two picks (fase 9): one tap to see them side by side.
            <p className="mt-4 rounded-lg bg-krijt px-4 py-3 text-sm text-inkt/80">
              <span className="font-semibold text-inkt">Twijfel je tussen de twee?</span>{' '}
              <Link
                href={compare.href}
                onClick={() => trackEvent({ name: 'advice_compare_click', pair: compare.pair })}
                className="font-semibold text-veld hover:underline"
              >
                Zet de {compare.a} en de {compare.b} naast elkaar
              </Link>
              .
            </p>
          )}
          {advice.noAmbitiousReason && (
            <p className="mt-4 rounded-lg bg-krijt px-4 py-3 text-sm text-inkt/80">
              <span className="font-semibold text-inkt">
                Geen ambitieuze keuze.
              </span>{' '}
              {NO_AMBITIOUS_TEXT[advice.noAmbitiousReason]}
            </p>
          )}
          {advice.route === 'START' && (
            <p className="mt-4 text-sm text-inkt/80">{START_FOOTNOTE}</p>
          )}
          {shareHref && (
            <div className="mt-6">
              <ShareAdviceButton href={shareHref} />
            </div>
          )}
        </section>
      )}

      {!hasResults && (
        <section aria-labelledby="no-match-heading">
          <h2
            id="no-match-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold focus:outline-none"
          >
            We hebben nu geen passende stick voor deze antwoorden.
          </h2>
          <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-amber-900">
            <p>
              {advice.noMatchReason
                ? NO_MATCH_TEXT[advice.noMatchReason]
                : NO_MATCH_TEXT.data}
            </p>
            <p className="mt-2 text-sm">
              Laat het ons weten, dan kijken we persoonlijk mee of geven we een
              seintje als er een passende stick is.
            </p>
            <ButtonLink href={INTEREST_HREF} className="mt-3">
              Vraag persoonlijk advies
            </ButtonLink>
          </div>

          {advice.otherSizeOptions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">
                Alternatief in een andere maat
              </h3>
              <p className="mt-1 text-sm text-inkt/80">
                Deze sticks passen bij de overige antwoorden, maar zijn één maat
                korter dan het lengteadvies. We tonen bewust geen langere stick.
              </p>
              <div className="mt-3 space-y-4">
                {advice.otherSizeOptions.map((item, index) => (
                  <AdviceClick.Provider
                    key={item.product.slug}
                    value={adviceClickContext(item, advice.results.length + index + 1, advice.route, trackingAnswers)}
                  >
                    <RecommendationCard item={item} route={advice.route} />
                  </AdviceClick.Provider>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="explain-heading" className="text-inkt/80">
        <h3 id="explain-heading" className="text-lg font-semibold text-inkt">
          {hasResults ? copy.title : 'Over je antwoorden'}
        </h3>
        {hasResults && <p className="mt-2">{copy.summary}</p>}
        <p className="mt-2 text-sm">{playerLevelText(advice.playerLevel)}</p>
        {hasResults && adviceGoal === 'child' && (
          <p className="mt-2 text-sm text-lijngrijs">
            Laat je kind de stick zo mogelijk even vasthouden: gevoel en plezier
            tellen mee.
          </p>
        )}
        <h4 id="lengteadvies" className="mt-5 scroll-mt-24 font-semibold text-inkt">
          Lengteadvies: {size}
        </h4>
        <ul className="mt-2 space-y-1 text-sm">
          {sizeAdviceText(advice.sizeAdvice).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {hasResults && (
          // A quiet pointer to the shoe section (decision log 2026-11-01), not part of the advice.
          <p className="mt-4 text-sm">
            Ook nieuwe hockeyschoenen nodig?{' '}
            <Link href="/hockeyschoenen" className="font-semibold text-veld hover:underline">
              Bekijk de hockeyschoenen
            </Link>
          </p>
        )}
      </section>

      <section
        aria-labelledby="method-heading"
        className="space-y-2 text-sm text-inkt/80"
      >
        <h3 id="method-heading" className="text-lg font-semibold text-inkt">
          Waarom dit advies?
        </h3>
        {hasResults && advice.candidateCount > 0 && (
          <ol className="list-decimal space-y-1 pl-5">
            {adviceSteps(advice.candidateCount, advice.results.length).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        <p>{TRANSPARENCY_NOTE}</p>
        <p>{ADVICE_DISCLAIMER}</p>
        <p>{SELLER_NOTE}</p>
        <p>
          <Link
            href={advice.methodUrl}
            className="font-semibold text-veld hover:underline"
          >
            Hoe komt ons advies tot stand?
          </Link>
        </p>
        <p className="text-xs text-lijngrijs">
          {advice.adviceVersion} · adviesregels {advice.ruleSetVersion} ·
          catalogus {advice.catalogVersion}
        </p>
      </section>

      <Feedback onFeedback={onFeedback} />

      <div className="flex flex-wrap gap-3">
        {shared ? (
          <Button variant="secondary" onClick={onRestart}>
            Doe de stickwijzer zelf
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onEdit}>
              Antwoorden aanpassen
            </Button>
            <Button variant="secondary" onClick={onRestart}>
              Opnieuw beginnen
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
