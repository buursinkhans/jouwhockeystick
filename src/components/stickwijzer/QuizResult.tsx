import Link from 'next/link';
import type { AdviceResult } from '@/advice-engine/types';
import { Card } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { ProductNotice } from '@/components/ui/ProductNotice';
import { StickIllustration } from '@/components/catalog/StickIllustration';
import { ReasonList } from './ReasonList';
import { CautionList } from './CautionList';

export function QuizResult({ advice }: { advice: AdviceResult }) {
  if (!advice.recommended) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-amber-900">
          We konden op basis van je antwoorden geen eenduidig advies geven — je signalen (zoals
          lengte en budget) spraken elkaar mogelijk tegen. Hieronder vind je een paar
          alternatieven om te overwegen.
        </p>
        {advice.alternatives.map((alt) => (
          <Card key={alt.product.slug}>
            <h3 className="text-lg font-semibold">
              <Link href={`/sticks/${alt.product.slug}`} className="hover:underline">
                {alt.product.name}
              </Link>
            </h3>
            <ReasonList reasonCodes={alt.reasonCodes} />
            <CautionList cautions={alt.cautions} />
            <div className="mt-3">
              <ProductNotice product={alt.product} />
            </div>
          </Card>
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

      <Card>
        <div className="flex items-start gap-4">
          <StickIllustration
            brand={recommended.product.brand}
            bowProfile={recommended.product.bowProfile.value}
            alt={recommended.product.imageAlt}
            className="h-16 w-16 shrink-0"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Advies</p>
            <h2 className="mt-1 text-xl font-bold">
              <Link href={`/sticks/${recommended.product.slug}`} className="hover:underline">
                {recommended.product.name}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-zinc-600">{recommended.product.summary}</p>
          </div>
        </div>
        <ReasonList reasonCodes={recommended.reasonCodes} />
        <CautionList cautions={recommended.cautions} />
        <div className="mt-4">
          <ProductNotice product={recommended.product} />
        </div>
        <div className="mt-4 flex gap-3">
          <ButtonLink href={`/sticks/${recommended.product.slug}`} variant="secondary">
            Bekijk details
          </ButtonLink>
          <ButtonLink href={`/interesse?product=${recommended.product.slug}&source=stickwijzer-resultaat`}>
            Ik heb interesse
          </ButtonLink>
        </div>
      </Card>

      {advice.alternatives.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Alternatief</h3>
          <div className="mt-3 space-y-4">
            {advice.alternatives.map((alt) => (
              <Card key={alt.product.slug}>
                <h4 className="font-semibold">
                  <Link href={`/sticks/${alt.product.slug}`} className="hover:underline">
                    {alt.product.name}
                  </Link>
                </h4>
                <ReasonList reasonCodes={alt.reasonCodes} />
                <CautionList cautions={alt.cautions} />
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
