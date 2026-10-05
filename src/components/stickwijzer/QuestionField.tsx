import type { ReactNode } from 'react';
import type { QuestionDef } from '@/content/stickwijzer/questions';
import { InfoIcon } from '@/components/ui/icons';
import type { IconComponent } from './stickwijzerIcons';

export type AnswerValue = string | string[] | number | undefined;

const OPTION_CLASSES =
  'flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-lijngrijs bg-white px-3 py-2 text-sm has-[:checked]:border-veld has-[:checked]:bg-krijt has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-veld has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50';

const CARD_CLASSES =
  'flex cursor-pointer flex-col rounded-2xl border border-lijngrijs bg-white p-4 has-[:checked]:border-veld has-[:checked]:bg-krijt has-[:checked]:ring-1 has-[:checked]:ring-veld has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-veld';

/** The explanation that sits next to a question: why we ask it, plus any help text. */
function Explanation({ def }: { def: QuestionDef }) {
  return (
    <aside className="self-start rounded-xl bg-krijt px-4 py-3 text-sm text-inkt/80">
      <p className="flex items-center gap-1.5 font-semibold text-veld">
        <InfoIcon size={16} />
        Waarom vragen we dit?
      </p>
      <p className="mt-1">{def.dataUse}</p>
      {def.helpText && (
        <p id={`${def.id}-help`} className="mt-2">
          {def.helpText}
        </p>
      )}
    </aside>
  );
}

export function QuestionField({
  def,
  value,
  onChange,
  optional = false,
  errorMessage,
  optionMeta,
  optionIcons,
}: {
  def: QuestionDef;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  optional?: boolean;
  errorMessage?: string;
  /** Extra line per option, keyed by option value — only used by the card layout. */
  optionMeta?: Record<string, string>;
  /** Icon per option, keyed by option value — only used by the card layout. */
  optionIcons?: Record<string, IconComponent>;
}) {
  const { input } = def;
  const errorId = `${def.id}-error`;
  const describedBy = [
    def.helpText ? `${def.id}-help` : null,
    errorMessage ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ');
  const error = errorMessage ? (
    <p id={errorId} className="mt-2 text-sm text-red-700">
      {errorMessage}
    </p>
  ) : null;
  const suffix = optional ? (
    <span className="font-normal text-lijngrijs"> (optioneel)</span>
  ) : null;

  let control: ReactNode;

  if (input.kind === 'number') {
    control = (
      <div>
        <label htmlFor={def.id} className="block font-medium">
          {def.question}
          {suffix}
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id={def.id}
            type="number"
            inputMode="numeric"
            min={input.min}
            max={input.max}
            value={typeof value === 'number' ? value : ''}
            onChange={(event) =>
              onChange(
                event.target.value === ''
                  ? undefined
                  : Number(event.target.value),
              )
            }
            aria-describedby={describedBy || undefined}
            aria-invalid={errorMessage ? true : undefined}
            className="w-32 rounded-lg border border-lijngrijs bg-white px-3 py-2"
          />
          <span className="text-sm text-lijngrijs">{input.unit}</span>
        </div>
        {error}
      </div>
    );
  } else if (input.kind === 'scale') {
    const steps = Array.from(
      { length: input.max - input.min + 1 },
      (_, index) => input.min + index,
    );
    control = (
      <fieldset aria-describedby={describedBy || undefined}>
        <legend className="font-medium">
          {def.question}
          {suffix}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {steps.map((step) => (
            <label
              key={step}
              className={`${OPTION_CLASSES} justify-center px-4`}
            >
              <input
                type="radio"
                name={def.id}
                value={step}
                checked={value === step}
                onChange={() => onChange(step)}
              />
              {step}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-lijngrijs">
          {input.min} = {input.minLabel}, {input.max} = {input.maxLabel}
        </p>
        {error}
      </fieldset>
    );
  } else if (input.kind === 'multi') {
    const selected = Array.isArray(value) ? value : [];
    const atMax = selected.length >= input.max;
    control = (
      <fieldset aria-describedby={describedBy || undefined}>
        <legend className="font-medium">
          {def.question}
          {suffix}
        </legend>
        <p className="mt-1 text-sm text-lijngrijs">
          Kies er maximaal {input.max}.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {input.options.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <label key={option.value} className={OPTION_CLASSES}>
                <input
                  type="checkbox"
                  value={option.value}
                  checked={checked}
                  disabled={!checked && atMax}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [...selected, option.value]
                        : selected.filter((item) => item !== option.value),
                    )
                  }
                />
                {option.label}
              </label>
            );
          })}
        </div>
        {error}
      </fieldset>
    );
  } else if (input.options.some((option) => option.details)) {
    // Card layout: each option explains itself, so the cards take the full
    // width and the general explanation goes underneath instead of beside.
    return (
      <div>
        <fieldset aria-describedby={describedBy || undefined}>
          <legend className="text-lg font-semibold">
            {def.question}
            {suffix}
          </legend>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {input.options.map((option) => {
              const OptionIcon = optionIcons?.[option.value];
              return (
                <label key={option.value} className={CARD_CLASSES}>
                  {OptionIcon && (
                    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-krijt text-veld">
                      <OptionIcon size={22} />
                    </span>
                  )}
                  <span className="flex items-center gap-2 font-semibold">
                    <input
                      type="radio"
                      name={def.id}
                      value={option.value}
                      checked={value === option.value}
                      onChange={() => onChange(option.value)}
                    />
                    {option.label}
                  </span>
                  {option.details?.map((detail) => (
                    <span
                      key={detail.term}
                      className="mt-3 block text-sm text-inkt/80"
                    >
                      <span className="block text-xs font-semibold uppercase tracking-wide text-lijngrijs">
                        {detail.term}
                      </span>
                      {detail.text}
                    </span>
                  ))}
                  {optionMeta?.[option.value] && (
                    <span className="mt-3 block text-sm font-medium text-veld">
                      {optionMeta[option.value]}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
          {error}
        </fieldset>
        <p className="mt-3 text-sm text-lijngrijs">{def.dataUse}</p>
      </div>
    );
  } else if (def.fullWidth) {
    // Same width and column grid as the card layout, so the two line up.
    return (
      <div>
        <fieldset aria-describedby={describedBy || undefined}>
          <legend className="text-lg font-semibold">
            {def.question}
            {suffix}
          </legend>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {input.options.map((option) => (
              <label
                key={option.value}
                className={`${OPTION_CLASSES} rounded-2xl px-4 py-3 font-semibold`}
              >
                <input
                  type="radio"
                  name={def.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          {error}
        </fieldset>
        <p className="mt-3 text-sm text-lijngrijs">{def.dataUse}</p>
      </div>
    );
  } else {
    control = (
      <fieldset aria-describedby={describedBy || undefined}>
        <legend className="font-medium">
          {def.question}
          {suffix}
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {input.options.map((option) => (
            <label key={option.value} className={OPTION_CLASSES}>
              <input
                type="radio"
                name={def.id}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
        {error}
      </fieldset>
    );
  }

  // Question on the left, explanation on the right; stacked on small screens.
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8">
      {control}
      <Explanation def={def} />
    </div>
  );
}
