import Link from 'next/link';
import type { AdviceRoute } from '@/advice-engine/answers';
import type { AdviceReason, AdviceResultItem, ReasonCode } from '@/advice-engine/types';
import { BOW_LABELS } from '@/catalog/labels';
import { getModelYear } from '@/catalog/modelYear';
import type { Product } from '@/catalog/types';
import { QUESTIONS } from '@/content/stickwijzer/questions';
import {
  CAUTION_TEXT,
  LESS_SUITABLE_FOR,
  ROLE_INTRO,
  formatInch,
  reasonText,
  roleLabel,
} from '@/content/stickwijzer/resultCopy';
import { SOURCE_DISPLAY_LABEL, buildProductSourceRecords, sourceLine } from '@/sources/productSources';
import { Card } from '@/components/ui/Card';
import { ProductNotice } from '@/components/ui/ProductNotice';
import { RetailerLinks } from '@/components/ui/RetailerLinks';
import { AlertIcon, CheckIcon } from '@/components/ui/icons';
import { ProductImage } from '@/components/catalog/ProductImage';

/**
 * Reasons where the spec itself comes from the source, but what it means for
 * this player is our own reading — so a manufacturer spec is never passed
 * off as manufacturer-backed advice.
 */
const INTERPRETED_REASONS: ReadonlySet<ReasonCode> = new Set([
  'EXPERIENCE_FIT',
  'CONTROL_FOCUS',
  'BOW_FIT',
  'FEEL_FIT',
]);

/** The compact source or method line shown under each reason (spec §9.5). */
function ReasonSource({ reason, product }: { reason: AdviceReason; product: Product }) {
  if (reason.evidence.kind === 'rule') {
    const basedOn = reason.evidence.basedOn.map((id) => QUESTIONS[id].shortLabel).join(', ');
    return <>Redactionele adviesregel — gebaseerd op je antwoorden: {basedOn}</>;
  }
  const sourced = product[reason.evidence.field];
  if (!sourced) {
    return <>Redactionele adviesregel</>;
  }
  return (
    <>
      {sourceLine(product, sourced)}, gecontroleerd op{' '}
      <time dateTime={sourced.lastVerifiedAt}>{sourced.lastVerifiedAt}</time>
      {INTERPRETED_REASONS.has(reason.code) && sourced.source !== 'editorial-estimate'
        ? ' · de duiding is een redactionele adviesregel'
        : ''}
    </>
  );
}

export function RecommendationCard({ item, route }: { item: AdviceResultItem; route: AdviceRoute }) {
  const { product } = item;
  const modelYear = getModelYear(product);
  const carbon = product.carbonPercentage?.value;
  const sources = buildProductSourceRecords(product);

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        {roleLabel(item.role, route)}
      </p>
      <p className="mt-1 text-sm text-zinc-600">{ROLE_INTRO[item.role]}</p>

      <div className="mt-4 flex items-start gap-4">
        <ProductImage product={product} className="h-20 w-20 shrink-0" />
        <div>
          <h4 className="text-lg font-bold">
            <Link href={`/sticks/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h4>
          <p className="mt-1 text-sm text-zinc-600">{product.summary}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-zinc-500">Maat</dt>
          <dd className="font-semibold">{formatInch(item.sizeInch)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Richtprijs</dt>
          <dd className="font-semibold">€{product.priceIndicativeEur.value.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Bow-profiel</dt>
          <dd>{product.bowProfile ? BOW_LABELS[product.bowProfile.value] : 'Niet bevestigd'}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Carbon</dt>
          <dd>{carbon === undefined ? 'Niet vermeld door de fabrikant' : `${carbon}%`}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Modeljaar</dt>
          <dd>{modelYear ?? 'Niet bevestigd'}</dd>
        </div>
      </dl>
      <ProductNotice />

      <h5 className="mt-5 text-sm font-semibold">Waarom deze stick past</h5>
      <ul className="mt-2 space-y-3">
        {item.reasons.map((reason) => (
          <li key={reason.code} className="flex items-start gap-2 text-sm">
            <CheckIcon size={16} className="mt-0.5 shrink-0 text-emerald-700" />
            <span>
              {reasonText(reason, product, route)}
              <span className="mt-0.5 block text-xs text-zinc-500">
                <ReasonSource reason={reason} product={product} />
              </span>
            </span>
          </li>
        ))}
      </ul>

      <h5 className="mt-5 text-sm font-semibold">Let op vóór je koopt</h5>
      <ul className="mt-2 space-y-2">
        {item.cautions.map((code) => (
          <li key={code} className="flex items-start gap-2 text-sm text-amber-900">
            <AlertIcon size={16} className="mt-0.5 shrink-0" />
            <span>{CAUTION_TEXT[code]}</span>
          </li>
        ))}
        {item.cautions.length === 0 && (
          <li className="flex items-start gap-2 text-sm text-amber-900">
            <AlertIcon size={16} className="mt-0.5 shrink-0" />
            <span>
              {product.pointsOfAttention.value[0]}
              <span className="mt-0.5 block text-xs text-zinc-500">
                {sourceLine(product, product.pointsOfAttention)}
              </span>
            </span>
          </li>
        )}
      </ul>
      <p className="mt-3 text-sm text-zinc-700">{LESS_SUITABLE_FOR[product.experienceLevel.value]}</p>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer select-none font-medium text-emerald-800">
          Bronnen en methode
        </summary>
        <ul className="mt-2 space-y-2 text-zinc-700">
          {sources.map((source) => (
            <li key={source.id}>
              <span className="font-medium">{SOURCE_DISPLAY_LABEL[source.sourceType]}</span> —{' '}
              {source.publisher}: {source.claimSummary}. Gecontroleerd op{' '}
              <time dateTime={source.checkedAt}>{source.checkedAt}</time>.
              {source.url && (
                <>
                  {' '}
                  <a href={source.url} rel="noopener noreferrer" className="text-emerald-800 underline">
                    Bron bekijken
                  </a>
                </>
              )}
            </li>
          ))}
          <li>
            <span className="font-medium">Eigen meting</span> — niet gemeten.
          </li>
          <li>
            <span className="font-medium">Praktijktest</span> — nog niet getest.
          </li>
        </ul>
        <p className="mt-2 text-zinc-700">
          Matchscore: {Math.round(item.score)} van 100. De score vergelijkt alleen sticks binnen dit advies
          en zegt niets over de kwaliteit van de stick zelf.{' '}
          <Link href="/methodiek" className="text-emerald-800 underline">
            Hoe komt ons advies tot stand?
          </Link>
        </p>
      </details>

      <div className="mt-5">
        <RetailerLinks brand={product.brand} productName={product.name} />
      </div>
      <p className="mt-3 text-sm">
        <Link href={`/sticks/${product.slug}`} className="font-semibold text-emerald-800 hover:underline">
          Bekijk alle specificaties
        </Link>
        {' · '}
        <Link href={`/vergelijk?a=${product.slug}`} className="font-semibold text-emerald-800 hover:underline">
          Vergelijk met een andere stick
        </Link>
      </p>
    </Card>
  );
}
