'use client';

import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import { trackEvent } from '@/lib/analytics/track';

/** A link inside a homepage block that reports which block and target were used. */
export function HomeBlockLink({
  block,
  href,
  ...props
}: { block: 'season' | 'buying'; href: string } & Omit<
  ComponentPropsWithoutRef<typeof Link>,
  'href'
>) {
  return (
    <Link
      href={href}
      onClick={() =>
        trackEvent({ name: 'home_block_click', block, target: href })
      }
      {...props}
    />
  );
}
