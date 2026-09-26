'use client';

import type { ReactNode } from 'react';
import { getBolComSearchUrl } from '@/lib/bolcom';
import { trackEvent } from '@/lib/analytics/track';
import { buttonBaseClasses, buttonVariantClasses } from './Button';

type Props = {
  brand: string;
  productName: string;
  className?: string;
  variant?: keyof typeof buttonVariantClasses;
  children: ReactNode;
};

export function BolComLink({ brand, productName, className = '', variant, children }: Props) {
  const variantClass = variant ? `${buttonBaseClasses} ${buttonVariantClasses[variant]}` : '';

  return (
    <a
      href={getBolComSearchUrl(productName)}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`${variantClass} ${className}`.trim()}
      onClick={() => trackEvent({ name: 'bolcom_click', brand, productName })}
    >
      {children}
    </a>
  );
}
