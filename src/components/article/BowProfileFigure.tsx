'use client';

import { useId, useState } from 'react';
import {
  BOW_FIGURE_OPTIONS,
  MAX_BOW_DEPTH_MM,
  bowDepthAt,
  type BowFigureOption,
} from '@/content/bowProfiles';
import { trackEvent } from '@/lib/analytics/track';

// Drawing geometry (SVG user units). The stick lies horizontally: grip on the
// left, hook on the right. The bow is drawn exaggerated so it is visible.
const GRIP_X = 40;
const HOOK_X = 520;
const BASE_Y = 96;
const DEPTH = 46;
const SAMPLES = 60;

function bowPath(peak: number): string {
  const points: string[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const t = i / SAMPLES; // 0 = hook end, 1 = grip end
    const x = HOOK_X - t * (HOOK_X - GRIP_X);
    const y = BASE_Y - bowDepthAt(t, peak) * DEPTH;
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return points.join(' ');
}

const HOOK_PATH = `M${HOOK_X} ${BASE_Y} C ${HOOK_X + 46} ${BASE_Y} ${HOOK_X + 62} ${BASE_Y + 34} ${HOOK_X + 36} ${BASE_Y + 46} C ${HOOK_X + 20} ${BASE_Y + 53} ${HOOK_X + 6} ${BASE_Y + 44} ${HOOK_X + 12} ${BASE_Y + 32}`;

function peakX(option: BowFigureOption): number {
  return HOOK_X - option.peak * (HOOK_X - GRIP_X);
}

export function BowProfileFigure() {
  const [selectedId, setSelectedId] =
    useState<BowFigureOption['id']>('midbow');
  const groupName = useId();
  const captionId = useId();
  const selected =
    BOW_FIGURE_OPTIONS.find((option) => option.id === selectedId) ??
    BOW_FIGURE_OPTIONS[1]!;
  const x = peakX(selected);

  function select(option: BowFigureOption) {
    setSelectedId(option.id);
    trackEvent({
      name: 'figure_interaction',
      figure: 'bow-profiles',
      option: option.id,
    });
  }

  return (
    <figure className="mt-5 rounded-2xl border border-rand bg-white p-4">
      <fieldset>
        <legend className="text-sm font-semibold text-inkt">
          Kies een profiel
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {BOW_FIGURE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="flex min-h-11 cursor-pointer items-center rounded-xl border border-lijngrijs bg-white px-3 py-2 text-sm font-semibold has-[:checked]:border-veld has-[:checked]:bg-krijt has-[:checked]:text-veld has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-veld"
            >
              <input
                type="radio"
                name={groupName}
                value={option.id}
                checked={option.id === selectedId}
                onChange={() => select(option)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <svg
        viewBox="0 0 600 170"
        className="mt-4 h-auto w-full"
        role="img"
        aria-labelledby={captionId}
        aria-describedby={`${captionId}-desc`}
      >
        <title id={captionId}>
          {`Schematisch zijaanzicht van een stick met profiel ${selected.label}`}
        </title>
        <desc id={`${captionId}-desc`}>{selected.description}</desc>

        {/* The other profiles, faint, for comparison. */}
        {BOW_FIGURE_OPTIONS.filter((o) => o.id !== selected.id).map((o) => (
          <path
            key={o.id}
            d={bowPath(o.peak)}
            fill="none"
            stroke="var(--color-rand)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}

        {/* Straight reference line and the FIH depth limit. */}
        <line
          x1={GRIP_X}
          y1={BASE_Y}
          x2={HOOK_X}
          y2={BASE_Y}
          stroke="var(--color-lijngrijs)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <line
          x1={GRIP_X}
          y1={BASE_Y - DEPTH}
          x2={HOOK_X}
          y2={BASE_Y - DEPTH}
          stroke="var(--color-bal)"
          strokeWidth={1}
          strokeDasharray="6 4"
        />
        <text
          x={GRIP_X}
          y={BASE_Y - DEPTH - 8}
          fontSize={12}
          fill="var(--color-lijngrijs)"
        >
          {`Grens: max. ${MAX_BOW_DEPTH_MM} mm kromming (FIH)`}
        </text>

        {/* The selected stick: shaft and hook. */}
        <path
          d={bowPath(selected.peak)}
          fill="none"
          stroke="var(--color-veld)"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path
          d={HOOK_PATH}
          fill="none"
          stroke="var(--color-veld)"
          strokeWidth={7}
          strokeLinecap="round"
        />

        {/* Deepest point. */}
        <line
          x1={x}
          y1={BASE_Y}
          x2={x}
          y2={BASE_Y - DEPTH}
          stroke="var(--color-bal)"
          strokeWidth={2}
        />
        <circle cx={x} cy={BASE_Y - DEPTH} r={5} fill="var(--color-bal)" />
        <text
          x={x}
          y={BASE_Y + 22}
          fontSize={12}
          textAnchor="middle"
          fill="var(--color-inkt)"
          fontWeight={600}
        >
          Diepste punt
        </text>

        <text x={GRIP_X} y={BASE_Y + 50} fontSize={12} fill="var(--color-lijngrijs)">
          ← greep
        </text>
        <text
          x={HOOK_X - 10}
          y={BASE_Y + 66}
          fontSize={12}
          textAnchor="end"
          fill="var(--color-lijngrijs)"
        >
          krul →
        </text>
      </svg>

      <p className="mt-2 text-sm leading-relaxed text-inkt/80" aria-live="polite">
        <strong>{selected.label}:</strong> {selected.description}
      </p>
      <figcaption className="mt-3 text-xs leading-relaxed text-lijngrijs">
        Schematische illustratie, niet op schaal: de kromming is overdreven
        getekend en elk profiel is even diep getekend, tot de grens van{' '}
        {MAX_BOW_DEPTH_MM} mm uit de FIH-spelregels. Waar het diepste punt
        precies ligt, verschilt per merk en model; dit is onze redactionele
        weergave, geen meting.
      </figcaption>
    </figure>
  );
}
