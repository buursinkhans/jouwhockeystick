import type { AdviceResult } from '@/advice-engine/types';
import type { NoMatchReason } from '@/advice-engine/hardFilters';
import { RecommendationCard } from './RecommendationCard';

const NO_MATCH_MESSAGES: Record<NoMatchReason, string> = {
  length:
    'We hebben op dit moment geen stick in onze catalogus in een lengte die past bij je lichaamslengte.',
  budget:
    'We hebben op dit moment geen stick in onze catalogus die binnen je opgegeven budget past.',
  availability:
    'De sticks die verder bij je passen, zijn op dit moment gemarkeerd als niet beschikbaar.',
  verification:
    'We hebben op dit moment geen recent geverifieerde producten in onze catalogus.',
};

export function QuizResult({ advice }: { advice: AdviceResult }) {
  if (!advice.recommended) {
    const message = advice.noMatchReason
      ? NO_MATCH_MESSAGES[advice.noMatchReason]
      : 'We konden op basis van je antwoorden geen eenduidig advies geven.';

    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-amber-900">
          {message} Hieronder vind je een paar alternatieven om te overwegen.
        </p>
        {advice.alternatives.map((alt) => (
          <RecommendationCard
            key={alt.product.slug}
            product={alt.product}
            reasonCodes={alt.reasonCodes}
            cautions={alt.cautions}
          />
        ))}
      </div>
    );
  }

  const { recommended } = advice;

  return (
    <div className="space-y-6">
      {advice.isUncertain && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-amber-900">
          Dit advies is niet honderd procent eenduidig — bekijk gerust ook het alternatief
          hieronder.
        </p>
      )}

      <RecommendationCard
        product={recommended.product}
        reasonCodes={recommended.reasonCodes}
        cautions={recommended.cautions}
        label="Advies"
      />

      {advice.alternatives.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Alternatief</h3>
          <div className="mt-3 space-y-4">
            {advice.alternatives.map((alt) => (
              <RecommendationCard
                key={alt.product.slug}
                product={alt.product}
                reasonCodes={alt.reasonCodes}
                cautions={alt.cautions}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
