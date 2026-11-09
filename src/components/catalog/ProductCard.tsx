import { productPath } from '@/catalog/paths';
import Link from 'next/link';
import type { Product } from '@/catalog/types';
import { OfferSummary } from '@/components/offers/WhereToBuy';
import { ProductImage } from './ProductImage';
import { ProductProsAndCons } from './ProductProsAndCons';
import { ProductFacts } from './ProductFacts';
import { CompareToggle } from '@/components/compare/CompareToggle';
import type { RetailerPlacement } from '@/lib/retailers';
import { inch } from '@/content/offers';

/**
 * Fills the height of its grid cell, with the shop row pinned to the
 * bottom, so cards in one row line up regardless of text length.
 */
export function ProductCard({
  product,
  placement = 'catalogus',
  showLengths = false,
  compact = false,
}: {
  product: Product;
  /** Where the card sits, for the shop links (bol.com sub-ID and the other networks). */
  placement?: RetailerPlacement;
  /** The lengths it comes in (on /zaalsticks, where the finder filters on length; 2026-11-09). */
  showLengths?: boolean;
  /**
   * Shorter card for a long filtered list (/zaalsticks, 2026-11-09): a smaller
   * photo and no strengths and points of attention; those are on the stick page.
   */
  compact?: boolean;
}) {
  const lengths = product.lengthsInches.value;
  return (
    // Fase 7: the whole card opens the stick page (the name's link is stretched
    // over it); the shop row sits above that layer so it stays its own link.
    <article className="card card-link group relative flex h-full flex-col p-5">
      <div className={`flex items-center justify-center ${compact ? 'h-32' : 'h-48'}`}>
        <ProductImage
          product={product}
          className={`${compact ? 'h-28 w-28' : 'h-44 w-44'} transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
        />
      </div>
      <p className="mt-4 text-xs font-semibold tracking-[0.06em] text-veld uppercase">
        {product.brand}
      </p>
      <h3 className="mt-1 text-[1.0625rem] leading-snug font-bold text-inkt">
        <Link
          href={productPath(product)}
          className="after:absolute after:inset-0 after:rounded-[1.25rem]"
        >
          {product.name}
        </Link>
      </h3>
      <ProductFacts product={product} />
      {showLengths && lengths.length > 0 && (
        <p className="mt-2 text-sm text-inkt/80">
          <span className="font-semibold text-inkt">Maten:</span> {lengths.map(inch).join(', ')}
        </p>
      )}
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-lijngrijs">
        {product.summary}
      </p>
      {!compact && (
        <div className="mt-4 border-t border-rand/70 pt-4">
          <ProductProsAndCons product={product} limit={1} stacked compact />
        </div>
      )}
      <div className="relative z-10 mt-auto pt-5">
        <OfferSummary product={product} placement={placement} />
        <div className="mt-1 flex justify-center">
          <CompareToggle slug={product.slug} name={product.name} />
        </div>
      </div>
    </article>
  );
}
