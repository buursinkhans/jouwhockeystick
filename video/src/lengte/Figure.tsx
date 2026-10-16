import { C, FONT_DISPLAY } from '../brand';
import { CM_PER_INCH, formatMeters } from './data';

export type FigureStick = {
  inch: number;
  /** Spring value: 0 = above the frame, 1 = standing on the ground (may overshoot). */
  drop: number;
  color: string;
  /** 0–1 visibility of a check or cross badge next to the stick. */
  mark?: { kind: 'check' | 'cross'; progress: number };
  /** Horizontal shake in units, e.g. for "nope". */
  shake?: number;
};

const VIEW_H = 1000;
const GROUND = 960;
/** Scale: 200 cm of height fills 880 units. */
const UNITS_PER_CM = 4.4;

/**
 * A neutral player silhouette with a measuring ruler and one or more sticks,
 * all drawn to the same scale so the proportion between body and stick is real.
 */
export function Figure({
  heightCm,
  sticks,
  personProgress = 1,
  ruler = 0,
  ball,
  height,
}: {
  heightCm: number;
  sticks: FigureStick[];
  /** 0–1: the silhouette grows from the ground. */
  personProgress?: number;
  /** 0–1: the ruler and height label draw in, counting up with the person. */
  ruler?: number;
  /** 0–1: a ball rolls in from the right to the hook of the first stick. */
  ball?: number;
  /** Rendered height in px. */
  height: number;
}) {
  const h = heightCm * UNITS_PER_CM * personProgress;
  const headR = h * 0.068;
  const headCy = GROUND - h + headR;
  const shoulderY = headCy + headR + h * 0.02;
  const hipY = GROUND - h * 0.47;
  const torsoW = heightCm * UNITS_PER_CM * 0.25;
  const legW = torsoW * 0.4;
  const rulerX = 110;
  const cx = 300;
  const width = 420 + sticks.length * 130 + (ball !== undefined ? 120 : 0);
  const stickX = (index: number) => cx + torsoW / 2 + 95 + index * 130;

  return (
    <svg
      height={height}
      width={(height / VIEW_H) * width}
      viewBox={`0 0 ${width} ${VIEW_H}`}
      style={{ overflow: 'visible' }}
      aria-hidden
    >
      <line
        x1="0"
        x2={width}
        y1={GROUND + 6}
        y2={GROUND + 6}
        stroke={C.lijngrijs}
        strokeOpacity="0.35"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {ruler > 0 && (
        <g opacity={Math.min(1, ruler * 3)}>
          <line
            x1={rulerX}
            x2={rulerX}
            y1={GROUND}
            y2={GROUND - h}
            stroke={C.veldblauw}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {Array.from({ length: Math.floor(h / (10 * UNITS_PER_CM)) + 1 }, (_, i) => (
            <line
              key={i}
              x1={rulerX - (i % 5 === 0 ? 22 : 12)}
              x2={rulerX}
              y1={GROUND - i * 10 * UNITS_PER_CM}
              y2={GROUND - i * 10 * UNITS_PER_CM}
              stroke={C.veldblauw}
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
          <line
            x1={rulerX - 30}
            x2={cx}
            y1={GROUND - h}
            y2={GROUND - h}
            stroke={C.bal}
            strokeWidth="4"
            strokeDasharray="10 10"
          />
          <text
            x={rulerX - 34}
            y={GROUND - h - 22}
            fontFamily={FONT_DISPLAY}
            fontWeight={800}
            fontSize="54"
            fill={C.veldblauw}
          >
            {formatMeters(heightCm * personProgress)} m
          </text>
        </g>
      )}
      {h > 0 && (
        <g fill={C.nlNegatief}>
          <circle cx={cx} cy={headCy} r={headR} />
          <rect
            x={cx - torsoW / 2}
            y={shoulderY}
            width={torsoW}
            height={Math.max(0, hipY - shoulderY + torsoW * 0.2)}
            rx={torsoW * 0.35}
          />
          <rect
            x={cx - torsoW / 2 + legW * 0.1}
            y={hipY}
            width={legW}
            height={GROUND - hipY}
            rx={legW / 2}
          />
          <rect
            x={cx + torsoW / 2 - legW * 1.1}
            y={hipY}
            width={legW}
            height={GROUND - hipY}
            rx={legW / 2}
          />
        </g>
      )}
      {sticks.map((stick, index) => {
        const length = stick.inch * CM_PER_INCH * UNITS_PER_CM;
        const x = stickX(index) + (stick.shake ?? 0);
        const top = GROUND - length;
        const offsetY = (1 - stick.drop) * -(GROUND + 100);
        if (stick.drop <= 0) return null;
        return (
          <g key={`${stick.inch}-${index}`}>
            <g transform={`translate(0 ${offsetY})`}>
              <path
                d={`M${x} ${top} L${x} ${GROUND - 42} C${x} ${GROUND - 8} ${x - 14} ${GROUND} ${x - 46} ${GROUND - 6}`}
                fill="none"
                stroke={stick.color}
                strokeWidth="22"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={`M${x - 13} ${top + 40} L${x + 13} ${top + 36} M${x - 13} ${top + 58} L${x + 13} ${top + 54}`}
                stroke={C.wit}
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
            {stick.mark && stick.mark.progress > 0 && (
              <Badge
                kind={stick.mark.kind}
                x={x}
                y={top - 70}
                progress={stick.mark.progress}
              />
            )}
          </g>
        );
      })}
      {ball !== undefined && ball > 0 && sticks[0] && (
        <circle
          cx={width + 40 - (width + 40 - (stickX(0) - 70)) * Math.min(ball, 1)}
          cy={GROUND - 22}
          r="22"
          fill={C.bal}
        />
      )}
    </svg>
  );
}

function Badge({
  kind,
  x,
  y,
  progress,
}: {
  kind: 'check' | 'cross';
  x: number;
  y: number;
  progress: number;
}) {
  const fill = kind === 'check' ? C.veldblauw : C.bal;
  return (
    <g transform={`translate(${x} ${y}) scale(${progress})`}>
      <circle r="46" fill={fill} />
      {kind === 'check' ? (
        <path
          d="M-20 2 L-6 16 L22 -14"
          fill="none"
          stroke={C.wit}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M-16 -16 L16 16 M16 -16 L-16 16"
          stroke={C.wit}
          strokeWidth="10"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}
