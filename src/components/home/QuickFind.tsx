import { SearchForm } from '@/components/search/SearchForm';
import { HomeBlockLink } from './HomeBlockLink';

const SHORTCUTS = [
  { label: 'Veldsticks', href: '/sticks' },
  { label: 'Zaalsticks', href: '/zaalsticks' },
  { label: 'Hockeyschoenen', href: '/hockeyschoenen' },
] as const;

/**
 * For visitors who already know what they want (homepage proposal,
 * 2026-11-04): search on brand or model, or start from a category. It follows
 * the hero without a dividing line; the counted facts stay in ProofStrip below.
 */
export function QuickFind() {
  return (
    <section aria-labelledby="quickfind-title" className="bg-white">
      <div className="mx-auto max-w-5xl px-4 pt-6 pb-2 sm:px-6 sm:pt-8 sm:pb-4">
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
                <HomeBlockLink
                  block="zoeken"
                  href={shortcut.href}
                  className="inline-flex min-h-11 items-center rounded-full border border-rand bg-krijt px-4 text-sm font-semibold text-inkt hover:border-veld hover:text-veld"
                >
                  {shortcut.label}
                </HomeBlockLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
