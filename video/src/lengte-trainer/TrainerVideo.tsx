import type { ReactNode } from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { LENGTH_GUIDE } from '../../../src/advice-engine/sizeAdvice';
import { C, FONT_BODY, FONT_DISPLAY, Pill, SiteName } from '../brand';
import { bandFor } from '../lengte/data';
import { Figure } from '../lengte/Figure';
import {
  Body,
  Chip,
  FPS,
  PORTRAIT_SAFE_BOTTOM,
  PopPill,
  Rise,
  SceneShell,
  Sfx,
  Split,
  Words,
  b,
  useBeatPulse,
  useIn,
  useLayout,
} from '../lengte/LengteVideo';
import {
  CAPTIONS,
  COMPACT_ROWS,
  COMPARE_HEIGHT_CM,
  TAKES,
  TRAINER_CLIP,
  TRAINER_CLIP_READY,
} from './data';

export type TrainerProps = { music: boolean };

type Scene = {
  id: string;
  frames: number;
  dark?: boolean;
  /** The AI presenter is on screen and speaking. */
  trainer?: boolean;
  render: () => ReactNode;
};

const takeFrames = (take: { from: number; to: number }) => Math.round((take.to - take.from) * FPS);

function scenes(): Scene[] {
  return [
    {
      id: 'intro',
      frames: takeFrames(TAKES.intro),
      trainer: true,
      render: () => (
        <TrainerScene take={TAKES.intro} captions={CAPTIONS.intro}>
          <Hook />
        </TrainerScene>
      ),
    },
    { id: 'lang-kort', frames: b(14), render: () => <LongShortScene /> },
    { id: 'tabel', frames: b(20), render: () => <CompactTableScene /> },
    { id: 'houding', frames: b(12), render: () => <PostureScene /> },
    {
      id: 'outro',
      frames: takeFrames(TAKES.outro),
      trainer: true,
      render: () => <TrainerScene take={TAKES.outro} captions={CAPTIONS.outro} />,
    },
    { id: 'eindkaart', frames: b(8), dark: true, render: () => <EndCard /> },
  ];
}

export function trainerDurationInFrames(): number {
  return scenes().reduce((total, scene) => total + scene.frames, 0);
}

export function TrainerVideo({ music }: TrainerProps) {
  const list = scenes();
  const total = trainerDurationInFrames();
  // Music sits low while the trainer speaks.
  const ranges = list.reduce<{ from: number; to: number; trainer: boolean }[]>((acc, scene) => {
    const from = acc.at(-1)?.to ?? 0;
    acc.push({ from, to: from + scene.frames, trainer: scene.trainer ?? false });
    return acc;
  }, []);
  const musicVolume = (f: number) => {
    const range = ranges.find((r) => f >= r.from && f < r.to);
    const level = range?.trainer ? 0.12 : 0.55;
    return interpolate(f, [0, 6, total - 30, total], [0, level, level, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  };
  return (
    <AbsoluteFill style={{ background: C.krijt }}>
      {list.map((scene, index) => {
        const range = ranges[index];
        if (!range) return null;
        return (
          <Sequence key={scene.id} from={range.from} durationInFrames={scene.frames}>
            <SceneShell
              frames={scene.frames}
              dark={scene.dark ?? false}
              wipeIn={index > 0}
              wipeOut={index < list.length - 1}
            >
              {scene.render()}
            </SceneShell>
          </Sequence>
        );
      })}
      <AiLabel />
      <Progress total={total} />
      {music && <Audio src={staticFile('video/muziek.mp3')} volume={musicVolume} />}
    </AbsoluteFill>
  );
}

/* ---------- shared pieces ---------- */

function Progress({ total }: { total: number }) {
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

/** EU AI Act art. 50 and docs/video.md §9: the presenter is labelled in every scene. */
function AiLabel() {
  const { pad, small } = useLayout();
  return (
    <div
      style={{
        position: 'absolute',
        right: pad * 0.6,
        top: pad * 0.6,
        borderRadius: 999,
        background: 'rgba(13, 27, 46, 0.72)',
        color: C.wit,
        fontFamily: FONT_BODY,
        fontWeight: 600,
        fontSize: small * 0.7,
        padding: `${small * 0.2}px ${small * 0.55}px`,
      }}
    >
      Presentator gemaakt met AI
    </div>
  );
}

/** Captions for the spoken take, one sentence at a time, timed by word count. */
function Captions({ lines, frames }: { lines: readonly string[]; frames: number }) {
  const frame = useCurrentFrame();
  const { pad, body } = useLayout();
  const words = lines.map((line) => line.split(' ').length);
  const totalWords = words.reduce((sum, n) => sum + n, 0);
  let start = 0;
  const timed = lines.map((line, index) => {
    const length = ((words[index] ?? 0) / totalWords) * frames;
    const item = { line, from: start, to: start + length };
    start += length;
    return item;
  });
  const current = timed.find((item) => frame >= item.from && frame < item.to) ?? timed.at(-1);
  if (!current) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: pad,
        right: pad * 1.6,
        bottom: PORTRAIT_SAFE_BOTTOM + 30,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: C.inkt,
          color: C.wit,
          borderRadius: 18,
          padding: `${body * 0.3}px ${body * 0.55}px`,
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: body,
          lineHeight: 1.25,
          textAlign: 'center',
        }}
      >
        {current.line}
      </div>
    </div>
  );
}

