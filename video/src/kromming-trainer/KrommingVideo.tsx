// Trainer Short "Low bow of mid bow?" with AI trainer Daan (docs/video.md §9a).
// Source page: /kennis/low-bow-vs-mid-bow. Daan does the opening and the
// close; the explanation is drawn here, from the same bow data as the site.
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { bowDepthAt } from '../../../src/content/bowProfiles';
import { C, FONT_BODY, FONT_DISPLAY } from '../brand';
import { Body, Chip, PopPill, Rise, Sfx, Split, Words, b, useIn, useLayout } from '../lengte/LengteVideo';
import {
  EndCard,
  HookCard,
  TextHookScene,
  TrainerScene,
  TrainerTimeline,
  type TrainerSceneSpec,
  takeFrames,
  totalFrames,
} from '../trainer/Trainer';
import {
  CAPTIONS,
  LOW_BOW_PEAK,
  MAX_BOW_DEPTH_MM,
  MID_BOW_PEAK,
  TAKES,
  TRAINER_CLIP,
  TRAINER_CLIP_READY,
} from './data';

export type KrommingProps = { music: boolean };

const HOOK = 'Low bow of mid bow?';
const HOOK_ACCENT = ['bow?'];

function scenes(): KrommingScene[] {
  const intro: KrommingScene = TRAINER_CLIP_READY
    ? {
        id: 'intro',
        frames: takeFrames(TAKES.intro),
        trainer: true,
        render: () => (
          <TrainerScene clip={TRAINER_CLIP} take={TAKES.intro} captions={CAPTIONS.intro}>
            <HookCard text={HOOK} accent={HOOK_ACCENT} />
          </TrainerScene>
        ),
      }
    : {
        id: 'intro',
        frames: b(5),
        dark: true,
        render: () => (
          <TextHookScene text={HOOK} accent={HOOK_ACCENT} sub="Het verschil zit in de plek van de kromming." />
        ),
      };
  const outro: KrommingScene[] = TRAINER_CLIP_READY
    ? [
        {
          id: 'outro',
          frames: takeFrames(TAKES.outro),
          trainer: true,
          render: () => <TrainerScene clip={TRAINER_CLIP} take={TAKES.outro} captions={CAPTIONS.outro} />,
        },
      ]
    : [];
  return [
    intro,
    { id: 'wat-is', frames: b(12), render: () => <WhatIsScene /> },
    { id: 'plek', frames: b(18), render: () => <PlaceScene /> },
    { id: 'wie', frames: b(14), render: () => <WhoScene /> },
    ...outro,
    { id: 'eindkaart', frames: b(8), dark: true, render: () => <EndCard /> },
  ];
}

type KrommingScene = TrainerSceneSpec;

export function krommingDurationInFrames(): number {
  return totalFrames(scenes());
}

export function KrommingVideo({ music }: KrommingProps) {
  return <TrainerTimeline scenes={scenes()} music={music} ai={TRAINER_CLIP_READY} />;
}

/* ---------- the stick ---------- */

/**
 * A stick lying flat, hook on the left, seen from the side. Schematic: the
 * real bow is at most 25 mm on a stick of about 90 cm, far too small to see,
 * so the depth is exaggerated. `peak` is the deepest point (0 = hook end),
 * `depth` 0–1 grows the curve in.
 */
function BowStick({
  peak,
  depth,
  width,
  label,
}: {
  peak: number;
  depth: number;
  width: number;
  label?: string;
}) {
  const { small } = useLayout();
  const height = width * 0.5;
  const top = height * 0.22;
  const amp = height * 0.38;
  const x0 = width * 0.16;
  const x1 = width * 0.96;
  const steps = 60;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return [x0 + t * (x1 - x0), top + bowDepthAt(t, peak) * amp * depth] as const;
  });
  const shaft = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const hook = `M${x0} ${top} C${x0 - width * 0.1} ${top}, ${x0 - width * 0.13} ${top + height * 0.3}, ${
    x0 - width * 0.03
  } ${top + height * 0.34}`;
  const peakX = x0 + peak * (x1 - x0);
  const peakY = top + amp * depth;
  const stroke = width * 0.03;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {/* Straight reference line: how deep the bow is, measured from here. */}
      <line
        x1={x0}
        y1={top}
        x2={x1}
        y2={top}
        stroke={C.lijngrijs}
        strokeWidth={4}
        strokeDasharray="14 12"
        opacity={0.6}
      />
      <path d={hook} fill="none" stroke={C.veldblauw} strokeWidth={stroke} strokeLinecap="round" />
      <path d={shaft} fill="none" stroke={C.veldblauw} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      {/* Grip at the top end. */}
      <line
        x1={x1 - width * 0.16}
        y1={top + bowDepthAt(0.82, peak) * amp * depth}
        x2={x1}
        y2={top}
        stroke={C.inkt}
        strokeWidth={stroke * 1.1}
        strokeLinecap="round"
      />
      {depth > 0.05 && (
        <>
          <line x1={peakX} y1={top} x2={peakX} y2={peakY} stroke={C.bal} strokeWidth={5} />
          <circle cx={peakX} cy={peakY} r={stroke * 0.75} fill={C.bal} />
        </>
      )}
      {label && (
        <text
          x={peakX}
          y={peakY + stroke * 2.6}
          textAnchor="middle"
          fontFamily={FONT_DISPLAY}
          fontWeight={800}
          fontSize={small * 1.15}
          fill={C.bal}
        >
          {label}
        </text>
      )}
      <text x={x0 - width * 0.12} y={height * 1.02} fontFamily={FONT_BODY} fontSize={small * 0.62} fill={C.lijngrijs}>
        krul
      </text>
      <text x={x1} y={height * 1.02} textAnchor="end" fontFamily={FONT_BODY} fontSize={small * 0.62} fill={C.lijngrijs}>
        grip · schematisch, niet op schaal
      </text>
    </svg>
  );
}

