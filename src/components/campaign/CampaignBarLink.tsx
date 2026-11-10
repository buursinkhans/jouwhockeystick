'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics/track';

/** The campaign link in the thin bar above the header, counted as campaign_link_click. */
export function CampaignBarLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={className} onClick={() => trackEvent({ name: 'campaign_link_click', source: 'bovenbalk', target: href })}>
      {children}
    </Link>
  );
}