function TrainerScene({
  take,
  captions,
  children,
}: {
  take: { from: number; to: number };
  captions: readonly string[];
  children?: ReactNode;
}) {
  const frames = takeFrames(take);
  return (
    <AbsoluteFill>
      {TRAINER_CLIP_READY ? (
        <OffthreadVideo
          src={staticFile(TRAINER_CLIP)}
          startFrom={Math.round(take.from * FPS)}
          endAt={Math.round(take.to * FPS)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <TrainerPlaceholder />
      )}
      {children}
      <Captions lines={captions} frames={frames} />
    </AbsoluteFill>
  );
}

/** Stands in for the Synthesia clip until it is added. */
function TrainerPlaceholder() {
  const { body } = useLayout();
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${C.veldblauw} 0%, ${C.inkt} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          border: `4px dashed ${C.nlNegatief}`,
          borderRadius: 24,
          padding: body * 0.6,
          color: C.nlNegatief,
          fontFamily: FONT_BODY,
          fontWeight: 600,
          fontSize: body,
          textAlign: 'center',
        }}
      >
        Hier komt Daan
        <br />
        (clip uit Synthesia)
      </div>
    </AbsoluteFill>
  );
}

/** The hook: readable in full on frame 0 (docs/video.md §7a). */
function Hook() {
  const { pad, h1 } = useLayout();
  return (
    <div
      style={{
        position: 'absolute',
        left: pad * 0.6,
        right: pad * 0.6,
        top: pad * 1.4,
        background: C.krijt,
        borderRadius: 32,
        padding: `${pad * 0.45}px ${pad * 0.5}px`,
        boxShadow: '0 12px 40px rgba(13, 27, 46, 0.25)',
      }}
    >
      <Words text="Welke sticklengte past bij je kind?" size={h1 * 0.95} accent={['kind?']} instant />
    </div>
  );
}

/* ---------- scenes ---------- */

function stepFrom(heightCm: number, steps: number): number {
  const index = LENGTH_GUIDE.indexOf(bandFor(heightCm));
  const band = LENGTH_GUIDE[Math.max(0, Math.min(index + steps, LENGTH_GUIDE.length - 1))];
  return Math.min(...(band ?? bandFor(heightCm)).sizes);
}

function LongShortScene() {
  const { h2, body, small, figure } = useLayout();
  const frame = useCurrentFrame();
  const goodInch = Math.min(...bandFor(COMPARE_HEIGHT_CM).sizes);
  const longInch = stepFrom(COMPARE_HEIGHT_CM, 2);
  const shortInch = stepFrom(COMPARE_HEIGHT_CM, -2);
  const longAt = b(1);
  const shortAt = b(3.5);
  const goodAt = b(6);
  const nope1 = b(2.2);
  const nope2 = b(4.7);
  const long = useIn(longAt, true);
  const short = useIn(shortAt, true);
  const good = useIn(goodAt, true);
  const cross1 = useIn(nope1, true);
  const cross2 = useIn(nope2, true);
  const check = useIn(goodAt + 10, true);
  const shake = (at: number) => {
    const t = frame - at;
    return t >= 0 && t < 12 ? Math.sin(t * 1.9) * 14 * (1 - t / 12) : 0;
  };
  return (
    <Split
      text={
        <>
          <Chip size={small}>1. Begin bij je lichaamslengte</Chip>
          <Rise delay={longAt}>
            <Body size={body}>
              <b>Te lang:</b> aannemen en dribbelen lastiger
            </Body>
          </Rise>
          <Rise delay={shortAt}>
            <Body size={body}>
              <b>Te kort:</b> een krachtige slag lastiger
            </Body>
          </Rise>
          <Rise delay={goodAt}>
            <Words text="Kijk naar je lengte, niet je leeftijd." size={h2 * 0.8} accent={['lengte,']} />
          </Rise>
          <Sfx name="thud" at={longAt + 7} />
          <Sfx name="nope" at={nope1} />
          <Sfx name="thud" at={shortAt + 7} />
          <Sfx name="nope" at={nope2} />
          <Sfx name="pop" at={goodAt + 10} />
        </>
      }
      visual={
        <Figure
          heightCm={COMPARE_HEIGHT_CM}
          sticks={[
            { inch: goodInch, drop: good, color: C.veldblauw, mark: { kind: 'check', progress: check } },
            {
              inch: longInch,
              drop: long,
              color: C.lijngrijs,
              shake: shake(nope1),
              mark: { kind: 'cross', progress: cross1 },
            },
            {
              inch: shortInch,
              drop: short,
              color: C.lijngrijs,
              shake: shake(nope2),
              mark: { kind: 'cross', progress: cross2 },
            },
          ]}
          height={figure * 0.9}
        />
      }
    />
  );
}

