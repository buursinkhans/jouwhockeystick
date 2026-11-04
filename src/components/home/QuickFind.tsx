import Link from 'next/link';
import { getTrustFacts } from '@/catalog/trustFacts';
import { SearchForm } from '@/components/search/SearchForm';
import { ProofFacts } from '@/components/trust/ProofFacts';

const SHORTCUTS = [
  { label: 'Veldsticks', href: '/sticks' },
  { label: 'Zaalsticks', href: '/zaalsticks' },
  { label: 'Hockeyschoenen', href: '/hockeyschoenen' },
] as const;

/**
 * For visitors who already know what they want (homepage proposal,
 * 2026-11-04): search on brand or model, or start from a category. The tiles
 * under it are the counted facts of ProofStrip, which this block replaces;
 * no slogans such as "snel" or "slim" that nothing backs.
 */
export function QuickFind() {
  return (
    <section aria-labelledby="quickfind-title" className="border-b border-rand bg-white">
      <div className="mx-auto max-w-5xl px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-12">
        <div className="card p-5 sm:p-8">
          <h2 id="quickfind-title" className="text-2xl text-inkt sm:text-3xl">
            Weet je al welk model?
          </h2>
          <p className="mt-2 text-inkt/80">Zoek op merk of model, of begin bij een soort.</p>
          <div className="mt-5">
            <SearchForm id="quickfind-q" />
          </div>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Of begin bij een soort">
            {SHORTCUTS.map((shortcut) => (
              <li key={shortcut.href}>
                <Link
                  href={shortcut.href}
                  className="inline-flex min-h-11 items-center rounded-full border border-rand bg-krijt px-4 text-sm font-semibold text-inkt hover:border-veld hover:text-veld"
                >
                  {shortcut.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 border-t border-rand pt-6">
            <ProofFacts facts={getTrustFacts()} />
          </div>
        </div>
      </div>
    </section>
  );
}
