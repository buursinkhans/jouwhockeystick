import type { CSSProperties, ReactNode } from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { BrandIcon, C, FONT_BODY, FONT_DISPLAY, Pill, SiteName } from '../brand';
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
  sizeStepsUp,
  sizesLabel,
  type Example,
} from './data';
import { Figure } from './Figure';

export type Variant = 'short' | 'uitleg';
export type LengteProps = { variant: Variant };

export const FPS = 30;

type Scene = { id: string; seconds: number; render: () => ReactNode };

function scenesFor(variant: Variant): Scene[] {
  const long = variant === 'uitleg';
  const examples = EXAMPLES.map<Scene>((example, index) => ({
    id: `voorbeeld-${index}`,
    seconds: long ? 5 : 4.5,
    render: () => <ExampleScene example={example} index={index} />,
  }));
  return [
    { id: 'intro', seconds: long ? 4 : 3.5, render: () => <IntroScene /> },
    { id: 'meten', seconds: long ? 4.5 : 4, render: () => <MeasureScene /> },
    ...examples,
    ...(long
      ? [{ id: 'tabel', seconds: 12, render: () => <TableScene /> }]
      : []),
    { id: 'twijfel', seconds: long ? 6.5 : 5.5, render: () => <DoubtScene /> },
    ...(long
      ? [{ id: 'volwassenen', seconds: 7, render: () => <AdultScene /> }]
      : []),
    { id: 'slot', seconds: long ? 6 : 5, render: () => <EndScene /> },
  ];
}

export function durationInFrames(variant: Variant): number {
  return scenesFor(variant).reduce(
    (total, scene) => total + Math.round(scene.seconds * FPS),
    0,
  );
}

export function LengteVideo({ variant }: LengteProps) {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: C.krijt }}>
      {scenesFor(variant).map((scene) => {
        const frames = Math.round(scene.seconds * FPS);
        const start = from;
        from += frames;
        return (
          <Sequence key={scene.id} from={start} durationInFrames={frames}>
            <SceneFade frames={frames}>{scene.render()}</SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

/* ---------- layout helpers ---------- */

function useLayout() {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return {
    portrait,
    width,
    height,
    pad: portrait ? 90 : 110,
    h1: portrait ? 104 : 92,
    h2: portrait ? 76 : 66,
    body: portrait ? 50 : 42,
    small: portrait ? 34 : 30,
  };
}

function SceneFade({ frames, children }: { frames: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, frames - 8, frames], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
}

/** 0 → 1 with a soft spring, starting at `delay` frames. */
function useIn(delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200 } });
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
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Heading({
  children,
  size,
  color = C.inkt,
}: {
  children: ReactNode;
  size: number;
  color?: string;
}) {
  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        color,
      }}
    >
      {children}
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
    <div
      style={{
        fontFamily: FONT_BODY,
        fontSize: size,
        lineHeight: 1.3,
        color,
      }}
    >
      {children}
    </div>
  );
}

// Shorts, Reels and TikTok cover the bottom ~20% and the right edge with
// their own buttons, so on portrait the brand line sits at the top and the
// visuals stop well above the bottom.
const PORTRAIT_SAFE_BOTTOM = 400;

