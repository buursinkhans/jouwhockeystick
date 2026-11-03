import { getTrustFacts } from '@/catalog/trustFacts';
import { ProofFacts } from '@/components/trust/ProofFacts';

/**
 * The counted facts straight under the hero (redesign fase 6): the size of
 * the dataset is visible before the visitor is asked to do anything.
 */
export function ProofStrip() {
  return (
    <section aria-label="De catalogus in cijfers" className="border-b border-rand bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <ProofFacts facts={getTrustFacts()} />
      </div>
    </section>
  );
}
