import Link from 'next/link';
import { BLACK_FRIDAY, BLACK_FRIDAY_EDITION } from '@/content/blackFriday';
import { TrackedBlock } from '@/components/catalog/TrackedBlock';
import { amsterdamDate, showCampaignNote } from '@/lib/campaign';

/**
 * One quiet line to /black-friday-hockey on the catalog pages, only from
 * `announceFrom` to the last campaign day (decision log 2026-11-10). No banner.
 */
export function CampaignNote({ page, now = new Date() }: { page: 'sticks' | 'zaalsticks' | 'hockeyschoenen'; now?: Date }) {
  if (!showCampaignNote(BLACK_FRIDAY_EDITION, amsterdamDate(now))) return null;
  return (
    <TrackedBlock page={page} block="seizoen">
      <p className="mt-4 text-sm text-inkt/80">
        {BLACK_FRIDAY.campaignNote}{' '}
        <Link href={BLACK_FRIDAY.path} className="font-semibold text-veld underline underline-offset-2 hover:text-inkt">
          {BLACK_FRIDAY.navLabel} {BLACK_FRIDAY_EDITION.year}
        </Link>
      </p>
    </TrackedBlock>
  );
}
