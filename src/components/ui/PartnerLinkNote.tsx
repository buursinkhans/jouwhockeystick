import Link from 'next/link';
import { PARTNER_LINK_NOTE, PARTNER_LINK_URL } from '@/content/partnerLinks';

/** One-sentence partner-link disclosure, shown once per result or product page. */
export function PartnerLinkNote() {
  return (
    <p className="mt-2 text-sm text-lijngrijs">
      {PARTNER_LINK_NOTE}{' '}
      <Link href={PARTNER_LINK_URL} className="underline hover:text-veld">
        Meer uitleg
      </Link>
    </p>
  );
}
