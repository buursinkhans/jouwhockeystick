import { useState, type RefObject } from 'react';
import Link from 'next/link';
import type { AdviceAnswers } from '@/advice-engine/answers';
import type { AdviceResult } from '@/advice-engine/types';
import {
  ADVICE_DISCLAIMER,
  LEFT_HANDED_REFERRAL,
  NO_MATCH_TEXT,
  ROUTE_RESULT_COPY,
  SELLER_NOTE,
  START_FOOTNOTE,
  TRANSPARENCY_NOTE,
  formatInch,
  sizeAdviceText,
} from '@/content/stickwijzer/resultCopy';
import { Button, ButtonLink } from '@/components/ui/Button';
import { RecommendationCard } from './RecommendationCard';

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
}: {
  advice: AdviceResult;
  adviceGoal: AdviceAnswers['advice_goal'] | undefined;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onEdit: () => void;
  onRestart: () => void;
  onFeedback: (helpful: boolean) => void;
}) {
  const copy = ROUTE_RESULT_COPY[advice.route];
  const hasResults = advice.results.length > 0;
  const isLeftHanded = advice.referral === 'left_handed';
  const title = isLeftHanded
    ? 'Hiervoor helpen we je liever persoonlijk.'
    : hasResults
      ? copy.title
      : 'We hebben nu geen passende stick voor deze antwoorden.';

  return (
    <div className="space-y-8">
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold focus:outline-none"
        >
          {title}
        </h2>
        {hasResults && <p className="mt-2 text-inkt/80">{copy.summary}</p>}
        {hasResults && adviceGoal === 'child' && (
          <p className="mt-2 text-sm text-lijngrijs">
            Laat je kind de stick zo mogelijk even vasthouden: gevoel en plezier
            tellen mee.
          </p>
        )}
      </div>

      {isLeftHanded ? (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-amber-900">
          <p>{LEFT_HANDED_REFERRAL}</p>
          <ButtonLink href={INTEREST_HREF} className="mt-3">
            Vraag persoonlijk advies
          </ButtonLink>
        </div>
      ) : (
        <section aria-labelledby="size-advice-heading">
          <h3 id="size-advice-heading" className="text-lg font-semibold">
            Lengteadvies: {formatInch(advice.sizeAdvice.primaryInch)}
            {advice.sizeAdvice.alternativeInch !== undefined &&
              ` (of ${formatInch(advice.sizeAdvice.alternativeInch)})`}
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-inkt/80">
            {sizeAdviceText(advice.sizeAdvice).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {hasResults && (
        <section aria-labelledby="results-heading">
          <h3 id="results-heading" className="text-lg font-semibold">
            {advice.results.length === 1
              ? 'Onze aanbeveling'
              : 'Onze aanbevelingen'}
          </h3>
          {advice.isUncertain && (
            <p className="mt-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Dit advies is minder zeker dan we zouden willen. Lees de
              aandachtspunten goed en pas de stick bij voorkeur eerst in de
              hand.
            </p>
          )}
          <div className="mt-3 space-y-4">
            {advice.results.map((item) => (
              <RecommendationCard
                key={item.product.slug}
                item={item}
                route={advice.route}
              />
            ))}
          </div>
          {advice.route === 'START' && (
            <p className="mt-4 text-sm text-inkt/80">{START_FOOTNOTE}</p>
          )}
        </section>
      )}

      {!hasResults && !isLeftHanded && (
        <section aria-labelledby="no-match-heading">
          <h3 id="no-match-heading" className="sr-only">
            Geen passende stick
          </h3>
          <div className="rounded-lg bg-amber-50 px-4 py-3 text-amber-900">
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
                {advice.otherSizeOptions.map((item) => (
                  <RecommendationCard
                    key={item.product.slug}
                    item={item}
                    route={advice.route}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section
        aria-labelledby="method-heading"
        className="space-y-2 text-sm text-inkt/80"
      >
        <h3 id="method-heading" className="text-lg font-semibold text-inkt">
          Waarom dit advies?
        </h3>
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

      {!isLeftHanded && <Feedback onFeedback={onFeedback} />}

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={onEdit}>
          Antwoorden aanpassen
        </Button>
        <Button variant="secondary" onClick={onRestart}>
          Opnieuw beginnen
        </Button>
      </div>
    </div>
  );
}
