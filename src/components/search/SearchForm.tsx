import { MAX_QUERY_LENGTH } from '@/catalog/search';

/**
 * A plain GET form to /zoeken: works without JavaScript and needs no client
 * component. `id` keeps the label unique when two forms share a page.
 */
export function SearchForm({ id = 'zoek', defaultValue = '' }: { id?: string; defaultValue?: string }) {
  return (
    <form action="/zoeken" method="get" role="search" className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor={id} className="sr-only">
        Zoek op merk of model
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        maxLength={MAX_QUERY_LENGTH}
        placeholder="Merk of model, bijv. Dynabow 5"
        autoComplete="off"
        className="min-h-12 w-full min-w-0 flex-1 rounded-xl border border-rand bg-white px-4 text-base text-inkt placeholder:text-lijngrijs focus:border-veld focus:outline-2 focus:outline-offset-2 focus:outline-veld"
      />
      <button
        type="submit"
        className="min-h-12 rounded-xl bg-veld px-6 text-base font-semibold text-white hover:bg-veld/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-veld"
      >
        Zoeken
      </button>
    </form>
  );
}
