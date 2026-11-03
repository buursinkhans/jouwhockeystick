import { productPath } from '@/catalog/paths';
import Link from 'next/link';
import { LENGTH_TABLE_PATH } from '@/lib/site';
import { isPassaSportsOnly, isSoldAtBol } from '@/catalog/shop';
import { getOffers, lowestTotal } from '@/catalog/offers';
import { WhereToBuy } from '@/components/offers/WhereToBuy';
import type { AdviceRoute } from '@/advice-engine/answers';
import type {
  AdviceReason,
  AdviceResultItem,
  ReasonCode,
  ResultRole,
} from '@/advice-engine/types';
import { BOW_LABELS } from '@/catalog/labels';
import { getModelYear } from '@/catalog/modelYear';
import type { Product } from '@/catalog/types';
import { QUESTIONS } from '@/content/stickwijzer/questions';
import {
  CAUTION_TEXT,
  LESS_SUITABLE_FOR,
  formatInch,
  reasonText,
  roleIntro,
  roleLabel,
} from '@/content/stickwijzer/resultCopy';
import {
  SOURCE_DISPLAY_LABEL,
  buildProductSourceRecords,
  sourceLine,
} from '@/sources/productSources';
import { Card } from '@/components/ui/Card';
import { ProductNotice } from '@/components/ui/ProductNotice';
import { AlertIcon, BoltIcon, CheckIcon, ShieldIcon, StickIcon, TargetIcon } from '@/components/ui/icons';
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
function ReasonSource({
  reason,
  product,
}: {
  reason: AdviceReason;
  product: Product;
}) {
  if (reason.evidence.kind === 'rule') {
    const basedOn = reason.evidence.basedOn
      .map((id) => QUESTIONS[id].shortLabel)
      .join(', ');
    return (
      <>Redactionele adviesregel — gebaseerd op je antwoorden: {basedOn}</>
    );
  }
  const sourced = product[reason.evidence.field];
  if (!sourced) {
    return <>Redactionele adviesregel</>;
  }
  return (
    <>
      {sourceLine(product, sourced)}, gecontroleerd op{' '}
      <time dateTime={sourced.lastVerifiedAt}>{sourced.lastVerifiedAt}</time>
      {INTERPRETED_REASONS.has(reason.code) &&
      sourced.source !== 'editorial-estimate'
        ? ' · de duiding is een redactionele adviesregel'
        : ''}
    </>
  );
}

/** An icon per role, so the three picks read at a glance; the label next to it says it in words. */
const ROLE_ICONS: Partial<Record<ResultRole, typeof TargetIcon>> = {
  best_match: TargetIcon,
  safe_choice: ShieldIcon,
  ambitious_choice: BoltIcon,
};

