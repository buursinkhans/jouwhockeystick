// Shared pieces for the Shorts with AI trainer Daan (docs/video.md §9a).
// Every trainer video has the same frame: Daan's Synthesia clip for the
// opening and the close, scenes in our own style in between, the AI label in
// every scene, music that ducks while Daan speaks, and the end card.
import type { ReactNode } from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { C, FONT_BODY, Pill, SiteName } from '../brand';
import {
  Body,
  FPS,
  PORTRAIT_SAFE_BOTTOM,
  Rise,
  SceneShell,
  Sfx,
  Words,
  b,
  useBeatPulse,
  useIn,
  useLayout,
} from '../lengte/LengteVideo';

/** One take in a Synthesia clip, in seconds. */
export type Take = { from: number; to: number };

export const takeFrames = (take: Take) => Math.round((take.to - take.from) * FPS);

export type TrainerSceneSpec = {
  id: string;
  frames: number;
  dark?: boolean;
  /** The AI presenter is on screen and speaking. */
  trainer?: boolean;
  render: () => ReactNode;
};

export function totalFrames(list: TrainerSceneSpec[]): number {
  return list.reduce((total, scene) => total + scene.frames, 0);
}

/**
 * Plays the scenes in order with the brand wipe between them. `ai`: Daan is in
 * the video, so the AI label is on screen the whole time (EU AI Act art. 50).
 */
export function TrainerTimeline({
  scenes: list,
  music,
  ai,
}: {
  scenes: TrainerSceneSpec[];
  music: boolean;
  ai: boolean;
}) {
  const total = totalFrames(list);
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
      {ai && <AiLabel />}
      <Progress total={total} />
      {music && <Audio src={staticFile('video/muziek.mp3')} volume={musicVolume} />}
    </AbsoluteFill>
  );
}

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

/** Daan speaking one take of his clip, with the spoken words as captions. */
export function TrainerScene({
  clip,
  take,
  captions,
  children,
}: {
  clip: string;
  take: Take;
  captions: readonly string[];
  children?: ReactNode;
}) {
  const frames = takeFrames(take);
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(clip)}
        startFrom={Math.round(take.from * FPS)}
        endAt={Math.round(take.to * FPS)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {children}
      <Captions lines={captions} frames={frames} />
    </AbsoluteFill>
  );
}

/** The hook as a card over Daan: readable in full on frame 0 (docs/video.md §7a). */
export function HookCard({ text, accent }: { text: string; accent: string[] }) {
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
      <Words text={text} size={h1 * 0.95} accent={accent} instant />
    </div>
  );
}

/** Opening without Daan's clip: the hook on a dark scene, readable on frame 0. */
export function TextHookScene({ text, accent, sub }: { text: string; accent: string[]; sub: string }) {
  const { pad, h1, body } = useLayout();
  return (
    <AbsoluteFill style={{ padding: pad, justifyContent: 'center', gap: 40 }}>
      <Words text={text} size={h1 * 1.1} color={C.wit} accent={accent} instant />
      <Rise delay={b(1.5)}>
        <Body size={body} color={C.nlNegatief}>
          {sub}
        </Body>
      </Rise>
    </AbsoluteFill>
  );
}

export function EndCard() {
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

