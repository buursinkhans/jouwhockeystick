import type { Product } from '@/catalog/types';
import { StickIllustration } from './StickIllustration';

/**
 * Shows the real product photo hotlinked from the brand's own official
 * product page when we have one (imageUrl), otherwise falls back to the
 * abstract illustration. A plain <img> is used deliberately instead of
 * next/image — these come from several external, uncontrolled hostnames
 * we don't want to hard-configure into next.config's remote patterns, and
 * we have no guarantee the brand keeps the file at that exact URL forever.
 */
export function ProductImage({
  product,
  className = '',
}: {
  product: Product;
  className?: string;
}) {
  if (product.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.imageUrl}
        alt={product.imageAlt}
        loading="lazy"
        className={`rounded-xl object-contain ${className}`}
      />
    );
  }

  return (
    <StickIllustration
      brand={product.brand}
      bowProfile={product.bowProfile?.value}
      alt={product.imageAlt}
      className={className}
    />
  );
}
