import type { ComponentType, ReactNode, SVGProps } from 'react';
import Link from 'next/link';
import type { AdviceRoute } from '@/advice-engine/answers';
import { QUESTIONS, SCREENS } from '@/content/stickwijzer/questions';
import { ButtonLink } from '@/components/ui/Button';
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  FilterIcon,
  RulerIcon,
  ScaleIcon,
  SproutIcon,
  StepsIcon,
  TargetIcon,
  UserIcon,
} from '@/components/ui/icons';

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const ROUTES: Array<{ route: AdviceRoute; optionValue: string; icon: Icon }> = [
  { route: 'START', optionValue: 'first_stick', icon: SproutIcon },
  { route: 'ONTWIKKEL', optionValue: 'next_stick', icon: StepsIcon },
  { route: 'PRESTATIE', optionValue: 'advanced_compare', icon: TargetIcon },
];

const FLOW: Array<{ icon: Icon; title: string; body: string }> = [
  {
    icon: UserIcon,
    title: 'Jij beantwoordt de vragen',
    body: 'Over lengte, ervaring, wat de speler wil leren en het budget. Bij elke vraag staat waarom we die stellen.',
  },
  {
    icon: FilterIcon,
    title: 'Wat niet past, valt af',
    body: 'Sticks in de verkeerde maat, boven het budget of te lastig voor het niveau adviseren we niet.',
  },
  {
    icon: ScaleIcon,
    title: 'We wegen wat overblijft',
    body: 'Op maat, ervaring, speeldoelen, bow-profiel en stickgevoel. Marge of sponsoring telt niet mee.',
  },
  {
    icon: CheckIcon,
    title: 'Je krijgt maximaal drie sticks',
    body: 'Een beste match, een veilige keuze en soms een ambitieuze keuze. Kopen doe je bij de winkel, niet bij ons.',
  },
];

function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
      {children}
    </span>
  );
}

/** Illustrative mock of a result card — deliberately no real product, price or spec. */
function ExampleAdvice() {
  return (
    <figure className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <figcaption className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Voorbeeld van een advies
      </figcaption>
      <div className="mt-3 flex items-center gap-3">
        <svg
          viewBox="0 0 48 48"
          width={48}
          height={48}
          aria-hidden="true"
          className="shrink-0 text-emerald-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
        >
          <path d="M34 5 18 36c-2 4-8 5-10 1s2-7 6-5" />
        </svg>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Beste match
          </p>
          <p className="font-bold">
            De stick die het best bij de antwoorden past
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold">Waarom deze stick past</p>
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
            <CheckIcon size={16} className="mt-0.5 shrink-0 text-emerald-700" />
            <span>
              {reason}
              <span className="block text-xs text-zinc-500">{source}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm font-semibold">Let op vóór je koopt</p>
      <p className="mt-2 flex items-start gap-2 text-sm text-amber-900">
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
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h2 className="text-2xl font-bold">Wat doet de stickwijzer?</h2>
      <p className="mt-3 text-zinc-700">
        De stickwijzer stelt een paar vragen over lengte, ervaring, speelwensen
        en budget en vergelijkt de antwoorden met de {productCount} sticks in
        onze catalogus. Sticks in de verkeerde maat, boven het budget of te
        lastig voor het niveau vallen af. Van wat overblijft zie je maximaal
        drie sticks, elk met de redenen, de afweging en de bron van elk gegeven.
        Zo weet je niet alleen wát we adviseren, maar ook waarom.
      </p>

      <h3 className="mt-10 text-xl font-bold">
        Drie routes, afhankelijk van waar de speler staat
      </h3>
      <p className="mt-2 text-zinc-700">
        Een eerste stick vraagt om andere vragen dan een stick voor een
        gevorderde speler. Daarom kies je aan het begin een route; je kunt
        onderweg nog wisselen.
      </p>
      <ul className="mt-5 grid gap-4 md:grid-cols-3">
        {ROUTES.map(({ route, optionValue, icon: RouteIcon }) => {
          const option = routeOptions.find(
            (candidate) => candidate.value === optionValue,
          );
          if (!option) {
            return null;
          }
          return (
            <li
              key={route}
              className="rounded-2xl border border-zinc-200 bg-white p-5"
            >
              <IconBadge>
                <RouteIcon size={22} />
              </IconBadge>
              <p className="mt-3 font-semibold">{option.label}</p>
              {option.details?.slice(0, 2).map((detail) => (
                <p key={detail.term} className="mt-2 text-sm text-zinc-700">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {detail.term}
                  </span>
                  {detail.text}
                </p>
              ))}
              <p className="mt-3 text-sm font-medium text-emerald-800">
                {SCREENS[route].length} stappen
              </p>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-12 text-xl font-bold">Van antwoorden naar advies</h3>
      <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FLOW.map(({ icon: FlowIcon, title, body }, index) => (
          <li
            key={title}
            className="relative rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <IconBadge>
                <FlowIcon size={22} />
              </IconBadge>
              {index < FLOW.length - 1 && (
                <ArrowRightIcon
                  size={20}
                  className="hidden text-zinc-400 lg:block"
                />
              )}
            </div>
            <p className="mt-3 font-semibold">
              {index + 1}. {title}
            </p>
            <p className="mt-2 text-sm text-zinc-700">{body}</p>
          </li>
        ))}
      </ol>

      <h3 className="mt-12 text-xl font-bold">Zo ziet een advies eruit</h3>
      <div className="mt-5 grid items-start gap-8 lg:grid-cols-2">
        <div className="space-y-4 text-zinc-700">
          <p>
            Bij elke stick staan minstens drie redenen waarom hij past, met
            erbij of het een gegeven van de fabrikant is of onze eigen
            adviesregel. Je ziet ook waar je op inlevert en voor wie de stick
            minder geschikt is.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <RulerIcon
                size={20}
                className="mt-0.5 shrink-0 text-emerald-800"
              />
              <span>
                <span className="font-semibold text-zinc-900">
                  Eerst de maat.
                </span>{' '}
                Je krijgt een lengteadvies in inches, met een tweede maat als de
                speler op een grens zit.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckIcon
                size={20}
                className="mt-0.5 shrink-0 text-emerald-800"
              />
              <span>
                <span className="font-semibold text-zinc-900">
                  Redenen met bron.
                </span>{' '}
                Elke reden verwijst naar de productpagina van het merk of naar
                onze methode.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <AlertIcon
                size={20}
                className="mt-0.5 shrink-0 text-emerald-800"
              />
              <span>
                <span className="font-semibold text-zinc-900">
                  Eerlijk over de afweging.
                </span>{' '}
                Het advies is een hulpmiddel, geen garantie; een stick even
                vasthouden blijft de moeite waard.
              </span>
            </li>
          </ul>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <ButtonLink href="/stickwijzer">Start de stickwijzer</ButtonLink>
            <Link
              href="/methodiek"
              className="font-semibold text-emerald-800 hover:underline"
            >
              Hoe komt ons advies tot stand?
            </Link>
          </div>
        </div>
        <ExampleAdvice />
      </div>
    </section>
  );
}
