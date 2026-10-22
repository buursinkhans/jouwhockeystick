import type { CSSProperties, ReactNode } from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { C, FONT_BODY, FONT_DISPLAY, Pill, SiteName } from '../brand';
import {
  ADULT_ROWS,
  CM_PER_INCH,
  DOUBT_HEIGHT_CM,
  DOUBT_INCH,
  EXAMPLES,
  FIH_MAX_STICK_CM,
  TABLE_ROWS,
  formatInch,
  formatMeters,
  rowIndexFor,
  sizeStepsUp,
  sizesLabel,
  type Example,
} from './data';
import { Figure } from './Figure';

export type Variant = 'short' | 'uitleg';
export type LengteProps = { variant: Variant; music: boolean };

export const FPS = 30;
/**
 * One beat of the music in frames (≈128.6 BPM). Must match BEAT_FRAMES in
 * video/audio/genereer.py: every scene lasts a whole number of beats, so the
 * cuts land on the beat.
 */
export const BEAT_FRAMES = 14;
const b = (beats: number) => Math.round(beats * BEAT_FRAMES);

type Scene = {
  id: string;
  beats: number;
  dark?: boolean;
  render: () => ReactNode;
};

function scenesFor(variant: Variant): Scene[] {
  const long = variant === 'uitleg';
  const examples = EXAMPLES.map<Scene>((example, index) => ({
    id: `voorbeeld-${index}`,
    beats: long ? 8 : 7,
    render: () => <ExampleScene example={example} index={index} />,
  }));
  return [
    // The hook is on screen from the first frame, so the intro can be short (docs/video.md §7a).
    { id: 'intro', beats: long ? 7 : 5, dark: true, render: () => <IntroScene /> },
    { id: 'meten', beats: long ? 8 : 6, render: () => <MeasureScene /> },
    ...examples,
    ...(long ? [{ id: 'tabel', beats: 22, render: () => <TableScene /> }] : []),
    { id: 'twijfel', beats: long ? 12 : 9, render: () => <DoubtScene /> },
    ...(long ? [{ id: 'volwassenen', beats: 13, render: () => <AdultScene /> }] : []),
    { id: 'slot', beats: long ? 11 : 8, dark: true, render: () => <EndScene /> },
  ];
}

export function durationInFrames(variant: Variant): number {
  return scenesFor(variant).reduce((total, scene) => total + b(scene.beats), 0);
}

