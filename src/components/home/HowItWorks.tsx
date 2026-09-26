const STEPS = [
  {
    title: '1. Beantwoord de stickwijzer',
    body: 'Vertel iets over je lengte, ervaring, positie en budget.',
  },
  {
    title: '2. Ontvang een uitlegbaar advies',
    body: 'Je krijgt een aanbeveling met zichtbare redenen, en indien nodig een alternatief.',
  },
  {
    title: '3. Bekijk op bol.com',
    body: 'De daadwerkelijke aankoop verloopt via bol.com, niet via deze site.',
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h2 className="text-2xl font-bold">Hoe werkt het?</h2>
      <ol className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.title} className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="font-semibold">{step.title}</p>
            <p className="mt-2 text-sm text-zinc-600">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
