import type { ReactNode } from 'react';
import type { QuizAnswers } from '@/advice-engine/types';
import { BoltIcon, TargetIcon, UserIcon, WalletIcon } from '@/components/ui/icons';

export type QuizStepAnswers = Partial<QuizAnswers>;
export type OnAnswerChange = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => void;

function WhyWeAsk({ children }: { children: ReactNode }) {
  return (
    <details className="mt-1.5 text-sm text-zinc-500">
      <summary className="cursor-pointer select-none text-emerald-800 hover:underline">
        Waarom vragen we dit?
      </summary>
      <p className="mt-1 max-w-prose">{children}</p>
    </details>
  );
}

function StepHeader({ icon, category, description }: { icon: ReactNode; category: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
        {icon}
      </span>
      <div>
        <p className="text-lg font-semibold">{category}</p>
        <p className="text-sm text-zinc-600">{description}</p>
      </div>
    </div>
  );
}

const BUYER_TYPE_OPTIONS: Array<{ value: QuizAnswers['buyerType']; label: string }> = [
  { value: 'zelf', label: 'Voor mezelf' },
  { value: 'kind', label: 'Voor mijn kind' },
];

const POSITION_OPTIONS: Array<{ value: QuizAnswers['position']; label: string }> = [
  { value: 'keeper', label: 'Keeper' },
  { value: 'verdediger', label: 'Verdediger' },
  { value: 'middenvelder', label: 'Middenvelder' },
  { value: 'aanvaller', label: 'Aanvaller' },
];

const EXPERIENCE_OPTIONS: Array<{ value: QuizAnswers['experienceLevel']; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'gevorderd', label: 'Gevorderd' },
  { value: 'ervaren', label: 'Ervaren' },
];

const CURRENT_STICK_OPTIONS: Array<{ value: QuizAnswers['currentStickExperience']; label: string }> = [
  { value: 'nog-geen-stick', label: 'Ik heb nog geen eigen stick' },
  { value: 'basis', label: 'Ik heb basiservaring met een stick' },
  { value: 'ruime-ervaring', label: 'Ik heb ruime ervaring met een stick' },
];

const PLAY_ACTION_OPTIONS: Array<{ value: QuizAnswers['desiredPlayActions'][number]; label: string }> = [
  { value: 'dribbelen', label: 'Dribbelen en balcontrole' },
  { value: 'passen', label: 'Passen en samenspel' },
  { value: 'shot', label: 'Een harde shot' },
  { value: 'verdedigen', label: 'Verdedigen en tackelen' },
];

const COMFORT_OPTIONS: Array<{ value: QuizAnswers['comfortPreference']; label: string }> = [
  { value: 'licht-wendbaar', label: 'Licht en wendbaar' },
  { value: 'stevig-krachtig', label: 'Stevig en krachtig' },
  { value: 'geen-voorkeur', label: 'Geen voorkeur' },
];

