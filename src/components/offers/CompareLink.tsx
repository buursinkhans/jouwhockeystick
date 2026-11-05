'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics/track';
import { buttonBaseClasses, buttonVariantClasses } from '@/components/ui/Button';

/** The primary action on a product card: open the price comparison on the product page. */
export function CompareLink({
  href,
  placement,
  offerCount,
  children,
}: {
  href: string;
  placement: string;
  offerCount: number;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent({ name: 'offer_compare_click', placement, offerCount })}
      className={`${buttonBaseClasses} ${buttonVariantClasses.primary} w-full`}
    >
      {children}
    </Link>
  );
}
