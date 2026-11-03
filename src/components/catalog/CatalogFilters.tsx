import Link from 'next/link';
import { BOW_LABELS, EXPERIENCE_LABELS } from '@/catalog/labels';
import { BUDGET_STEPS, hasFilters, type CatalogFilters as Filters } from '@/catalog/filters';
import type { BowProfile, Brand, ExperienceLevel } from '@/catalog/types';
import { buttonBaseClasses, buttonVariantClasses } from '@/components/ui/Button';

const inch = (n: number) => `${String(n).replace('.', ',')}"`;

/**
 * Filter form above the catalog (redesign fase 2): a plain GET form, so it
 * works without JavaScript and every filtered list is a normal page with its
 * own URL. Only values that occur in the list are offered.
 */
export function CatalogFilters({
  action,
  filters,
  brands,
  bows,
  lengths,
}: {
  action: string;
  filters: Filters;
  brands: readonly Brand[];
  bows: readonly BowProfile[];
  lengths: readonly number[];
}) {
  const field = 'block w-full min-h-11 rounded-xl border border-rand bg-white px-3 text-sm text-inkt';
  const label = 'block text-xs font-semibold tracking-wide text-lijngrijs uppercase';
  return (
    <form
      method="get"
      action={`${action}#alle-veldsticks`}
      role="search"
      aria-label="Sticks filteren"
      className="rounded-2xl border border-rand bg-white p-4 sm:p-5"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <label htmlFor="filter-niveau" className={label}>
            Niveau
          </label>
          <select id="filter-niveau" name="niveau" defaultValue={filters.niveau ?? ''} className={`mt-1 ${field}`}>
            <option value="">Alle niveaus</option>
            {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((level) => (
              <option key={level} value={level}>
                {EXPERIENCE_LABELS[level]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-lengte" className={label}>
            Lengte
          </label>
          <select id="filter-lengte" name="lengte" defaultValue={filters.lengte?.toString() ?? ''} className={`mt-1 ${field}`}>
            <option value="">Alle lengtes</option>
            {lengths.map((length) => (
              <option key={length} value={length}>
                {inch(length)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-budget" className={label}>
            Budget
          </label>
          <select id="filter-budget" name="budget" defaultValue={filters.budget?.toString() ?? ''} className={`mt-1 ${field}`}>
            <option value="">Elk budget</option>
            {BUDGET_STEPS.map((step) => (
              <option key={step} value={step}>
                Tot €{step}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-bow" className={label}>
            Kromming
          </label>
          <select id="filter-bow" name="bow" defaultValue={filters.bow ?? ''} className={`mt-1 ${field}`}>
            <option value="">Elke kromming</option>
            {bows.map((bow) => (
              <option key={bow} value={bow}>
                {BOW_LABELS[bow]}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="filter-merk" className={label}>
            Merk
          </label>
          <select id="filter-merk" name="brand" defaultValue={filters.brand ?? ''} className={`mt-1 ${field}`}>
            <option value="">Alle merken</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button type="submit" className={`${buttonBaseClasses} ${buttonVariantClasses.primary} min-h-11`}>
          Toon sticks
        </button>
        {hasFilters(filters) && (
          <Link href={action} className="text-sm font-semibold text-veld hover:underline">
            Wis filters
          </Link>
        )}
        <p className="text-xs text-lijngrijs">
          Budget telt de laagste actuele winkelprijs incl. verzending, of de richtprijs als er geen actuele prijs is.
        </p>
      </div>
    </form>
  );
}
