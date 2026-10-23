import type { ReactNode } from 'react';
import type { Brand } from '@/catalog/types';
import {
  RETAILERS,
  type RetailerId,
  type RetailerPlacement,
} from '@/lib/retailers';
import { buttonBaseClasses, buttonVariantClasses } from './Button';

type Props = {
  retailer: RetailerId;
  brand: Brand;
  productName: string;
  placement: RetailerPlacement;
  /** Direct product page; without it the link goes to a search. */
  productUrl?: string;
  className?: string;
  variant?: keyof typeof buttonVariantClasses;
  children: ReactNode;
};

/**
 * A shop button. Plain server-rendered HTML since 2026-10-23: the click is
 * reported by RetailerClickTracker (one listener for the whole site) from the
 * data attributes, so the hundreds of buttons on /sticks and /zaalsticks no
 * longer each start up in the browser. The retailer_click event is unchanged.
 */
export function RetailerLink({
  retailer,
  brand,
  productName,
  placement,
  productUrl,
  className = '',
  variant,
  children,
}: Props) {
  const url = RETAILERS[retailer].getUrl({
    productName,
    brand,
    placement,
    productUrl,
  });

  if (!url) {
    return null;
  }

  const variantClass = variant
    ? `${buttonBaseClasses} ${buttonVariantClasses[variant]}`
    : '';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`${variantClass} ${className}`.trim()}
      data-retailer={retailer}
      data-brand={brand}
      data-product-name={productName}
      data-placement={placement}
      data-link-type={productUrl ? 'product' : 'search'}
    >
      {children}
    </a>
  );
}
