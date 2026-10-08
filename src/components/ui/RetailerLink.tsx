'use client';

import type { ReactNode } from 'react';
import type { Brand } from '@/catalog/types';
import {
  RETAILERS,
  type RetailerId,
  type RetailerPlacement,
} from '@/lib/retailers';
import { trackEvent } from '@/lib/analytics/track';
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
      onClick={() =>
        trackEvent({
          name: 'retailer_click',
          retailer,
          brand,
          productName,
          placement,
          linkType: productUrl ? 'product' : 'search',
        })
      }
    >
      {children}
    </a>
  );
}
