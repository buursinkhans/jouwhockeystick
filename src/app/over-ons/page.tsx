import Image from 'next/image';
import Link from 'next/link';
import { pageMetadata } from '@/lib/site';
import { PageBody, PageHeader } from '@/components/ui/PageHeader';
import portret from '@/assets/over-ons/hans-buursink.jpg';

export const metadata = pageMetadata({
  title: 'Over ons',
  description:
    'Waarom we jouwhockeystick.nl zijn begonnen en wie we willen zijn: een heldere, eerlijke gids bij het kiezen van een hockeystick.',
  path: '/over-ons',
});

export default function OverOnsPage() {
  return (
    <>
      <PageHeader eyebrow="Over ons" title="Over jouwhockeystick.nl">
        <p className="lead">
          jouwhockeystick.nl helpt hockeyers en ouders een stick te kiezen die
          past bij niveau, speelstijl en budget, en legt bij elk advies uit
          waarom. We zijn deze site begonnen omdat die keuze vaak alleen op
          gevoel of prijs wordt gemaakt. Met vragen over lengte, ervaring,
          spelacties en budget kom je al een stuk verder.
        </p>
      </PageHeader>

      <PageBody>
        {/*
          The person behind the site (redesign fase 3): photo, name and
          background as the owner gave them on 2026-11-03; metadata stripped.
        */}
        <figure className="card flex items-center gap-5 p-4 sm:gap-6 sm:p-5">
          <Image
            src={portret}
            alt="Portret van Hans Buursink"
            width={720}
            height={960}
            sizes="(min-width: 640px) 128px, 96px"
            className="h-28 w-24 shrink-0 rounded-xl object-cover sm:h-40 sm:w-32"
          />
          <figcaption>
            <span className="block text-xs font-semibold tracking-wide text-lijngrijs uppercase">
              Wie zit erachter?
            </span>
            <span className="mt-1 block text-xl font-bold text-inkt">Hans Buursink</span>
            <span className="block text-inkt/80">Hockeyvader</span>
          </figcaption>
        </figure>

        <h2 className="mt-10 text-2xl font-bold">Waarom we zijn begonnen</h2>
        <p className="mt-3 leading-relaxed text-inkt/80">
          Wie voor het eerst een hockeystick koopt, of er een zoekt voor zijn
          kind, loopt al snel vast in vaktermen als bow-profiel en
          carbonpercentage. Winkels en merken hebben die kennis wel, maar
          hebben niet altijd tijd om het per klant uit te leggen. Op deze site
          staat die uitleg voorop, zodat je een keuze maakt die je zelf
          begrijpt.
        </p>

        <h2 className="mt-10 text-2xl font-bold">Wat je van ons kunt verwachten</h2>
        <p className="mt-3 leading-relaxed text-inkt/80">
          We leggen vaktermen uit in gewone taal. We testen sticks niet zelf:
          ons advies is gebaseerd op gegevens van de merken en informatie van
          hockeywinkels, en bij elke reden in het advies staat waar die vandaan
          komt. Je antwoorden over lengte, ervaring, spelacties en budget
          bepalen welke sticks je ziet; we beloven nergens dat een stick je
          beter laat spelen.
        </p>

        <h2 className="mt-10 text-2xl font-bold">Hoe we werken</h2>
        <p className="mt-3 leading-relaxed text-inkt/80">
          De stickwijzer op deze site geeft je een advies op basis van je
          antwoorden, met zichtbare redenen. Je koopt bij een van onze
          partnerwinkels: bol.com, PassaHockey, Plutosport, HockeyCity of Daka.
          Wij verkopen zelf niets. We zorgen dat je met duidelijke redenen bij
          een passende stick uitkomt.
        </p>

        <h2 className="mt-10 text-2xl font-bold">Zo verdienen we geld</h2>
        <p className="mt-3 leading-relaxed text-inkt/80">
          Koop je via een winkelknop op deze site, dan krijgen wij van die winkel
          een vergoeding. Die vergoeding telt niet mee in het advies, en in
          &ldquo;Waar te koop&rdquo; staan de winkels op volgorde van prijs
          inclusief verzending, nooit op vergoeding.{' '}
          <Link href="/methodiek" className="font-semibold text-veld hover:underline">
            Zo werkt ons advies
          </Link>
          .
        </p>

        <h2 className="mt-10 text-2xl font-bold">Contact</h2>
        <p className="mt-3 leading-relaxed text-inkt/80">
          Vragen, opmerkingen of feedback? Mail ons via{' '}
          <a
            href="mailto:info@jouwhockeystick.nl"
            className="font-semibold text-veld hover:underline"
          >
            info@jouwhockeystick.nl
          </a>
          .
        </p>
      </PageBody>
    </>
  );
}