function CompactTableScene() {
  const { pad, h2, small } = useLayout();
  const frame = useCurrentFrame();
  const rowsIn = 8;
  const rowSize = small * 1.35;
  const rowHeight = rowSize * 1.7;
  return (
    <AbsoluteFill style={{ padding: pad, paddingTop: pad * 1.6, paddingBottom: PORTRAIT_SAFE_BOTTOM, gap: 26 }}>
      <Words text="Zoek je lengte op" size={h2} accent={['lengte']} />
      <Body size={small} color={C.lijngrijs}>
        Meet zonder schoenen. Twijfel? Kies bij een kind de kortere.
      </Body>
      <div style={{ fontFamily: FONT_BODY, fontSize: rowSize, color: C.inkt }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            height: rowHeight,
            alignItems: 'center',
            padding: '0 28px',
            borderRadius: 16,
            background: C.veldblauw,
            color: C.wit,
            fontFamily: FONT_DISPLAY,
            fontWeight: 800,
          }}
        >
          <div>Lichaamslengte</div>
          <div>Sticklengte</div>
        </div>
        {COMPACT_ROWS.map((row, index) => {
          const at = rowsIn + index * 7;
          const appear = interpolate(frame, [at, at + 8], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.back(1.6)),
          });
          return (
            <div
              key={row.height}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                height: rowHeight,
                alignItems: 'center',
                padding: '0 28px',
                borderRadius: 12,
                background: index % 2 === 0 ? C.wit : C.krijt,
                opacity: Math.min(1, appear),
                transform: `translateX(${(1 - appear) * 120}px)`,
              }}
            >
              <div>{row.height}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }}>{row.size}</div>
            </div>
          );
        })}
      </div>
      {COMPACT_ROWS.map((row, index) => (
        <Sfx key={row.height} name="tick" at={rowsIn + index * 7} />
      ))}
      <Rise delay={rowsIn + COMPACT_ROWS.length * 7 + 6}>
        <Body size={small * 0.8} color={C.lijngrijs}>
          Richtlijn van jouwhockeystick.nl, geen officiële norm. Je precieze maat: de stickwijzer.
        </Body>
      </Rise>
    </AbsoluteFill>
  );
}

function PostureScene() {
  const { body, small, figure } = useLayout();
  const frame = useCurrentFrame();
  const inch = Math.min(...bandFor(COMPARE_HEIGHT_CM).sizes);
  const drop = useIn(4, true);
  const ballAt = b(2);
  const ball = interpolate(frame, [ballAt, ballAt + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const check = useIn(ballAt + 12, true);
  return (
    <Split
      text={
        <>
          <Chip size={small}>2. Check je houding</Chip>
          <Rise delay={b(1)}>
            <Body size={body}>Ontspannen dribbelen, stick dicht bij je lichaam?</Body>
          </Rise>
          <PopPill delay={b(5)} size={body}>
            3. Niet op de groei kopen
          </PopPill>
          <Sfx name="pop" at={ballAt + 12} />
        </>
      }
      visual={
        <Figure
          heightCm={COMPARE_HEIGHT_CM}
          ball={ball}
          sticks={[{ inch, drop, color: C.veldblauw, mark: { kind: 'check', progress: check } }]}
          height={figure}
        />
      }
    />
  );
}

function EndCard() {
  const { pad, h1, body, small, portrait } = useLayout();
  const frame = useCurrentFrame();
  const buttonAt = b(1);
  const button = useIn(buttonAt, true);
  const pulse = useBeatPulse(0.05);
  const buttonSize = h1 * 0.6;
  return (
    <AbsoluteFill style={{ padding: pad, justifyContent: 'center', gap: 40 }}>
      <SiteName size={h1 * 0.55} />
      <Body size={body} color={C.nlNegatief}>
        Eerlijk stickadvies op maat
      </Body>
      <Sfx name="ding" at={buttonAt} />
      <div
        style={{
          alignSelf: 'flex-start',
          transform: `scale(${button * (frame > buttonAt + 10 ? pulse : 1)})`,
          transformOrigin: 'left center',
        }}
      >
        <Pill style={{ fontSize: buttonSize, padding: `${buttonSize * 0.32}px ${buttonSize * 0.8}px` }}>
          Doe de stickwijzer →
        </Pill>
      </div>
      {/* Follow call: once, under the button (docs/video.md §7a). */}
      <Rise delay={b(2.5)}>
        <div
          style={{
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
          + Volg voor 3 stick-tips per week
        </div>
      </Rise>
      {portrait && <div style={{ height: PORTRAIT_SAFE_BOTTOM * 0.5 }} />}
    </AbsoluteFill>
  );
}

