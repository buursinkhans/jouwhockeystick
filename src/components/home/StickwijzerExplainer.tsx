import type { ComponentType, ReactNode, SVGProps } from 'react';
import Link from 'next/link';
import type { AdviceRoute } from '@/advice-engine/answers';
import { QUESTIONS, SCREENS } from '@/content/stickwijzer/questions';
import { ButtonLink } from '@/components/ui/Button';
import {
  AlertIcon,
  BallIcon,
  CheckIcon,
  EuroIcon,
  FilterIcon,
  QuestionIcon,
  RulerIcon,
  ScaleIcon,
  SourceIcon,
  SproutIcon,
  StepsIcon,
  StickIcon,
  TargetIcon,
  ThreeSticksIcon,
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

const ROUTES: Array<{ route: AdviceRoute; optionValue: string; icon: Icon }> = [
  { route: 'START', optionValue: 'first_stick', icon: SproutIcon },
  { route: 'ONTWIKKEL', optionValue: 'next_stick', icon: StepsIcon },
  { route: 'PRESTATIE', optionValue: 'advanced_compare', icon: TargetIcon },
];

const FLOW: Array<{ icon: Icon; title: string; body: string }> = [
  {
    icon: QuestionIcon,
    title: 'Jij beantwoordt de vragen',
    body: 'Bij elke vraag staat waarom we die stellen.',
  },
  {
    icon: FilterIcon,
    title: 'Wat niet past, valt af',
    body: 'Verkeerde maat, boven budget of te lastig voor het niveau.',
  },
  {
    icon: ScaleIcon,
    title: 'We wegen wat overblijft',
    body: 'Op maat, ervaring, doelen, bow-profiel en gevoel. Marge telt niet mee.',
  },
  {
    icon: ThreeSticksIcon,
    title: 'Maximaal drie sticks',
    body: 'Beste match, veilige keuze en soms een ambitieuze keuze.',
  },
];

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

export function StickwijzerExplainer({
  productCount,
}: {
  productCount: number;
}) {
  const routeOptions =
    QUESTIONS.route_self_select.input.kind === 'single'
      ? QUESTIONS.route_self_select.input.options
      : [];

  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Wat doet de stickwijzer?"
          title="Een advies dat je kunt navolgen"
        >
          <p>
            De stickwijzer vergelijkt je antwoorden met de {productCount} sticks
            in onze catalogus. Sticks die niet passen vallen af; van wat
            overblijft zie je er maximaal drie, elk met de redenen, de afweging
            en de bron van elk gegeven.
          </p>
        </SectionHeading>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOOKS_AT.map(({ icon, title, body }) => (
            <li
              key={title}
              className="flex items-start gap-4 rounded-2xl border border-rand bg-white p-5 lg:flex-col"
            >
              <IconBadge icon={icon} />
              <div>
                <p className="font-bold">{title}</p>
                <p className="mt-1 text-sm text-lijngrijs">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-hex-light border-y border-rand bg-krijt">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Drie routes"
            title="Een eerste stick vraagt iets anders"
          >
            <p>
              Aan het begin kies je de route die bij de speler past. Je kunt
              onderweg nog wisselen.
            </p>
          </SectionHeading>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {ROUTES.map(({ route, optionValue, icon }) => {
              const option = routeOptions.find(
                (candidate) => candidate.value === optionValue,
              );
              if (!option) {
                return null;
              }
              return (
                <li
                  key={route}
                  className="flex h-full flex-col rounded-3xl border border-rand bg-white p-6 shadow-sm"
                >
                  <IconBadge icon={icon} tone="orange" />
                  <p className="mt-4 text-lg font-bold">{option.label}</p>
                  {option.details?.slice(0, 2).map((detail) => (
                    <p key={detail.term} className="mt-3 text-sm text-inkt/80">
                      <span className="block text-xs font-semibold tracking-wide text-lijngrijs uppercase">
                        {detail.term}
                      </span>
                      {detail.text}
                    </p>
                  ))}
                  <p className="mt-auto pt-5 text-sm font-semibold text-veld">
                    {SCREENS[route].length} stappen
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Zo werkt het"
          title="Van antwoorden naar advies"
        />
        <ol className="relative mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* Connecting line behind the step badges on wide screens. */}
          <span
            aria-hidden="true"
            className="absolute top-6 right-[12.5%] left-[12.5%] hidden h-0.5 bg-rand lg:block"
          />
          {FLOW.map(({ icon: FlowIcon, title, body }, index) => (
            <li
              key={title}
              className="relative flex flex-col items-center text-center"
            >
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-veld text-white ring-8 ring-krijt">
                <FlowIcon size={22} />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-inkt text-xs font-bold text-white">
                  {index + 1}
                </span>
              </span>
              <p className="mt-4 font-bold">{title}</p>
              <p className="mt-1 max-w-56 text-sm text-lijngrijs">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
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
