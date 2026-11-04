import type { ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';

/**
 * Buttons (redesign fase 7): one height (44 px), one radius, a slightly
 * larger label, darker on hover and a 1 px press, so they feel solid. The
 * press and the colour change stop with prefers-reduced-motion.
 */
export const buttonBaseClasses =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.9375rem] font-semibold tracking-[-0.005em] transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-veld disabled:cursor-not-allowed disabled:opacity-50';
export const buttonVariantClasses = {
  primary:
    'bg-veld text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(13_27_46/0.18)] hover:bg-veld-donker',
  secondary: 'border border-veld/35 bg-white text-veld hover:border-veld hover:bg-mist',
  /** For use on a dark/colored background (e.g. the Hero section). */
  inverse: 'bg-white text-veld hover:bg-krijt',
  /** Orange call to action; dark text keeps the contrast above WCAG AA. */
  accent:
    'bg-bal text-inkt shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_2px_rgb(13_27_46/0.18)] hover:bg-bal-donker',
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