function RoleBadge({ role }: { role: ResultRole }) {
  const RoleIcon = ROLE_ICONS[role] ?? StickIcon;
  return (
    <span
      aria-hidden="true"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        role === 'best_match' ? 'bg-veld text-white' : 'bg-krijt text-veld'
      }`}
    >
      <RoleIcon size={20} />
    </span>
  );
}

/**
 * Reasons shown before the shop buttons; the rest sit one click away, each
 * still with its source (spec §9.1, §9.5; CLAUDE.md: at least 2–3 visible).
 * The engine lists them in order of weight.
 */
const VISIBLE_REASONS = 3;

function ReasonList({
  reasons,
  product,
  route,
}: {
  reasons: readonly AdviceReason[];
  product: Product;
  route: AdviceRoute;
}) {
  return (
    <ul className="mt-2 space-y-3">
      {reasons.map((reason) => (
        <li key={reason.code} className="flex items-start gap-2 text-sm">
          <CheckIcon size={16} className="mt-0.5 shrink-0 text-veld" />
          <span>
            {reasonText(reason, product, route)}
            <span className="mt-0.5 block text-xs text-lijngrijs">
              <ReasonSource reason={reason} product={product} />
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function RecommendationCard({
  item,
  route,
}: {
  item: AdviceResultItem;
  route: AdviceRoute;
}) {
  const { product } = item;
  const modelYear = getModelYear(product);
  const carbon = product.carbonPercentage?.value;
  const sources = buildProductSourceRecords(product);
  const offers = getOffers(product);
  const lowest = lowestTotal(offers, { size: item.sizeInch, now: new Date() });

  return (
    <Card className={item.role === 'best_match' ? 'ring-2 ring-veld/20' : ''}>
      {/* Role first, as a badge (redesign fase 6): what this stick is in the advice. */}
      <div className="flex items-center gap-2.5">
        <RoleBadge role={item.role} />
        <div>
          <p className="text-sm font-bold text-inkt">{roleLabel(item.role, route)}</p>
          <p className="text-sm text-lijngrijs">{roleIntro(item)}</p>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-4">
        <ProductImage product={product} className="h-24 w-24 shrink-0 sm:h-32 sm:w-32" />
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-veld uppercase">{product.brand}</p>
          <h4 className="mt-0.5 text-xl leading-snug font-bold">
            <Link href={productPath(product)} className="hover:underline">
              {product.name}
            </Link>
          </h4>
          <p className="mt-1 text-sm text-inkt/80">{product.summary}</p>
        </div>
      </div>

      {/*
        Fit before price (redesign fase 6): the size and the specs that made
        the match; prices come only in "Waar te koop", after the reasons.
      */}
      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rand bg-rand text-sm sm:grid-cols-4">
        <div className="bg-white px-3 py-2.5">
          <dt className="text-xs text-lijngrijs">Jouw maat</dt>
          <dd className="font-semibold">{formatInch(item.sizeInch)}</dd>
          <dd className="text-xs">
            <Link href={LENGTH_TABLE_PATH} className="text-veld underline hover:no-underline">
              Waarom deze maat?
            </Link>
          </dd>
        </div>
        <div className="bg-white px-3 py-2.5">
          <dt className="text-xs text-lijngrijs">Kromming</dt>
          <dd className="font-semibold">
            {product.bowProfile
              ? BOW_LABELS[product.bowProfile.value]
              : 'Niet bevestigd'}
          </dd>
        </div>
        <div className="bg-white px-3 py-2.5">
          <dt className="text-xs text-lijngrijs">Carbon</dt>
          <dd className="font-semibold">{carbon === undefined ? 'Niet vermeld' : `${carbon}%`}</dd>
        </div>
        <div className="bg-white px-3 py-2.5">
          <dt className="text-xs text-lijngrijs">Modeljaar</dt>
          <dd className="font-semibold">{modelYear ?? 'Niet bevestigd'}</dd>
        </div>
      </dl>

      {/* The match and the trade-off side by side from sm, so the compromise is never hidden. */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h5 className="text-sm font-semibold">Waarom deze stick past</h5>
          <ReasonList reasons={item.reasons.slice(0, VISIBLE_REASONS)} product={product} route={route} />
          {item.reasons.length > VISIBLE_REASONS && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer select-none font-medium text-veld">
                Nog {item.reasons.length - VISIBLE_REASONS}{' '}
                {item.reasons.length - VISIBLE_REASONS === 1 ? 'reden' : 'redenen'}
              </summary>
              <ReasonList reasons={item.reasons.slice(VISIBLE_REASONS)} product={product} route={route} />
            </details>
          )}
        </div>

        <div className="sm:border-l sm:border-rand sm:pl-6">
          <h5 className="text-sm font-semibold">Waar je op inlevert</h5>
          <ul className="mt-2 space-y-2">
            {item.cautions.map((code) => (
              <li
                key={code}
                className="flex items-start gap-2 text-sm text-amber-900"
              >
                <AlertIcon size={16} className="mt-0.5 shrink-0" />
                <span>{CAUTION_TEXT[code]}</span>
              </li>
            ))}
            {item.cautions.length === 0 && (
              <li className="flex items-start gap-2 text-sm text-amber-900">
                <AlertIcon size={16} className="mt-0.5 shrink-0" />
                <span>
                  {product.pointsOfAttention.value[0]}
                  <span className="mt-0.5 block text-xs text-lijngrijs">
                    {sourceLine(product, product.pointsOfAttention)}
                  </span>
                </span>
              </li>
            )}
          </ul>
          <p className="mt-3 text-sm text-inkt/80">
            {LESS_SUITABLE_FOR[product.experienceLevel.value]}
          </p>
        </div>
      </div>

      {lowest === null && (
        // No current shop price: the indicative price, marked as such (CLAUDE.md, Testfase-scope).
        <div className="mt-6 rounded-xl bg-krijt px-4 py-3 text-sm">
          <p>
            <span className="font-semibold">Richtprijs €{product.priceIndicativeEur.value.toFixed(2)}</span>
            <span className="text-lijngrijs"> · geen actuele winkelprijs in deze maat</span>
          </p>
          <ProductNotice
            notSoldAtBol={!isSoldAtBol(product)}
            passaSportsOnly={isPassaSportsOnly(product)}
            alsoAtPassaSports={product.passaSportsProductUrl !== undefined}
            alsoAtPlutosport={product.plutosportProductUrl !== undefined}
            alsoAtHockeyCity={product.hockeyCityProductUrl !== undefined}
          />
        </div>
      )}

      {/*
        Shop buttons right after the reasons and the points of attention, so
        on a phone they are not hidden below the sources (2026-10-22).
      */}
      <div className="mt-6">
        <WhereToBuy
          product={product}
          placement="stickwijzer"
          variant="compact"
          size={item.sizeInch}
        />
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer select-none font-medium text-veld">
          Bronnen en methode
        </summary>
        <ul className="mt-2 space-y-2 text-inkt/80">
          {sources.map((source) => (
            <li key={source.id}>
              <span className="font-medium">
                {SOURCE_DISPLAY_LABEL[source.sourceType]}
              </span>{' '}
              — {source.publisher}: {source.claimSummary}. Gecontroleerd op{' '}
              <time dateTime={source.checkedAt}>{source.checkedAt}</time>.
              {source.url && (
                <>
                  {' '}
                  <a
                    href={source.url}
                    rel="noopener noreferrer"
                    className="text-veld underline"
                  >
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
        <p className="mt-2 text-inkt/80">
          Matchscore: {Math.round(item.score)} van 100. De score vergelijkt
          alleen sticks binnen dit advies en zegt niets over de kwaliteit van de
          stick zelf.{' '}
          <Link href="/methodiek" className="text-veld underline">
            Hoe komt ons advies tot stand?
          </Link>
        </p>
      </details>

      <p className="mt-3 text-sm">
        <Link
          href={productPath(product)}
          className="font-semibold text-veld hover:underline"
        >
          Bekijk alle specificaties
        </Link>
        {' · '}
        <Link
          href={`/vergelijk?a=${product.slug}`}
          className="font-semibold text-veld hover:underline"
        >
          Vergelijk met een andere stick
        </Link>
      </p>
    </Card>
  );
}
