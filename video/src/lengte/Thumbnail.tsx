import { AbsoluteFill } from 'remotion';
import { C, FONT_DISPLAY, Pill, SiteName } from '../brand';
import { EXAMPLES, formatMeters, sizesLabel } from './data';
import { Figure } from './Figure';

/** YouTube thumbnail (1280 × 720) for the length explainer. */
export function LengteThumbnail() {
  const example = EXAMPLES[1] ?? EXAMPLES[0];
  return (
    <AbsoluteFill
      style={{
        background: C.veldblauw,
        padding: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 30, maxWidth: 760 }}>
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            fontSize: 92,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: C.wit,
          }}
        >
          Welke lengte stick?
        </div>
        {example && (
          <Pill style={{ fontSize: 54, padding: '12px 34px', alignSelf: 'flex-start' }}>
            {formatMeters(example.heightCm)} m → {sizesLabel(example.sizes)}
          </Pill>
        )}
        <SiteName size={30} />
      </div>
      {example && (
        <div style={{ background: C.krijt, borderRadius: 36, padding: '20px 10px 10px' }}>
          <Figure
            heightCm={example.heightCm}
            sticks={[{ inch: example.drawnInch, drop: 1, color: C.veldblauw }]}
            height={540}
          />
        </div>
      )}
    </AbsoluteFill>
  );
}
