import type { QuestionDef } from '@/content/stickwijzer/questions';

export type AnswerValue = string | string[] | number | undefined;

const OPTION_CLASSES =
  'flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-emerald-700 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50';

function Explanation({ def }: { def: QuestionDef }) {
  return (
    <div className="mt-2 space-y-1 text-sm text-zinc-600">
      {def.helpText && <p id={`${def.id}-help`}>{def.helpText}</p>}
      <details>
        <summary className="cursor-pointer select-none text-emerald-800 hover:underline">
          Waarom vragen we dit?
        </summary>
        <p className="mt-1 max-w-prose">{def.dataUse}</p>
      </details>
    </div>
  );
}

export function QuestionField({
  def,
  value,
  onChange,
  optional = false,
  errorMessage,
}: {
  def: QuestionDef;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  optional?: boolean;
  errorMessage?: string;
}) {
  const { input } = def;
  const errorId = `${def.id}-error`;
  const describedBy = [def.helpText ? `${def.id}-help` : null, errorMessage ? errorId : null]
    .filter(Boolean)
    .join(' ');
  const error = errorMessage ? (
    <p id={errorId} className="mt-2 text-sm text-red-700">
      {errorMessage}
    </p>
  ) : null;
  const suffix = optional ? <span className="font-normal text-zinc-500"> (optioneel)</span> : null;

  if (input.kind === 'number') {
    return (
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
              onChange(event.target.value === '' ? undefined : Number(event.target.value))
            }
            aria-describedby={describedBy || undefined}
            aria-invalid={errorMessage ? true : undefined}
            className="w-32 rounded-lg border border-zinc-300 bg-white px-3 py-2"
          />
          <span className="text-sm text-zinc-600">{input.unit}</span>
        </div>
        {error}
        <Explanation def={def} />
      </div>
    );
  }

  if (input.kind === 'scale') {
    const steps = Array.from({ length: input.max - input.min + 1 }, (_, index) => input.min + index);
    return (
      <fieldset aria-describedby={describedBy || undefined}>
        <legend className="font-medium">
          {def.question}
          {suffix}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {steps.map((step) => (
            <label key={step} className={`${OPTION_CLASSES} justify-center px-4`}>
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
        <p className="mt-1 text-xs text-zinc-500">
          {input.min} = {input.minLabel}, {input.max} = {input.maxLabel}
        </p>
        {error}
        <Explanation def={def} />
      </fieldset>
    );
  }

  if (input.kind === 'multi') {
    const selected = Array.isArray(value) ? value : [];
    const atMax = selected.length >= input.max;
    return (
      <fieldset aria-describedby={describedBy || undefined}>
        <legend className="font-medium">
          {def.question}
          {suffix}
        </legend>
        <p className="mt-1 text-sm text-zinc-600">Kies er maximaal {input.max}.</p>
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
        <Explanation def={def} />
      </fieldset>
    );
  }

  return (
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
      <Explanation def={def} />
    </fieldset>
  );
}
