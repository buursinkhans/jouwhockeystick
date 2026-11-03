import type { TrustFacts } from '@/catalog/trustFacts';

const DUTCH_DATE = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', timeZone: 'UTC' });

/** Four counted facts in a row (two on a phone); every number comes from getTrustFacts. */
export function ProofFacts({ facts }: { facts: TrustFacts }) {
  const items = [
    { value: String(facts.fieldSticks), label: 'veldsticks vergeleken' },
    // The hero counts field brands only ("540 veldsticks van 20 merken"); say which count this is.
    { value: String(facts.brands), label: 'merken, veld en zaal' },
    { value: String(facts.shops), label: 'partnerwinkels naast elkaar' },
    facts.pricesReadOn
      ? { value: DUTCH_DATE.format(new Date(`${facts.pricesReadOn}T00:00:00Z`)), label: 'prijzen wekelijks bijgewerkt, laatst op' }
      : { value: String(facts.checkedSticks), label: 'sticks met de hand nagelopen' },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rand bg-rand sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col-reverse bg-white px-4 py-4 sm:px-5">
          <dt className="mt-1 text-sm text-lijngrijs">{item.label}</dt>
          <dd className="font-heading text-2xl font-extrabold text-inkt tabular-nums sm:text-3xl">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