export function QuizStep({
  step,
  answers,
  onChange,
}: {
  step: number;
  answers: QuizStepAnswers;
  onChange: OnAnswerChange;
}) {
  if (step === 0) {
    return (
      <fieldset className="space-y-5">
        <legend className="sr-only">Jij als hockeyer</legend>
        <StepHeader
          icon={<UserIcon size={18} />}
          category="Jij als hockeyer"
          description="Een paar basisgegevens om de juiste lengte en het juiste niveau te bepalen."
        />

        <div>
          <span className="block text-sm font-medium">Voor wie kies je deze stick?</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {BUYER_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm has-[:checked]:border-emerald-700"
              >
                <input
                  type="radio"
                  name="buyerType"
                  value={option.value}
                  checked={answers.buyerType === option.value}
                  onChange={() => onChange('buyerType', option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          <WhyWeAsk>
            Voor kinderen wegen we bijvoorbeeld leeftijd mee, zodat we geen te stugge,
            hoog-carbon stick adviseren die minder vergevingsgezind is.
          </WhyWeAsk>
        </div>

        {answers.buyerType === 'kind' && (
          <div>
            <label htmlFor="age" className="block text-sm font-medium">
              Leeftijd van je kind
            </label>
            <input
              id="age"
              type="number"
              min={3}
              max={18}
              required
              value={answers.age ?? ''}
              onChange={(e) => onChange('age', Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
        )}

        <div>
          <label htmlFor="playerHeightCm" className="block text-sm font-medium">
            Lichaamslengte (cm)
          </label>
          <input
            id="playerHeightCm"
            type="number"
            min={80}
            max={220}
            required
            value={answers.playerHeightCm ?? ''}
            onChange={(e) => onChange('playerHeightCm', Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          <WhyWeAsk>
            Lichaamslengte hangt samen met de ideale sticklengte. Een stick die te lang of te
            kort is, kan balcontrole en houding beïnvloeden.
          </WhyWeAsk>
        </div>

        <div>
          <span className="block text-sm font-medium">Positie op het veld</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {POSITION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm has-[:checked]:border-emerald-700"
              >
                <input
                  type="radio"
                  name="position"
                  value={option.value}
                  checked={answers.position === option.value}
                  onChange={() => onChange('position', option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          <WhyWeAsk>
            Sommige bow-profielen en gewichten passen net iets beter bij een positie — al is
            positie bij ons nooit de enige beslisfactor.
          </WhyWeAsk>
        </div>
      </fieldset>
    );
  }

  if (step === 1) {
    return (
      <fieldset className="space-y-5">
        <legend className="sr-only">Speelniveau</legend>
        <StepHeader
          icon={<TargetIcon size={18} />}
          category="Speelniveau"
          description="Hiermee bepalen we hoe vergevingsgezind of juist gespecialiseerd een stick moet zijn."
        />

        <div>
          <span className="block text-sm font-medium">Ervaringsniveau</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {EXPERIENCE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm has-[:checked]:border-emerald-700"
              >
                <input
                  type="radio"
                  name="experienceLevel"
                  value={option.value}
                  checked={answers.experienceLevel === option.value}
                  onChange={() => onChange('experienceLevel', option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          <WhyWeAsk>
            Je ervaringsniveau bepaalt mede hoe vergevingsgezind een stick idealiter is bij
            mishits, en hoeveel carbon daarbij past.
          </WhyWeAsk>
        </div>

        <div>
          <span className="block text-sm font-medium">Huidige stickervaring</span>
          <div className="mt-1 flex flex-col gap-2">
            {CURRENT_STICK_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="currentStickExperience"
                  value={option.value}
                  checked={answers.currentStickExperience === option.value}
                  onChange={() => onChange('currentStickExperience', option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          <WhyWeAsk>
            Of je al met een stick hebt gespeeld, zegt iets over hoe gewend je al bent aan het
            gevoel van carbon en balcontrole.
          </WhyWeAsk>
        </div>
      </fieldset>
    );
  }

  if (step === 2) {
    const selectedActions = answers.desiredPlayActions ?? [];
    return (
      <fieldset className="space-y-5">
        <legend className="sr-only">Speelstijl</legend>
        <StepHeader
          icon={<BoltIcon size={18} />}
          category="Speelstijl"
          description="Dit bepaalt welk bow-profiel en gevoel het beste bij je past."
        />

        <div>
          <span className="block text-sm font-medium">
            Welke spelacties vind je belangrijk? (kies er minstens één)
          </span>
          <div className="mt-1 flex flex-col gap-2">
            {PLAY_ACTION_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={selectedActions.includes(option.value)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selectedActions, option.value]
                      : selectedActions.filter((a) => a !== option.value);
                    onChange('desiredPlayActions', next);
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
          <WhyWeAsk>
            De acties die je belangrijk vindt hangen samen met het bow-profiel: low-bow voor
            dribbelen en liften, late-bow voor een krachtige shot.
          </WhyWeAsk>
        </div>

        <div>
          <span className="block text-sm font-medium">Comfortvoorkeur</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {COMFORT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm has-[:checked]:border-emerald-700"
              >
                <input
                  type="radio"
                  name="comfortPreference"
                  value={option.value}
                  checked={answers.comfortPreference === option.value}
                  onChange={() => onChange('comfortPreference', option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
          <WhyWeAsk>
            Comfortvoorkeur hangt samen met het carbonpercentage: meer carbon voelt vaak
            stugger en krachtiger, minder carbon vaak lichter en vergevingsgezinder.
          </WhyWeAsk>
        </div>
      </fieldset>
    );
  }

  return (
    <fieldset className="space-y-5">
      <legend className="sr-only">Budget</legend>
      <StepHeader
        icon={<WalletIcon size={18} />}
        category="Budget"
        description="Hiermee sluiten we alvast sticks uit die buiten je bereik liggen."
      />
      <div>
        <label htmlFor="budgetMaxEur" className="block text-sm font-medium">
          Maximaal budget (€)
        </label>
        <input
          id="budgetMaxEur"
          type="number"
          min={1}
          required
          value={answers.budgetMaxEur ?? ''}
          onChange={(e) => onChange('budgetMaxEur', Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-zinc-500">Richtbedrag — geen live prijzen.</p>
      </div>
    </fieldset>
  );
}
