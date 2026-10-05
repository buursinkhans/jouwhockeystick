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
  className?: string;
  variant?: keyof typeof buttonVariantClasses;
  children: ReactNode;
};

export function RetailerLink({
  retailer,
  brand,
  productName,
  placement,
  className = '',
  variant,
  children,
}: Props) {
  const url = RETAILERS[retailer].getUrl({
    productName,
    brand,
    placement,
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
        })
      }
    >
      {children}
    </a>
  );
}
