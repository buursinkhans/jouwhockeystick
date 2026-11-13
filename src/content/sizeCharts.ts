import { getSizeAdvice } from '@/advice-engine/sizeAdvice';

/**
 * Size charts of other sources next to our own length table (decision log
 * 2026-11-13). Each chart is copied as printed from the source's own page, on
 * the date in `readOn`; nothing is estimated or filled in. A range runs from
 * `minCm` up to, not including, `maxCm`; the comparison heights are chosen so
 * that none falls on the edge of a range in any chart (a test checks that), so
 * no boundary has to be interpreted.
 */

export type ChartRow = { minCm: number; maxCm: number | null; sizes: readonly number[]; note?: string };

export type SizeChart = {
  id: string;
  /** Column heading in the article. */
  name: string;
  /** For the sources list. */
  label: string;
  url: string;
  readOn: string;
  rows: readonly ChartRow[];
};

export const SIZE_CHARTS: readonly SizeChart[] = [
  {
    id: 'grays',
    name: 'Grays',
    label: 'Grays: Size Guides, Hockey Sticks (Stick Size, Height in cm)',
    url: 'https://www.grays-hockey.eu/pages/size-guides',
    readOn: '2026-11-13',
    // Printed as "152-162", "162-184", "184-193", "193+" (cm).
    rows: [
      { minCm: 140, maxCm: 152, sizes: [34] },
      { minCm: 152, maxCm: 162, sizes: [35] },
      { minCm: 162, maxCm: 184, sizes: [36.5] },
      { minCm: 184, maxCm: 193, sizes: [37.5] },
      { minCm: 193, maxCm: null, sizes: [38.5] },
    ],
  },
  {
    id: 'osaka',
    name: 'Osaka',
    label: 'Osaka: Field Hockey Stick Guide (Player Height in cm, Stick Length)',
    url: 'https://www.osakaworldusa.com/pages/size-guide-sticks',
    readOn: '2026-11-13',
    // Printed as "145-152 cm", "152-180 cm", "180-192 cm", "> 192 cm".
    rows: [
      { minCm: 145, maxCm: 152, sizes: [35] },
      { minCm: 152, maxCm: 180, sizes: [36.5] },
      { minCm: 180, maxCm: 192, sizes: [37.5] },
      { minCm: 192, maxCm: null, sizes: [38] },
    ],
  },
  {
    id: 'princess',
    name: 'Princess (Zuid-Afrika)',
    label: 'Princess Hockey SA: Stick Sizing Guide (Height in m, Stick Length)',
    url: 'https://princesshockey.co.za/pages/stick-sizing-guide',
    readOn: '2026-11-13',
    // Printed in metres: "1.52 - 1.6 m", "1.6 - 1.7 m", "1.7 - 1.8 m", "1.8 m and over".
    rows: [
      { minCm: 147, maxCm: 152, sizes: [34] },
      { minCm: 152, maxCm: 160, sizes: [35] },
      { minCm: 160, maxCm: 170, sizes: [36, 36.5] },
      { minCm: 170, maxCm: 180, sizes: [36.5], note: 'standaardlengte voor senioren' },
      { minCm: 180, maxCm: null, sizes: [36.5, 37.5], note: 'extra lengte' },
    ],
  },
];

/** The heights of the comparison table: between 155 and 195 cm, never on the edge of a range. */
export const COMPARISON_HEIGHTS = [155, 158, 165, 168, 175, 178, 182, 187, 190, 195] as const;

const inch = (value: number) => String(value).replace('.', ',');
const sizesText = (sizes: readonly number[]) => sizes.map(inch).join(' of ');

/** The row of a chart for a height, or null when the chart has none. */
export function chartRow(chart: SizeChart, heightCm: number): ChartRow | null {
  return chart.rows.find((row) => heightCm >= row.minCm && (row.maxCm === null || heightCm < row.maxCm)) ?? null;
}

/** Our own advice for a height, as the stickwijzer gives it: the size, and the alternative it names. */
export function ourAdvice(heightCm: number): string {
  const advice = getSizeAdvice(heightCm);
  return advice.alternativeInch === undefined
    ? inch(advice.primaryInch)
    : `${inch(advice.primaryInch)} (of ${inch(advice.alternativeInch)})`;
}

export const COMPARISON_COLUMNS = ['Lichaamslengte', 'Onze richtlijn', ...SIZE_CHARTS.map((chart) => chart.name)];

/** One row per comparison height: our advice and what each chart says, in inches. */
export const COMPARISON_ROWS: string[][] = COMPARISON_HEIGHTS.map((height) => [
  `${height} cm`,
  ourAdvice(height),
  ...SIZE_CHARTS.map((chart) => {
    const row = chartRow(chart, height);
    return row ? sizesText(row.sizes) : 'niet in de tabel';
  }),
]);
