import { C } from '../brand';
import { CM_PER_INCH } from './data';

export type FigureStick = {
  inch: number;
  /** 0–1: how far the stick has grown in. */
  progress: number;
  color: string;
  crossed?: number;
};

const VIEW_H = 1000;
const GROUND = 960;
/** Scale: 200 cm of height fills 880 units. */
const UNITS_PER_CM = 4.4;

/**
 * A neutral player silhouette next to one or more sticks, both drawn to the
 * same scale so the proportion between body and stick is real.
 */
export function Figure({
  heightCm,
  sticks,
  personProgress = 1,
  height,
}: {
  heightCm: number;
  sticks: FigureStick[];
  personProgress?: number;
  /** Rendered height in px. */
  height: number;
}) {
  const h = heightCm * UNITS_PER_CM * personProgress;
  const headR = h * 0.068;
  const headCy = GROUND - h + headR;
  const shoulderY = headCy + headR + h * 0.02;
  const hipY = GROUND - h * 0.47;
  const torsoW = h * 0.25;
  const legW = torsoW * 0.4;
  const cx = 230;
  const width = 330 + sticks.length * 120;

  return (
    <svg
      height={height}
      width={(height / VIEW_H) * width}
      viewBox={`0 0 ${width} ${VIEW_H}`}
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
      {h > 0 && (
        <g fill={C.nlNegatief}>
          <circle cx={cx} cy={headCy} r={headR} />
          <rect
            x={cx - torsoW / 2}
            y={shoulderY}
            width={torsoW}
            height={hipY - shoulderY + torsoW * 0.2}
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
        const x = cx + torsoW / 2 + 95 + index * 120;
        const length = stick.inch * CM_PER_INCH * UNITS_PER_CM * stick.progress;
        if (length <= 0) return null;
        const top = GROUND - length;
        const hookStart = Math.max(top, GROUND - 42);
        return (
          <g key={`${stick.inch}-${index}`}>
            <path
              d={`M${x} ${top} L${x} ${hookStart} C${x} ${GROUND - 8} ${x - 14} ${GROUND} ${x - 46} ${GROUND - 6}`}
              fill="none"
              stroke={stick.color}
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {length > 90 && (
              <path
                d={`M${x - 13} ${top + 40} L${x + 13} ${top + 36} M${x - 13} ${top + 58} L${x + 13} ${top + 54}`}
                stroke={C.wit}
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}
            {stick.crossed !== undefined && stick.crossed > 0 && (
              <g
                stroke={C.bal}
                strokeWidth="16"
                strokeLinecap="round"
                opacity={stick.crossed}
              >
                <line
                  x1={x - 60}
                  y1={top + 40}
                  x2={x + 60}
                  y2={top + 160}
                />
                <line
                  x1={x + 60}
                  y1={top + 40}
                  x2={x - 60}
                  y2={top + 160}
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
