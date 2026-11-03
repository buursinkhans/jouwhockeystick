import Image from 'next/image';
import Link from 'next/link';
import { pageMetadata } from '@/lib/site';
import portret from '@/assets/over-ons/hans-buursink.jpg';

export const metadata = pageMetadata({
  title: 'Over ons',
  description:
    'Waarom we jouwhockeystick.nl zijn begonnen en wie we willen zijn: een heldere, eerlijke gids bij het kiezen van een hockeystick.',
  path: '/over-ons',
});

export default function OverOnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">Over jouwhockeystick.nl</h1>
      <p className="mt-4 text-lg leading-relaxed text-inkt">
        jouwhockeystick.nl helpt hockeyers en ouders een stick te kiezen die
        past bij niveau, speelstijl en budget — met heldere uitleg in plaats van
        een overweldigende lijst modellen. We zijn deze site begonnen omdat die
        keuze in de praktijk vaak op gevoel of prijs alleen wordt gemaakt,
        terwijl een paar gerichte vragen al een groot verschil kunnen maken.
      </p>

      {/*
        The person behind the site (redesign fase 3): photo, name and
        background as the owner gave them on 2026-11-03; metadata stripped.
      */}
      <figure className="mt-8 flex items-center gap-5 rounded-2xl border border-rand bg-krijt p-4 sm:gap-6 sm:p-5">
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
        Wie voor het eerst een hockeystick koopt — of een stick voor zijn kind
        zoekt — loopt al snel vast in vaktermen als bow-profiel en
        carbonpercentage. Winkels en merken hebben vaak wel de kennis, maar niet
        altijd de tijd om die per klant uit te leggen. Wij wilden een plek maken
        waar die uitleg wél voorop staat, zodat je een keuze maakt die je zelf
        begrijpt.
      </p>

      <h2 className="mt-10 text-2xl font-bold">Wie we willen zijn</h2>
      <ul className="mt-3 space-y-2 leading-relaxed text-inkt/80">
        <li>
          <strong>Helder</strong> — we leggen uit in gewone taal, niet in
          marketingtermen.
        </li>
        <li>
          <strong>Eerlijk</strong> — we doen geen loze beloftes over prestaties,
          en zijn open over waar onze informatie vandaan komt.
        </li>
        <li>
          <strong>Persoonlijk</strong> — advies dat rekening houdt met jouw
          situatie, niet één lijstje &ldquo;bestsellers&rdquo; voor iedereen.
        </li>
        <li>
          <strong>Deskundig en verifieerbaar</strong> — elk advies is gebaseerd
          op zichtbare, navolgbare redenen, nooit op schijnzekerheid.
        </li>
      </ul>

      <h2 className="mt-10 text-2xl font-bold">Hoe we werken</h2>
      <p className="mt-3 leading-relaxed text-inkt/80">
        De stickwijzer op deze site geeft je een persoonlijk advies met
        zichtbare redenen. Je koopt bij een van onze partnerwinkels: bol.com,
        PassaHockey, Plutosport of HockeyCity. Wij verkopen zelf niets, maar
        zorgen dat je met een duidelijk advies bij de juiste stick uitkomt.
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
    </div>
  );
}
