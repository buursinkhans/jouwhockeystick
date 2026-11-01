'use client';

import Link from 'next/link';
import { OfferRows } from '@/components/offers/OfferRows';
import { ShareAdviceButton } from '@/components/stickwijzer/ShareAdviceButton';
import { PARTNER_LINK_LABEL, PARTNER_LINK_URL } from '@/content/partnerLinks';
import {
  ADVICE_CERTAINTY,
  CATEGORY_HEADING,
  KEEPER_TEXT,
  RESULT_HEADINGS,
  ROLE_LABEL,
  SOURCE_NAME,
  checkText,
  limitText,
  noMatchText,
  profileLines,
  reasonText,
} from '@/content/schoenenwijzer/resultCopy';
import type { ShoeAnswers } from '@/shoe-advice/answers';
import { fitNotes, type FitParticular } from '@/shoe-advice/fitNotes';
import type { ShoeAdvice, ShoeAdviceItem } from '@/shoe-advice/types';

const SELLER_NOTE = 'De winkel is de verkoper: die levert en regelt retouren en garantie. We krijgen een vergoeding als je via een link koopt; dat verandert het advies en de volgorde niet.';
const DISCLAIMER =
  'Dit is een pasadvies op basis van je antwoorden en de gegevens van merken en winkels. Het is geen garantie op een goede pasvorm en geen medisch advies. We hebben de schoenen niet zelf getest.';

function Item({ item, extraChecks, certaintyOf }: { item: ShoeAdviceItem; extraChecks: string[]; certaintyOf: ReturnType<typeof fitNotes>['certainty'] }) {
  const certainty = ADVICE_CERTAINTY[certaintyOf(item.certainty)];
  const checks = [...item.checks.map(checkText), ...extraChecks];
  return (
    <article className="rounded-3xl border border-rand bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold tracking-wide text-veld uppercase">{ROLE_LABEL[item.role]}</p>
      <div className="mt-2 flex items-start gap-4">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={`${item.shoe.brand} ${item.shoe.model}`} loading="lazy" className="h-24 w-24 shrink-0 rounded-xl bg-krijt object-contain" />
        ) : (
          <div className="h-24 w-24 shrink-0 rounded-xl bg-krijt" aria-hidden="true" />
        )}
        <div>
          <p className="text-xs font-semibold text-inkt/70">{item.shoe.brand}</p>
          <h4 className="text-lg leading-snug font-bold">
            <Link href={`/hockeyschoenen/${item.shoe.slug}`} className="hover:underline">
              {item.shoe.brand} {item.shoe.model}
            </Link>
          </h4>
        </div>
      </div>

      <h5 className="mt-4 font-semibold">{RESULT_HEADINGS.why}</h5>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-inkt/80">
        {item.reasons.map((reason, i) => (
          <li key={i}>{reasonText(reason)}</li>
        ))}
      </ul>

      {checks.length > 0 && (
        <>
          <h5 className="mt-4 font-semibold">{RESULT_HEADINGS.check}</h5>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-inkt/80">
            {checks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </>
      )}

      {item.limits.length > 0 && (
        <>
          <h5 className="mt-4 font-semibold">{RESULT_HEADINGS.limits}</h5>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-inkt/80">
            {item.limits.map((limit, i) => (
              <li key={i}>{limitText(limit)}</li>
            ))}
          </ul>
        </>
      )}

      <h5 className="mt-4 font-semibold">{RESULT_HEADINGS.basis}</h5>
      <p className="mt-1 text-sm text-inkt/80">
        <span className="font-semibold">{certainty.label}.</span> {certainty.text}
      </p>
      <p className="mt-1 text-xs text-lijngrijs">
        Bron: {item.sources.map((s) => SOURCE_NAME[s]).join(' en ') || 'geen'}
        {item.lastChecked && ` · gecontroleerd op ${item.lastChecked}`}
      </p>

      {item.offers.length > 0 && (
        <div className="mt-4 border-t border-rand pt-3">
          <OfferRows
            brand={item.shoe.brand}
            productName={`${item.shoe.brand} ${item.shoe.model}`}
            placement="schoenwijzer"
            offers={item.offers}
            nowIso={new Date().toISOString()}
            visible={2}
            more={{ kind: 'link', href: `/hockeyschoenen/${item.shoe.slug}#waar-te-koop` }}
            detail="full"
          />
          <p className="mt-1 text-xs text-inkt/70">
            <Link href={PARTNER_LINK_URL} className="underline hover:text-veld">
              {PARTNER_LINK_LABEL}
            </Link>
            , de winkel is de verkoper
          </p>
        </div>
      )}
    </article>
  );
}

/**
 * The outcome of the schoenenwijzer (keuzemodel §8): profile, per advised
 * model why, what to check, when it may fit less and the basis, and the
 * shops. `fitParticulars` (question 7) only exists in the browser of the
 * player who filled it in; a shared advice never has it.
 */
export function ShoeAdviceView({
  advice,
  answers,
  fitParticulars = [],
  shareHref,
}: {
  advice: ShoeAdvice;
  answers: ShoeAnswers;
  fitParticulars?: readonly FitParticular[];
  shareHref: string | null;
}) {
  if (advice.kind === 'keeper') {
    return (
      <section aria-labelledby="keeper-kop" className="rounded-3xl border border-rand bg-krijt p-5">
        <h2 id="keeper-kop" className="text-2xl font-bold">
          {KEEPER_TEXT.heading}
        </h2>
        <p className="mt-2 text-inkt/80">{KEEPER_TEXT.text}</p>
      </section>
    );
  }

  const notes = fitNotes(fitParticulars);
  return (
    <div className="space-y-8">
      {notes.notices.map((notice) => (
        <p key={notice} role="note" className="rounded-2xl border border-rand bg-krijt p-4 text-inkt/90">
          {notice}
        </p>
      ))}

      <section aria-labelledby="profiel-kop">
        <h2 id="profiel-kop" className="text-2xl font-bold">
          {RESULT_HEADINGS.profile}
        </h2>
        <ul className="mt-2 space-y-1 text-inkt/80">
          {profileLines(answers).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      {advice.advices.map((part) => (
        <section key={part.category} aria-labelledby={`advies-${part.category}`}>
          <h2 id={`advies-${part.category}`} className="text-2xl font-bold">
            {advice.advices.length > 1 ? CATEGORY_HEADING[part.category] : 'Jouw schoenadvies'}
          </h2>
          {part.noMatch ? (
            <div className="mt-3 rounded-2xl border border-rand bg-white p-4">
              <p className="text-inkt/80">{noMatchText(part.noMatch, part.category)}</p>
              <Link href={`/hockeyschoenen?type=${part.category}`} className="mt-2 inline-flex min-h-11 items-center font-semibold text-veld hover:underline">
                Bekijk de {part.category === 'veld' ? 'veldhockeyschoenen' : 'zaalhockeyschoenen'}
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              {part.items.map((item) => (
                <Item key={item.shoe.slug} item={item} extraChecks={notes.checks} certaintyOf={notes.certainty} />
              ))}
            </div>
          )}
        </section>
      ))}

      <section className="space-y-2 text-sm text-inkt/80">
        <p>{DISCLAIMER}</p>
        <p>{SELLER_NOTE}</p>
        <p className="text-xs text-lijngrijs">adviesregels {advice.ruleSetVersion}</p>
      </section>

      {shareHref && <ShareAdviceButton href={shareHref} subject="schoen" />}
    </div>
  );
}