function Corner() {
  const { pad, small, portrait } = useLayout();
  const position = portrait
    ? { top: pad * 0.6 }
    : { bottom: pad * 0.7 };
  return (
    <div style={{ position: 'absolute', left: pad, ...position }}>
      <SiteName size={small * 0.85} color={C.veldblauw} />
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
          paddingTop: portrait ? 60 : 0,
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
  const { pad, h1, body, portrait } = useLayout();
  const pop = useIn(0);
  return (
    <AbsoluteFill
      style={{
        background: C.veldblauw,
        padding: pad,
        justifyContent: 'center',
        gap: 48,
      }}
    >
      <div style={{ transform: `scale(${0.6 + pop * 0.4})`, opacity: pop, transformOrigin: 'left center' }}>
        <BrandIcon size={portrait ? 190 : 150} />
      </div>
      <Rise delay={6}>
        <Heading size={h1 * 1.1} color={C.wit}>
          Welke lengte hockeystick past bij je kind?
        </Heading>
      </Rise>
      <Rise delay={14}>
        <Body size={body} color={C.nlNegatief}>
          De juiste maat in een paar seconden.
        </Body>
      </Rise>
    </AbsoluteFill>
  );
}

function MeasureScene() {
  const { h2, body, height } = useLayout();
  const grow = useIn(6);
  const heightCm = 140;
  return (
    <Split
      text={
        <>
          <Rise>
            <Pill style={{ fontSize: body * 0.7, padding: '10px 26px' }}>
              Stap 1
            </Pill>
          </Rise>
          <Rise delay={4}>
            <Heading size={h2}>Meet de lengte zonder schoenen.</Heading>
          </Rise>
          <Rise delay={12}>
            <Body size={body}>Daarna zoek je de maat die erbij hoort.</Body>
          </Rise>
        </>
      }
      visual={
        <div style={{ position: 'relative' }}>
          <Figure
            heightCm={heightCm}
            personProgress={grow}
            sticks={[]}
            height={height * 0.52}
          />
        </div>
      }
    />
  );
}

function ExampleScene({ example, index }: { example: Example; index: number }) {
  const { h1, body, small, height } = useLayout();
  const stick = useIn(10);
  const label = useIn(16);
  const cm = Math.round(example.drawnInch * CM_PER_INCH);
  return (
    <Split
      text={
        <>
          <Rise>
            <Body size={small} color={C.lijngrijs}>
              Voorbeeld {index + 1} van {EXAMPLES.length}
            </Body>
          </Rise>
          <Rise delay={2}>
            <Heading size={h1}>{formatMeters(example.heightCm)} m</Heading>
          </Rise>
          <div style={{ opacity: label, transform: `scale(${0.85 + label * 0.15})`, transformOrigin: 'left center' }}>
            <Pill style={{ fontSize: h1 * 0.62, padding: '14px 36px' }}>
              {sizesLabel(example.sizes)}
            </Pill>
          </div>
          <Rise delay={22}>
            <Body size={body * 0.8} color={C.lijngrijs}>
              {example.sizes.length > 1
                ? `Twee maten kunnen passen. Getekend: ${formatInch(example.drawnInch)} inch, ca. ${cm} cm.`
                : `Dat is ca. ${cm} cm stick.`}
            </Body>
          </Rise>
        </>
      }
      visual={
        <Figure
          heightCm={example.heightCm}
          sticks={[{ inch: example.drawnInch, progress: stick, color: C.veldblauw }]}
          height={height * 0.5}
        />
      }
    />
  );
}

function TableScene() {
  const { pad, h2, small } = useLayout();
  const frame = useCurrentFrame();
  const rowSize = small * 1.02;
  return (
    <AbsoluteFill style={{ padding: pad, paddingTop: pad * 0.7, gap: 26 }}>
      <Rise>
        <Heading size={h2 * 0.85}>De hele tabel</Heading>
      </Rise>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          columnGap: 40,
          rowGap: 6,
          fontFamily: FONT_BODY,
          fontSize: rowSize,
          color: C.inkt,
        }}
      >
        {['Lichaamslengte', 'Sticklengte', 'Kan ook passen'].map((title) => (
          <div
            key={title}
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              color: C.veldblauw,
              paddingBottom: 6,
            }}
          >
            {title}
          </div>
        ))}
        {TABLE_ROWS.flatMap((row, index) => {
          const opacity = interpolate(frame, [10 + index * 5, 22 + index * 5], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.quad),
          });
          return [row.height, row.size, row.alsoFits].map((cell, column) => (
            <div
              key={`${index}-${column}`}
              style={{
                opacity,
                fontWeight: column === 1 ? 800 : 400,
                fontFamily: column === 1 ? FONT_DISPLAY : FONT_BODY,
              }}
            >
              {cell}
            </div>
          ));
        })}
      </div>
      <Rise delay={80}>
        <Body size={small * 0.85} color={C.lijngrijs}>
          Onze richtlijn, geen officiële norm. Maattabellen van merken verschillen.
        </Body>
      </Rise>
    </AbsoluteFill>
  );
}

function DoubtScene() {
  const { h2, body, height } = useLayout();
  const good = useIn(4);
  const long = useIn(16);
  const cross = useIn(36);
  const tooLong = sizeStepsUp(DOUBT_HEIGHT_CM, 2);
  return (
    <Split
      text={
        <>
          <Rise>
            <Heading size={h2}>Twijfel? Kies de kortere.</Heading>
          </Rise>
          <Rise delay={14}>
            <Body size={body}>
              Koop een kinderstick niet op de groei. Met een te lange stick worden
              aannemen en dribbelen lastiger.
            </Body>
          </Rise>
          <Rise delay={30}>
            <Body size={body * 0.8} color={C.lijngrijs}>
              {formatMeters(DOUBT_HEIGHT_CM)} m: {formatInch(DOUBT_INCH)} inch past,{' '}
              {formatInch(tooLong)} inch is te lang.
            </Body>
          </Rise>
        </>
      }
      visual={
        <Figure
          heightCm={DOUBT_HEIGHT_CM}
          sticks={[
            { inch: DOUBT_INCH, progress: good, color: C.veldblauw },
            { inch: tooLong, progress: long, color: C.lijngrijs, crossed: cross },
          ]}
          height={height * 0.5}
        />
      }
    />
  );
}

function AdultScene() {
  const { pad, h2, body, small } = useLayout();
  return (
    <AbsoluteFill style={{ padding: pad, justifyContent: 'center', gap: 36 }}>
      <Rise>
        <Heading size={h2}>En volwassenen?</Heading>
      </Rise>
      {ADULT_ROWS.map((row, index) => (
        <Rise key={row.height} delay={10 + index * 10}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Body size={body}>{row.height}</Body>
            <Pill style={{ fontSize: body * 0.9, padding: '8px 28px' }}>
              {row.size}
            </Pill>
          </div>
        </Rise>
      ))}
      <Rise delay={50}>
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
  return (
    <AbsoluteFill
      style={{
        background: C.veldblauw,
        padding: pad,
        justifyContent: 'center',
        gap: 44,
      }}
    >
      <Rise>
        <Heading size={h1} color={C.wit}>
          Jouw maat én sticks die passen?
        </Heading>
      </Rise>
      <Rise delay={8}>
        <Pill style={{ fontSize: h1 * 0.55, padding: '18px 44px' }}>
          Doe de stickwijzer
        </Pill>
      </Rise>
      <Rise delay={16}>
        <Body size={body} color={C.nlNegatief}>
          Gratis, zonder account, op jouwhockeystick.nl
        </Body>
      </Rise>
      <div style={{ position: 'absolute', left: pad, bottom: portrait ? PORTRAIT_SAFE_BOTTOM : pad * 0.7 }}>
        <SiteName size={small} />
      </div>
    </AbsoluteFill>
  );
}
