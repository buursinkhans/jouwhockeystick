'use client';

import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { trackEvent } from '@/lib/analytics/track';
import { STICK_USE_TEXT, type StickUse } from '@/content/stickwijzer/stickUse';

/**
 * The first question of the stickwijzer (2026-11-08): what the stick is for.
 * The stickwijzer advises field sticks only. Indoor goes to the short indoor
 * selector; a keeper gets personal advice, never the field rules unnoticed.
 */
export function StickUseChoice({ value, onChange }: { value: StickUse; onChange: (use: StickUse) => void }) {
  return (
    <fieldset>
      <legend className="text-lg font-bold">{STICK_USE_TEXT.question}</legend>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {STICK_USE_TEXT.options.map((option) => {
          const active = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-sm font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-veld ${
                active ? 'border-2 border-veld bg-mist text-veld' : 'border-rand bg-white text-inkt hover:border-veld'
              }`}
            >
              <input
                type="radio"
                name="stick_use"
                value={option.value}
                checked={active}
                onChange={() => {
                  onChange(option.value);
                  if (option.value !== 'veld') trackEvent({ name: 'stickwijzer_exit', target: option.value });
                }}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Instead of the field questions, for an indoor stick or a keeper. */
export function StickUseExit({ use }: { use: Exclude<StickUse, 'veld'> }) {
  const text = STICK_USE_TEXT.exits[use];
  return (
    <div className="mt-6 rounded-2xl border border-rand bg-krijt p-5" role="status">
      <h2 className="text-xl font-bold">{text.title}</h2>
      <p className="mt-2 text-inkt/80">{text.body}</p>
      <div className="mt-4">
        <ButtonLink href={text.href}>{text.cta}</ButtonLink>
      </div>
      {use === 'keeper' && (
        <p className="mt-3 text-sm text-lijngrijs">
          Zoek je ook een veldstick?{' '}
          <Link href="/sticks" className="font-semibold text-veld hover:underline">
            Bekijk de veldsticks
          </Link>
          .
        </p>
      )}
    </div>
  );
}
