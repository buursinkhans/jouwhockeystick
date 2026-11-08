'use client';

import { ADVICE_MODE_TEXT } from '@/content/stickwijzer/quick';

export type AdviceMode = 'quick' | 'full';

/**
 * Two ways in (UX phase 1, 2026-11-08): quick advice for parents and
 * beginners, or the full stickwijzer. Radio buttons styled as cards, so the
 * keyboard and screen readers treat them as one choice.
 */
export function AdviceModeChoice({ value, onChange }: { value: AdviceMode; onChange: (mode: AdviceMode) => void }) {
  return (
    <fieldset>
      <legend className="text-lg font-bold">{ADVICE_MODE_TEXT.question}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {ADVICE_MODE_TEXT.options.map((option) => {
          const active = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-veld motion-reduce:transition-none ${
                active ? 'border-2 border-veld bg-mist' : 'border-rand bg-white hover:border-veld'
              }`}
            >
              <input
                type="radio"
                name="advice_mode"
                value={option.value}
                checked={active}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className={`font-bold ${active ? 'text-veld' : 'text-inkt'}`}>{option.label}</span>
              <span className="mt-1 text-sm text-inkt/75">{option.description}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
