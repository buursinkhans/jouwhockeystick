import { pageMetadata } from '@/lib/site';

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
        zichtbare redenen. De daadwerkelijke aankoop verloopt via bol.com — wij
        verkopen zelf niet, maar zorgen dat je met een duidelijk advies bij de
        juiste stick uitkomt.
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
