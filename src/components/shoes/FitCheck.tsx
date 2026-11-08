import { HOCKEYSCHOENEN } from '@/content/hockeyschoenen';

/** "Pascontrole" (keuzemodel §10): a checklist, no millimetre rule. */
export function FitCheck({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const { fitCheck } = HOCKEYSCHOENEN;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section aria-labelledby="pascontrole-kop" className="mt-10">
      <Heading id="pascontrole-kop" className={headingLevel === 2 ? 'text-2xl font-bold' : 'text-xl font-bold'}>
        {fitCheck.heading}
      </Heading>
      <p className="mt-2 text-inkt/80">{fitCheck.intro}</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-inkt/80">
        {fitCheck.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-inkt/80">{fitCheck.outro}</p>
    </section>
  );
}
