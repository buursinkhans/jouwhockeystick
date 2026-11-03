import type { ComponentType, ReactNode, SVGProps } from 'react';
import Link from 'next/link';
import type { AdviceRoute } from '@/advice-engine/answers';
import { QUESTIONS } from '@/content/stickwijzer/questions';
import { routeStepRange } from '@/content/stickwijzer/progress';
import { ButtonLink } from '@/components/ui/Button';
import {
  AlertIcon,
  BallIcon,
  CheckIcon,
  EuroIcon,
  RulerIcon,
  SourceIcon,
  StepsIcon,
  StickIcon,
} from '@/components/ui/icons';

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const LOOKS_AT: Array<{ icon: Icon; title: string; body: string }> = [
  {
    icon: RulerIcon,
    title: 'Lengte',
    body: 'Lichaamslengte bepaalt de sticklengte.',
  },
  {
    icon: StepsIcon,
    title: 'Ervaring',
    body: 'Hoe ver de speler is met aannemen en passen.',
  },
  {
    icon: BallIcon,
    title: 'Speelwensen',
    body: 'Wat de speler wil leren of vaak doet.',
  },
  {
    icon: EuroIcon,
    title: 'Budget',
    body: 'Wat je voor alleen de stick wilt uitgeven.',
  },
];

const ROUTES: Array<{ route: AdviceRoute; optionValue: string }> = [
  { route: 'START', optionValue: 'first_stick' },
  { route: 'ONTWIKKEL', optionValue: 'next_stick' },
  { route: 'PRESTATIE', optionValue: 'advanced_compare' },
];

/** Steps 2 and 3; step 1 lists LOOKS_AT. */
const FLOW: Array<{ title: string; body: string }> = [
  {
    title: 'Wat niet past, valt af',
    body: 'Verkeerde maat, boven budget of te lastig voor het niveau. Wat overblijft wegen we op ervaring, doelen, bow-profiel en gevoel. Marge telt niet mee.',
  },
  {
    title: 'Maximaal drie sticks',
    body: 'Een beste match, een veilige keuze en soms een ambitieuze keuze, elk met de redenen, de afweging en de bron.',
  },
];

function StepNumber({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-veld text-base font-bold text-white"
    >
      {n}
    </span>
  );
}

const ADVICE_POINTS: Array<{ icon: Icon; title: string; body: string }> = [
  {
    icon: RulerIcon,
    title: 'Eerst de maat.',
    body: 'Een lengteadvies in inches, met een tweede maat als de speler op een grens zit.',
  },
  {
    icon: SourceIcon,
    title: 'Redenen met bron.',
    body: 'Elke reden verwijst naar de productpagina van het merk of naar onze methode.',
  },
  {
    icon: AlertIcon,
    title: 'Eerlijk over de afweging.',
    body: 'Een hulpmiddel, geen garantie; een stick even vasthouden blijft de moeite waard.',
  },
];

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold tracking-wide text-veld uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h2>
      {children && <div className="mt-3 text-lg text-inkt/80">{children}</div>}
    </div>
  );
}

