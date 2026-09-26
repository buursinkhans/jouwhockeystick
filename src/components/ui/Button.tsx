import type { ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';

export const buttonBaseClasses =
  'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700';
export const buttonVariantClasses = {
  primary: 'bg-emerald-700 text-white hover:bg-emerald-800',
  secondary: 'border border-emerald-700 text-emerald-800 hover:bg-emerald-50',
} as const;
const baseClasses = buttonBaseClasses;
const variantClasses = buttonVariantClasses;

type ButtonVariant = keyof typeof variantClasses;

type ButtonAsLinkProps = { href: string; variant?: ButtonVariant } & Omit<
  ComponentPropsWithoutRef<typeof Link>,
  'href'
>;

export function ButtonLink({ href, variant = 'primary', className = '', ...props }: ButtonAsLinkProps) {
  return (
    <Link href={href} className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props} />
  );
}

type ButtonProps = { variant?: ButtonVariant } & ComponentPropsWithoutRef<'button'>;

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props} />
  );
}
