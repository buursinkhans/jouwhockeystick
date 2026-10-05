import type { ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';

export const buttonBaseClasses =
  'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-veld';
export const buttonVariantClasses = {
  primary: 'bg-veld text-white hover:bg-veld/90',
  secondary: 'border border-veld text-veld hover:bg-krijt',
  /** For use on a dark/colored background (e.g. the Hero section). */
  inverse: 'bg-white text-veld hover:bg-krijt',
  /** Orange call to action; dark text keeps the contrast above WCAG AA. */
  accent: 'bg-bal text-inkt hover:bg-bal/90',
} as const;
const baseClasses = buttonBaseClasses;
const variantClasses = buttonVariantClasses;

type ButtonVariant = keyof typeof variantClasses;

type ButtonAsLinkProps = { href: string; variant?: ButtonVariant } & Omit<
  ComponentPropsWithoutRef<typeof Link>,
  'href'
>;

export function ButtonLink({
  href,
  variant = 'primary',
  className = '',
  ...props
}: ButtonAsLinkProps) {
  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

type ButtonProps = {
  variant?: ButtonVariant;
} & ComponentPropsWithoutRef<'button'>;

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
