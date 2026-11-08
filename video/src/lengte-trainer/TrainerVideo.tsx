import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import { LENGTH_GUIDE } from '../../../src/advice-engine/sizeAdvice';
import { C, FONT_BODY, FONT_DISPLAY } from '../brand';
import { bandFor } from '../lengte/data';
import { Figure } from '../lengte/Figure';
import {
  Body,
  Chip,
  PORTRAIT_SAFE_BOTTOM,
  PopPill,
  Rise,
  Sfx,
  Split,
  Words,
  b,
  useIn,
  useLayout,
} from '../lengte/LengteVideo';
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
  COMPACT_ROWS,
  COMPARE_HEIGHT_CM,
  TAKES,
  TRAINER_CLIP,
  TRAINER_CLIP_READY,
} from './data';

export type TrainerProps = { music: boolean };

const HOOK = 'Welke sticklengte past bij je kind?';

function scenes(): TrainerSceneSpec[] {
  // Without the Synthesia clip the video still works: a text hook opens it and
  // the end card closes it, with no AI label (there is no presenter).
  const intro: TrainerSceneSpec = TRAINER_CLIP_READY
    ? {
        id: 'intro',
        frames: takeFrames(TAKES.intro),
        trainer: true,
        render: () => (
          <TrainerScene clip={TRAINER_CLIP} take={TAKES.intro} captions={CAPTIONS.intro}>
            <HookCard text={HOOK} accent={['kind?']} />
          </TrainerScene>
        ),
      }
    : {
        id: 'intro',
        frames: b(5),
        dark: true,
        render: () => (
          <TextHookScene text={HOOK} accent={['kind?']} sub="In 3 stappen: lengte, houding en niet op de groei." />
        ),
      };
  const outro: TrainerSceneSpec[] = TRAINER_CLIP_READY
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
    { id: 'lang-kort', frames: b(14), render: () => <LongShortScene /> },
    { id: 'tabel', frames: b(20), render: () => <CompactTableScene /> },
    { id: 'houding', frames: b(12), render: () => <PostureScene /> },
    ...outro,
    { id: 'eindkaart', frames: b(8), dark: true, render: () => <EndCard /> },
  ];
}

export function trainerDurationInFrames(): number {
  return totalFrames(scenes());
}

export function TrainerVideo({ music }: TrainerProps) {
  return <TrainerTimeline scenes={scenes()} music={music} ai={TRAINER_CLIP_READY} />;
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