export function LengteVideo({ variant, music }: LengteProps) {
  const scenes = scenesFor(variant);
  const total = durationInFrames(variant);
  let from = 0;
  return (
    <AbsoluteFill style={{ background: C.krijt }}>
      {scenes.map((scene, index) => {
        const frames = b(scene.beats);
        const start = from;
        from += frames;
        return (
          <Sequence key={scene.id} from={start} durationInFrames={frames}>
            <SceneShell
              frames={frames}
              dark={scene.dark ?? false}
              wipeIn={index > 0}
              wipeOut={index < scenes.length - 1}
            >
              {scene.render()}
            </SceneShell>
          </Sequence>
        );
      })}
      <ProgressBar total={total} />
      {music && (
        <Audio
          src={staticFile('video/muziek.mp3')}
          volume={(f) =>
            interpolate(f, [0, 6, total - 40, total], [0, 0.7, 0.7, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      )}
    </AbsoluteFill>
  );
}

/* ---------- sound ---------- */

type SfxName = 'whoosh' | 'pop' | 'thud' | 'ding' | 'nope' | 'tick';
const SFX_VOLUME: Record<SfxName, number> = {
  whoosh: 0.2,
  pop: 0.4,
  thud: 0.45,
  ding: 0.4,
  nope: 0.45,
  tick: 0.3,
};

function Sfx({ name, at }: { name: SfxName; at: number }) {
  return (
    <Sequence from={Math.max(0, Math.round(at))} durationInFrames={30} layout="none">
      <Audio src={staticFile(`video/sfx-${name}.mp3`)} volume={SFX_VOLUME[name]} />
    </Sequence>
  );
}

/* ---------- layout and motion helpers ---------- */

function useLayout() {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return {
    portrait,
    width,
    height,
    pad: portrait ? 90 : 110,
    h1: portrait ? 112 : 96,
    h2: portrait ? 84 : 70,
    body: portrait ? 48 : 40,
    small: portrait ? 34 : 30,
    // Fixed scale across scenes, so 1,20 m and 1,70 m stay comparable.
    figure: height * (portrait ? 0.5 : 0.7),
  };
}

// Shorts, Reels and TikTok cover the bottom ~20% and the right edge with
// their own buttons, so on portrait the brand line sits at the top and the
// visuals stop well above the bottom.
const PORTRAIT_SAFE_BOTTOM = 400;
const WIPE = 7;

/** Brand-coloured panel that sweeps across every cut, plus a whoosh. */
function SceneShell({
  frames,
  dark,
  wipeIn,
  wipeOut,
  children,
}: {
  frames: number;
  dark: boolean;
  wipeIn: boolean;
  wipeOut: boolean;
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  let panelX: number | null = null;
  if (wipeIn && frame < WIPE) {
    panelX = interpolate(frame, [0, WIPE], [0, -130], { easing: Easing.in(Easing.cubic) });
  } else if (wipeOut && frame >= frames - WIPE) {
    panelX = interpolate(frame, [frames - WIPE, frames], [130, 0], {
      easing: Easing.out(Easing.cubic),
    });
  }
  return (
    <AbsoluteFill>
      <Backdrop dark={dark} />
      {children}
      {wipeOut && <Sfx name="whoosh" at={frames - WIPE - 3} />}
      {panelX !== null && (
        <AbsoluteFill style={{ transform: `translateX(${panelX}%)` }}>
          <div
            style={{
              position: 'absolute',
              inset: '-10% -25%',
              transform: 'skewX(-14deg)',
              background: `linear-gradient(90deg, ${C.bal} 0 9%, ${C.veldblauw} 9% 91%, ${C.bal} 91% 100%)`,
            }}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}

/** Slowly drifting pitch lines (shooting circle, dashed line) behind every scene. */
function Backdrop({ dark }: { dark: boolean }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const line = dark ? C.wit : C.veldblauw;
  const drift = frame * 0.8;
  const r = Math.max(width, height) * 0.55;
  return (
    <AbsoluteFill style={{ background: dark ? C.veldblauw : C.krijt }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <circle
          cx={width * 0.95 - drift}
          cy={height * 1.02}
          r={r}
          fill="none"
          stroke={line}
          strokeOpacity={dark ? 0.12 : 0.07}
          strokeWidth="14"
        />
        <circle
          cx={width * 0.95 - drift}
          cy={height * 1.02}
          r={r * 1.3}
          fill="none"
          stroke={line}
          strokeOpacity={dark ? 0.09 : 0.05}
          strokeWidth="10"
          strokeDasharray="40 40"
          strokeDashoffset={-drift * 2}
        />
      </svg>
    </AbsoluteFill>
  );
}

function ProgressBar({ total }: { total: number }) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: 10,
        width: `${(frame / total) * 100}%`,
        background: C.bal,
      }}
    />
  );
}

/** Spring 0 → 1 (with a little overshoot when `bouncy`), starting at `delay`. */
function useIn(delay = 0, bouncy = false) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: bouncy ? { damping: 11, stiffness: 160 } : { damping: 200 },
  });
}

/** Scale pulse on every beat, for things that should feel alive. */
function useBeatPulse(strength = 0.04) {
  const frame = useCurrentFrame();
  return 1 + strength * Math.exp(-(frame % BEAT_FRAMES) / 3);
}

function Rise({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const p = useIn(delay);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 40}px)`, ...style }}>
      {children}
    </div>
  );
}

/**
 * Kinetic heading: words punch in one by one; `accent` words turn orange.
 * `instant`: the hook. The whole heading is readable on frame 0, with a short punch.
 */
function Words({
  text,
  size,
  delay = 0,
  color = C.inkt,
  accent = [],
  stagger = 2,
  instant = false,
}: {
  text: string;
  size: number;
  delay?: number;
  color?: string;
  accent?: string[];
  stagger?: number;
  instant?: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = instant
    ? interpolate(frame, [0, 9], [1.06, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
    : 1;
  return (
    <div
      style={{
        transform: `scale(${punch})`,
        transformOrigin: 'left top',
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        color,
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: size * 0.26,
      }}
    >
      {text.split(' ').map((word, index) => {
        const p = instant
          ? 1
          : spring({
              frame: frame - delay - index * stagger,
              fps,
              config: { damping: 12, stiffness: 180 },
            });
        return (
          <span
            key={`${word}-${index}`}
            style={{
              display: 'inline-block',
              opacity: Math.min(1, p * 1.5),
              transform: `translateY(${(1 - p) * 0.6 * size}px) scale(${0.6 + 0.4 * p}) rotate(${(1 - p) * -10}deg)`,
              color: accent.includes(word) ? C.bal : undefined,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

function Body({
  children,
  size,
  color = C.inkt,
}: {
  children: ReactNode;
  size: number;
  color?: string;
}) {
  return (
    <div style={{ fontFamily: FONT_BODY, fontSize: size, lineHeight: 1.3, color }}>
      {children}
    </div>
  );
}

/** Pill that pops in with overshoot and a pop sound. */
function PopPill({
  children,
  delay,
  size,
  tilt = -3,
  sound = 'pop',
}: {
  children: ReactNode;
  delay: number;
  size: number;
  tilt?: number;
  sound?: SfxName;
}) {
  const p = useIn(delay, true);
  return (
    <>
      <Sfx name={sound} at={delay} />
      <div
        style={{
          alignSelf: 'flex-start',
          opacity: Math.min(1, p * 2),
          transform: `scale(${p}) rotate(${tilt * p}deg)`,
          transformOrigin: 'left center',
        }}
      >
        <Pill style={{ fontSize: size, padding: `${size * 0.22}px ${size * 0.6}px` }}>
          {children}
        </Pill>
      </div>
    </>
  );
}

function Chip({ children, size }: { children: ReactNode; size: number }) {
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        borderRadius: 999,
        background: C.veldblauw,
        color: C.wit,
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        padding: `${size * 0.25}px ${size * 0.75}px`,
      }}
    >
      {children}
    </div>
  );
}

function Corner({ dark = false }: { dark?: boolean }) {
  const { pad, small, portrait } = useLayout();
  const position = portrait ? { top: pad * 0.6 } : { bottom: pad * 0.7 };
  return (
    <div style={{ position: 'absolute', left: pad, ...position }}>
      <SiteName size={small * 0.85} color={dark ? C.wit : C.veldblauw} />
    </div>
  );
}

/** Two columns on landscape, stacked on portrait. */
function Split({ text, visual }: { text: ReactNode; visual: ReactNode }) {
  const { portrait, pad } = useLayout();
  return (
    <AbsoluteFill
      style={{
        padding: pad,
        paddingBottom: portrait ? PORTRAIT_SAFE_BOTTOM : pad * 1.6,
        display: 'flex',
        flexDirection: portrait ? 'column' : 'row',
        alignItems: portrait ? 'stretch' : 'center',
        justifyContent: portrait ? 'flex-start' : 'space-between',
        gap: portrait ? 40 : 60,
      }}
    >
      <div
        style={{
          flex: portrait ? '0 0 auto' : '1 1 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          paddingTop: portrait ? 70 : 0,
        }}
      >
        {text}
      </div>
      <div
        style={{
          flex: '1 1 0',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        {visual}
      </div>
      <Corner />
    </AbsoluteFill>
  );
}

/* ---------- scenes ---------- */

function IntroScene() {
  const { pad, h1, small, portrait, width, height } = useLayout();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // A big stick swings and sends the ball flying: the hook of the video.
  const swing = spring({ frame, fps, config: { damping: 14, stiffness: 220 } });
  const angle = interpolate(swing, [0, 1], [-70, 12]);
  const hit = 7;
  const fly = Math.max(0, frame - hit);
  const stickSize = portrait ? 520 : 440;
  // Ball starts at the hook and flies left, across the heading.
  const ballStartX = stickSize * 0.26;
  const ballStartY = stickSize * 0.82;
  const ballX = ballStartX - fly * fly * 3.2 - fly * 40;
  const ballY = ballStartY - fly * 16;
  const chips = EXAMPLES.map((example) => `${formatMeters(example.heightCm)} m?`);
  return (
    <AbsoluteFill style={{ padding: pad, justifyContent: 'center', gap: 44 }}>
      <Sfx name="whoosh" at={2} />
      <Sfx name="thud" at={hit} />
      <div
        style={{
          position: 'absolute',
          right: portrait ? -40 : pad,
          bottom: portrait ? PORTRAIT_SAFE_BOTTOM - 40 : pad * 0.4,
          width: stickSize,
          height: stickSize,
        }}
      >
        <svg width={stickSize} height={stickSize} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
          <g transform={`rotate(${angle} 58 10)`}>
            <path
              d="M58 10 L58 67 C58 82 50 88 40 85"
              fill="none"
              stroke={C.wit}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M53 22 L63 21 M53 28 L63 27"
              stroke={C.veldblauw}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        </svg>
        {ballX > -width - 200 && ballY > -height && (
          <div
            style={{
              position: 'absolute',
              left: ballX,
              top: ballY,
              width: 44,
              height: 44,
              borderRadius: 22,
              background: C.bal,
              boxShadow: frame >= hit ? `${Math.min(fly * 12, 90)}px 0 0 -10px ${C.bal}55` : 'none',
            }}
          />
        )}
      </div>
      <Words
        text="Is de stick van je kind te lang?"
        size={h1 * 1.15}
        color={C.wit}
        accent={['lang?']}
        instant
      />
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
        {chips.map((chip, index) => (
          <PopPill key={chip} delay={b(1.5) + index * 4} size={small * 1.25} tilt={index % 2 ? 3 : -3}>
            {chip}
          </PopPill>
        ))}
      </div>
    </AbsoluteFill>
  );
}

function MeasureScene() {
  const { h2, body, small, figure } = useLayout();
  const grow = useIn(b(1));
  const heightCm = 150;
  return (
    <Split
      text={
        <>
          <Chip size={small}>Stap 1</Chip>
          <Words text="Meet de lengte zonder schoenen." size={h2} accent={['zonder', 'schoenen.']} />
          <Rise delay={b(2)}>
            <Body size={body}>Daarna zoek je de maat die erbij hoort.</Body>
          </Rise>
        </>
      }
      visual={
        <Figure
          heightCm={heightCm}
          personProgress={grow}
          ruler={grow}
          sticks={[]}
          height={figure}
        />
      }
    />
  );
}

function ExampleScene({ example, index }: { example: Example; index: number }) {
  const { h1, body, small, figure } = useLayout();
  const frame = useCurrentFrame();
  const grow = useIn(2);
  const dropAt = b(2.5);
  const drop = useIn(dropAt, true);
  const ballAt = b(4);
  const ball = interpolate(frame, [ballAt, ballAt + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const check = useIn(ballAt + 10, true);
  const cm = Math.round(example.drawnInch * CM_PER_INCH);
  const shown = interpolate(grow, [0, 1], [0, example.heightCm]);
  return (
    <Split
      text={
        <>
          <Chip size={small}>
            Voorbeeld {index + 1}/{EXAMPLES.length}
          </Chip>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: h1 * 1.3,
              lineHeight: 1,
              color: C.inkt,
              letterSpacing: '-0.03em',
            }}
          >
            {formatMeters(shown)} m
          </div>
          <PopPill delay={b(2)} size={h1 * 0.62}>
            {sizesLabel(example.sizes)}
          </PopPill>
          <Rise delay={b(3.5)}>
            <Body size={body * 0.8} color={C.lijngrijs}>
              {example.sizes.length > 1
                ? `Twee maten kunnen passen. Getekend: ${formatInch(example.drawnInch)} inch, ca. ${cm} cm.`
                : `Dat is ca. ${cm} cm stick.`}
            </Body>
          </Rise>
          <Sfx name="thud" at={dropAt + 7} />
          <Sfx name="pop" at={ballAt + 10} />
        </>
      }
      visual={
        <Figure
          heightCm={example.heightCm}
          personProgress={grow}
          ruler={grow}
          ball={ball}
          sticks={[
            {
              inch: example.drawnInch,
              drop,
              color: C.veldblauw,
              mark: { kind: 'check', progress: check },
            },
          ]}
          height={figure}
        />
      }
    />
  );
}

function TableScene() {
  const { pad, h2, small } = useLayout();
  const frame = useCurrentFrame();
  const highlightRow = rowIndexFor(DOUBT_HEIGHT_CM);
  const rowsIn = 6;
  const scanStart = rowsIn + TABLE_ROWS.length * 2 + b(2);
  const scan = interpolate(frame, [scanStart, scanStart + 20], [0, highlightRow], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const rowSize = small * 1.1;
  const rowHeight = rowSize * 1.45;
  const settled = frame > scanStart + 20;
  return (
    <AbsoluteFill style={{ padding: pad, paddingTop: pad * 0.7, gap: 22 }}>
      <Words text="De hele tabel" size={h2 * 0.85} accent={['tabel']} />
      <div style={{ position: 'relative', fontFamily: FONT_BODY, fontSize: rowSize, color: C.inkt }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            columnGap: 40,
            height: rowHeight,
            alignItems: 'center',
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
            color: C.veldblauw,
          }}
        >
          <div>Lichaamslengte</div>
          <div>Sticklengte</div>
          <div>Kan ook passen</div>
        </div>
        {frame >= scanStart && (
          <div
            style={{
              position: 'absolute',
              left: -20,
              right: -20,
              top: rowHeight * (1 + scan),
              height: rowHeight,
              borderRadius: 14,
              background: C.bal,
              opacity: 0.9,
              transform: `scale(${settled ? beatPulseAt(frame) : 1})`,
            }}
          />
        )}
        {TABLE_ROWS.map((row, index) => {
          const appear = interpolate(frame, [rowsIn + index * 2, rowsIn + index * 2 + 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.back(1.6)),
          });
          return (
            <div
              key={row.height}
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                columnGap: 40,
                height: rowHeight,
                alignItems: 'center',
                opacity: Math.min(1, appear),
                transform: `translateX(${(1 - appear) * 120}px)`,
              }}
            >
              <div>{row.height}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }}>{row.size}</div>
              <div>{row.alsoFits}</div>
            </div>
          );
        })}
      </div>
      <Sfx name="ding" at={scanStart + 20} />
      <Rise delay={scanStart + 24}>
        <Body size={small * 0.85} color={C.lijngrijs}>
          Onze richtlijn, geen officiële norm. Maattabellen van merken verschillen.
        </Body>
      </Rise>
    </AbsoluteFill>
  );
}

function beatPulseAt(frame: number) {
  return 1 + 0.015 * Math.exp(-(frame % BEAT_FRAMES) / 3);
}

function DoubtScene() {
  const { h2, body, figure } = useLayout();
  const frame = useCurrentFrame();
  const goodAt = b(1);
  const longAt = b(2);
  const nopeAt = b(3.5);
  const checkAt = b(5);
  const good = useIn(goodAt, true);
  const long = useIn(longAt, true);
  const cross = useIn(nopeAt, true);
  const check = useIn(checkAt, true);
  const shakeT = frame - nopeAt;
  const shake = shakeT >= 0 && shakeT < 12 ? Math.sin(shakeT * 1.9) * 14 * (1 - shakeT / 12) : 0;
  const tooLong = sizeStepsUp(DOUBT_HEIGHT_CM, 2);
  return (
    <Split
      text={
        <>
          <Words text="Twijfel? Kies de kortere." size={h2} accent={['kortere.']} />
          <Rise delay={b(2.5)}>
            <Body size={body}>
              Koop een kinderstick niet op de groei. Met een te lange stick worden aannemen en
              dribbelen lastiger.
            </Body>
          </Rise>
          <Rise delay={checkAt}>
            <Body size={body * 0.8} color={C.lijngrijs}>
              {formatMeters(DOUBT_HEIGHT_CM)} m: {formatInch(DOUBT_INCH)} inch past,{' '}
              {formatInch(tooLong)} inch is te lang.
            </Body>
          </Rise>
          <Sfx name="thud" at={goodAt + 7} />
          <Sfx name="thud" at={longAt + 7} />
          <Sfx name="nope" at={nopeAt} />
          <Sfx name="pop" at={checkAt} />
        </>
      }
      visual={
        <Figure
          heightCm={DOUBT_HEIGHT_CM}
          sticks={[
            {
              inch: DOUBT_INCH,
              drop: good,
              color: C.veldblauw,
              mark: { kind: 'check', progress: check },
            },
            {
              inch: tooLong,
              drop: long,
              color: C.lijngrijs,
              shake,
              mark: { kind: 'cross', progress: cross },
            },
          ]}
          height={figure}
        />
      }
    />
  );
}

function AdultScene() {
  const { pad, h2, body, small } = useLayout();
  return (
    <AbsoluteFill style={{ padding: pad, justifyContent: 'center', gap: 34 }}>
      <Words text="En volwassenen?" size={h2} accent={['volwassenen?']} />
      {ADULT_ROWS.map((row, index) => (
        <Rise key={row.height} delay={b(1.5 + index)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Body size={body}>{row.height}</Body>
            <PopPill delay={b(1.5 + index) + 3} size={body * 0.9} tilt={index % 2 ? 2 : -2}>
              {row.size}
            </PopPill>
          </div>
        </Rise>
      ))}
      <Rise delay={b(5)}>
        <Body size={small} color={C.lijngrijs}>
          Langer is niet vanzelf beter. Volgens de spelregels is een stick hooguit{' '}
          {FIH_MAX_STICK_CM} cm.
        </Body>
      </Rise>
      <Corner />
    </AbsoluteFill>
  );
}

function EndScene() {
  const { pad, h1, body, small, portrait } = useLayout();
  const frame = useCurrentFrame();
  const buttonAt = b(1.5);
  const button = useIn(buttonAt, true);
  const pulse = useBeatPulse(0.05);
  // The ball bounces on the button, once per beat.
  const bounce = Math.abs(Math.sin(((frame - buttonAt) / BEAT_FRAMES) * Math.PI));
  const buttonSize = h1 * 0.6;
  return (
    <AbsoluteFill style={{ padding: pad, justifyContent: 'center', gap: 44 }}>
      <Words
        text="Jouw maat én sticks die passen?"
        size={h1}
        color={C.wit}
        accent={['passen?']}
      />
      <Sfx name="ding" at={buttonAt} />
      <div
        style={{
          position: 'relative',
          alignSelf: 'flex-start',
          transform: `scale(${button * (frame > buttonAt + 10 ? pulse : 1)})`,
          transformOrigin: 'left center',
        }}
      >
        <Pill style={{ fontSize: buttonSize, padding: `${buttonSize * 0.32}px ${buttonSize * 0.8}px` }}>
          Doe de stickwijzer →
        </Pill>
        {frame > buttonAt + 6 && (
          <div
            style={{
              position: 'absolute',
              // Bounces next to the button, never over the heading.
              right: -buttonSize * 1.05,
              top: buttonSize * 0.94 - bounce * buttonSize * 0.9,
              width: buttonSize * 0.7,
              height: buttonSize * 0.7,
              borderRadius: '50%',
              background: C.wit,
              border: `${buttonSize * 0.1}px solid ${C.bal}`,
            }}
          />
        )}
      </div>
      <Rise delay={b(3)}>
        <Body size={body} color={C.nlNegatief}>
          Gratis, zonder account, op jouwhockeystick.nl
        </Body>
      </Rise>
      {/* Follow call: once, under the button (docs/video.md §7a). */}
      <Rise delay={b(4)}>
        <div
          style={{
            alignSelf: 'flex-start',
            display: 'inline-block',
            border: `4px solid ${C.wit}`,
            borderRadius: 999,
            padding: `${small * 0.35}px ${small * 0.9}px`,
            fontFamily: FONT_BODY,
            fontWeight: 600,
            fontSize: small * 1.1,
            color: C.wit,
          }}
        >
          + Volg voor meer stick-tips
        </div>
      </Rise>
      <div
        style={{
          position: 'absolute',
          left: pad,
          bottom: portrait ? PORTRAIT_SAFE_BOTTOM : pad * 0.7,
        }}
      >
        <SiteName size={small} />
      </div>
    </AbsoluteFill>
  );
}