/* ---------- scenes ---------- */

function WhatIsScene() {
  const { body, small, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const growAt = b(2);
  const depth = interpolate(frame, [growAt, growAt + b(3)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const mm = Math.round(depth * MAX_BOW_DEPTH_MM);
  return (
    <Split
      text={
        <>
          <Chip size={small}>1. Wat is de bow?</Chip>
          <Rise delay={b(0.5)}>
            <Words text="De kromming van je stick" size={body * 1.5} accent={['kromming']} />
          </Rise>
          <Rise delay={growAt + b(3)}>
            <Body size={body}>
              Hooguit {MAX_BOW_DEPTH_MM} mm diep, op het veld en in de zaal. Die grens geldt voor iedereen.
            </Body>
          </Rise>
          <Sfx name="tick" at={growAt + b(3)} />
        </>
      }
      visual={<BowStick peak={MID_BOW_PEAK} depth={depth} width={width - pad * 2} label={`${mm} mm`} />}
    />
  );
}

function PlaceScene() {
  const { body, small, width, pad } = useLayout();
  const frame = useCurrentFrame();
  const moveAt = b(8);
  const shift = interpolate(frame, [moveAt, moveAt + b(2.5)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const peak = MID_BOW_PEAK + (LOW_BOW_PEAK - MID_BOW_PEAK) * shift;
  const isLow = shift > 0.5;
  return (
    <Split
      text={
        <>
          <Chip size={small}>2. Het verschil zit in de plek</Chip>
          <Rise delay={b(1)}>
            <Body size={body}>
              <b>Mid bow:</b> het diepste punt ligt ongeveer halverwege. Meestal voorspelbaar bij aannemen, vlak passen
              en pushen.
            </Body>
          </Rise>
          <Rise delay={moveAt + b(2.5)}>
            <Body size={body}>
              <b>Low bow:</b> lager, dichter bij de krul. Zo kom je makkelijker onder de bal voor lifts en 3D-acties.
            </Body>
          </Rise>
          <Sfx name="whoosh" at={moveAt} />
          <Sfx name="pop" at={moveAt + b(2.5)} />
        </>
      }
      visual={<BowStick peak={peak} depth={1} width={width - pad * 2} label={isLow ? 'low bow' : 'mid bow'} />}
    />
  );
}

function Choice({ question, answer, delay }: { question: string; answer: string; delay: number }) {
  const { body } = useLayout();
  const p = useIn(delay, true);
  return (
    <div
      style={{
        opacity: Math.min(1, p * 1.5),
        transform: `translateX(${(1 - p) * 120}px)`,
        background: C.wit,
        borderRadius: 24,
        padding: `${body * 0.5}px ${body * 0.6}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: body * 0.25,
      }}
    >
      <Body size={body * 0.9}>{question}</Body>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: body * 1.25, color: C.veldblauw }}>
        → {answer}
      </div>
    </div>
  );
}

function WhoScene() {
  const { pad, small, body } = useLayout();
  return (
    <AbsoluteFill style={{ padding: pad, paddingTop: pad * 1.8, gap: 34 }}>
      <Chip size={small}>3. Wat past bij jou?</Chip>
      <Choice question="Begin je, of werk je nog aan je basis?" answer="Mid bow" delay={b(1)} />
      <Choice question="Beheers je de basis en lift je vaak?" answer="Low bow" delay={b(4)} />
      <PopPill delay={b(8)} size={body * 0.8}>
        Extreme low bow: niet als eerste stick
      </PopPill>
      <Rise delay={b(10)}>
        <Body size={small * 0.85} color={C.lijngrijs}>
          Ook carbon, gewicht en balans bepalen hoe een stick in je handen ligt.
        </Body>
      </Rise>
      <Sfx name="thud" at={b(1) + 4} />
      <Sfx name="thud" at={b(4) + 4} />
    </AbsoluteFill>
  );
}
