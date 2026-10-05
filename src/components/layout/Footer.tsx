import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/site';

const FOOTER_LINKS = [
  { href: '/over-ons', label: 'Over ons' },
  { href: '/methodiek', label: 'Zo werkt ons advies' },
  { href: '/privacy', label: 'Privacy' },
];

export function Footer() {
  return (
    <footer className="bg-hex-dark bg-veld text-nl-negatief">
      <div className="mx-auto max-w-5xl px-4 py-12 text-sm sm:px-6">
        <Logo variant="wordmark-negative" size={30} tagline />
        <p className="mt-6 max-w-2xl">
          Aankopen verlopen via bol.com. Getoonde prijzen zijn richtprijzen; de
          actuele prijs zie je bij de winkel.
        </p>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-semibold text-white">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="mt-4">
          &copy; {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}
