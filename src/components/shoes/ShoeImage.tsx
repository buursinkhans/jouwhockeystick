import { shoeImageUrl } from '@/catalog/shoes/offers';
import type { Shoe } from '@/catalog/shoes/types';

/**
 * The shop's product photo from its feed, like imported sticks
 * (ProductImage). A plain <img>: the shop CDN is not ours to configure in
 * next.config. Without a photo a neutral box, never a brand logo.
 */
export function ShoeImage({ shoe, className = '' }: { shoe: Shoe; className?: string }) {
  const src = shoeImageUrl(shoe);
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={`${shoe.brand} ${shoe.model}`} loading="lazy" className={`rounded-xl object-contain ${className}`} />
    );
  }
  return (
    <div className={`flex items-center justify-center rounded-xl text-xs text-lijngrijs ${className}`} role="img" aria-label={`Geen foto van ${shoe.brand} ${shoe.model}`}>
      Geen foto
    </div>
  );
}