function IconBadge({
  icon: BadgeIcon,
  tone = 'green',
}: {
  icon: Icon;
  tone?: 'green' | 'orange';
}) {
  const colors =
    tone === 'orange' ? 'bg-krijt text-veld' : 'bg-krijt text-veld';
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${colors}`}
    >
      <BadgeIcon size={24} />
    </span>
  );
}

/** Illustrative mock of a result card — deliberately no real product, price or spec. */
function ExampleAdvice() {
  return (
    <figure className="rounded-3xl border border-rand bg-white p-6 shadow-xl shadow-inkt/10">
      <figcaption className="text-xs font-semibold tracking-wide text-lijngrijs uppercase">
        Voorbeeld van een advies
      </figcaption>
      <div className="mt-4 flex items-center gap-3">
        <IconBadge icon={StickIcon} tone="orange" />
        <div>
          <p className="text-xs font-semibold tracking-wide text-veld uppercase">
            Beste match
          </p>
          <p className="font-bold">
            De stick die het best bij de antwoorden past
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold">Waarom deze stick past</p>
      <ul className="mt-2 space-y-2 text-sm">
        {[
          ['Beschikbaar in de geadviseerde maat.', 'Fabrikantgegevens'],
          ['Past bij de opgegeven ervaring.', 'Fabrikantgegevens'],
          [
            'Het bow-profiel sluit aan bij het speeldoel.',
            'Redactionele adviesregel',
          ],
        ].map(([reason, source]) => (
          <li key={reason} className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-veld text-white">
              <CheckIcon size={13} />
            </span>
            <span>
              {reason}
              <span className="block text-xs text-lijngrijs">{source}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm font-semibold">Let op vóór je koopt</p>
      <p className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        <AlertIcon size={16} className="mt-0.5 shrink-0" />
        De afweging die bij deze stick hoort, bijvoorbeeld minder slagkracht in
        ruil voor meer controle.
      </p>
    </figure>
  );
}

/**
 * One section instead of three (redesign fase 1, 2026-11-03): what the
 * stickwijzer asks, how it gets from answers to sticks, and the three routes
 * as one line. The routes are explained in full on /stickwijzer itself.
 */
export function StickwijzerExplainer({
  productCount,
}: {
  productCount: number;
}) {
  const routeLabels = ROUTES.map(({ optionValue }) =>
    QUESTIONS.route_self_select.input.kind === 'single'
      ? QUESTIONS.route_self_select.input.options.find(
          (option) => option.value === optionValue,
        )?.label
      : undefined,
  ).filter((label): label is string => label !== undefined);

  return (
    <>
      {/* A krijt band between the white blocks (designsysteem: white base, krijt as accent surface). */}
      <div className="border-b border-rand bg-krijt">
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading eyebrow="Zo werkt het" title="Van een paar antwoorden naar maximaal drie sticks">
            <p>
              De stickwijzer vergelijkt je antwoorden met alle {productCount}{' '}
              veldsticks in onze catalogus. In {routeStepRange()} weet je welke
              maat en welke sticks passen, en waarom.
            </p>
          </SectionHeading>

          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            <li>
              <StepNumber n={1} />
              <p className="mt-4 text-lg font-bold">Jij vertelt over de speler</p>
              <ul className="mt-3 space-y-2">
                {LOOKS_AT.map(({ icon: LookIcon, title, body }) => (
                  <li key={title} className="flex items-start gap-3 text-sm">
                    <LookIcon size={18} className="mt-0.5 shrink-0 text-veld" />
                    <span>
                      <span className="font-semibold">{title}</span>
                      <span className="text-lijngrijs"> · {body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </li>
            {FLOW.map(({ title, body }, index) => (
              <li key={title}>
                <StepNumber n={index + 2} />
                <p className="mt-4 text-lg font-bold">{title}</p>
                <p className="mt-3 text-inkt/80">{body}</p>
              </li>
            ))}
          </ol>

          <p className="mt-10 border-t border-rand pt-6 text-sm text-inkt/80">
            <span className="font-semibold text-inkt">Drie routes:</span>{' '}
            {routeLabels.join(' · ')}. Je kiest aan het begin wat bij de speler
            past en kunt onderweg wisselen.
          </p>
        </section>
      </div>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 rounded-3xl bg-white p-6 ring-1 ring-rand sm:p-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Het resultaat"
              title="Zo ziet een advies eruit"
            />
            <ul className="mt-6 space-y-5">
              {ADVICE_POINTS.map(({ icon, title, body }) => (
                <li key={title} className="flex items-start gap-4">
                  <IconBadge icon={icon} />
                  <p className="text-inkt/80">
                    <span className="block font-bold text-inkt">{title}</span>
                    {body}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink href="/stickwijzer">Start de stickwijzer</ButtonLink>
              <Link
                href="/methodiek"
                className="font-semibold text-veld hover:underline"
              >
                Hoe komt ons advies tot stand?
              </Link>
            </div>
          </div>
          <ExampleAdvice />
        </div>
      </section>
    </>
  );
}
