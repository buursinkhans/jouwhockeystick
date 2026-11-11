import { LENGTH_GUIDE } from '@/advice-engine/sizeAdvice';

/**
 * Average height of Dutch children by age, the single source of the age
 * indication on /kennis/hockeystick-lengte-tabel (decision log 2026-11-11).
 * Age is only an indication: body height leads, and the stick size always
 * comes from LENGTH_GUIDE (the same table as the stickwijzer), never from a
 * second table of sizes.
 *
 * Source, copied as printed (no interpolation, no rounding of the source):
 * JGZ-richtlijn Lengtegroei, Bijlage 1, tabel 3, columns "Nederlandse
 * meisjes" and "Nederlandse jongens": mean height in cm (SD in cm) at the
 * birthday itself (exactly 8.0 years, not "8 years old"). The table
 * comes from Schönbeck et al. 2013 (the Fifth Dutch Growth Study, measured
 * 2008 to 2009). The figures are means, not medians.
 */
export const CHILD_HEIGHT_SOURCE = {
  guidelineLabel:
    'JGZ-richtlijn Lengtegroei, Bijlage 1, tabel 3: gemiddelde lengte en SD van Nederlandse meisjes en jongens per leeftijd (Nederlands Centrum Jeugdgezondheid)',
  guidelineUrl: 'https://www.jgzrichtlijnen.nl/wp-content/uploads/2024/10/Bijlage-1-formules-lengtegroei.pdf',
  studyLabel:
    'Schönbeck e.a. (2013), The world’s tallest nation has stopped growing taller: the height of Dutch children from 1955 to 2009, Pediatric Research 73, 371-377',
  studyUrl: 'https://doi.org/10.1038/pr.2012.189',
  /** The day the figures were read from the guideline. */
  readOn: '2026-11-11',
} as const;

type MeanSd = { readonly mean: number; readonly sd: number };

export type AgeHeight = { readonly age: number; readonly girls: MeanSd; readonly boys: MeanSd };

/** Tabel 3, Nederlandse meisjes and jongens, 5.0 to 15.0 years. */
export const CHILD_HEIGHT_BY_AGE: readonly AgeHeight[] = [
  { age: 5, girls: { mean: 112.1, sd: 4.7 }, boys: { mean: 113.2, sd: 4.6 } },
  { age: 6, girls: { mean: 118.8, sd: 5.1 }, boys: { mean: 119.9, sd: 5.1 } },
  { age: 7, girls: { mean: 125.3, sd: 5.4 }, boys: { mean: 126.2, sd: 5.4 } },
  { age: 8, girls: { mean: 131.3, sd: 5.8 }, boys: { mean: 132.5, sd: 5.8 } },
  { age: 9, girls: { mean: 137.3, sd: 6.1 }, boys: { mean: 138.5, sd: 6.2 } },
  { age: 10, girls: { mean: 143.5, sd: 6.5 }, boys: { mean: 143.7, sd: 6.6 } },
  { age: 11, girls: { mean: 149.7, sd: 6.7 }, boys: { mean: 148.9, sd: 7.0 } },
  { age: 12, girls: { mean: 155.7, sd: 6.9 }, boys: { mean: 155.2, sd: 7.6 } },
  { age: 13, girls: { mean: 160.8, sd: 6.9 }, boys: { mean: 161.8, sd: 8.2 } },
  { age: 14, girls: { mean: 164.5, sd: 6.9 }, boys: { mean: 168.5, sd: 8.3 } },
  { age: 15, girls: { mean: 166.9, sd: 6.8 }, boys: { mean: 175.2, sd: 7.9 } },
];

/**
 * Values the same document prints elsewhere (worked examples and tabel 2),
 * so a test can check the rows above against the source: girls at 4.0 years,
 * boys at 6.0 years and the final height (21.0 years).
 */
export const CHILD_HEIGHT_CROSS_CHECK = {
  girlsAt4: { mean: 104.9, sd: 4.2 },
  boysAt6: { mean: 119.9, sd: 5.1 },
  finalGirls: { mean: 170.7, sd: 6.3 },
  finalBoys: { mean: 183.8, sd: 7.1 },
} as const;

/** The band of LENGTH_GUIDE for a height in whole cm (the guide has no gaps between bands). */
function bandFor(cm: number) {
  const rounded = Math.round(cm);
  return LENGTH_GUIDE.find((band) => rounded <= band.maxCm) ?? LENGTH_GUIDE[LENGTH_GUIDE.length - 1]!;
}

const nl = (n: number) => String(n).replace('.', ',');

export type AgeIndication = {
  age: number;
  /** "131,3 / 132,5": girls / boys. */
  meanHeight: string;
  /** Size(s) the length table gives at the average height: "30 / 31" (girls / boys), or one value when equal. */
  size: string;
  /** From the shortest size at (mean - 1 SD) to the longest at (mean + 1 SD), over both sexes. */
  range: string;
};

export function ageIndication(row: AgeHeight): AgeIndication {
  const girlsSizes = bandFor(row.girls.mean).sizes.map(nl).join(' of ');
  const boysSizes = bandFor(row.boys.mean).sizes.map(nl).join(' of ');
  const low = Math.min(row.girls.mean - row.girls.sd, row.boys.mean - row.boys.sd);
  const high = Math.max(row.girls.mean + row.girls.sd, row.boys.mean + row.boys.sd);
  const shortest = bandFor(low).sizes[0];
  const longest = bandFor(high).sizes.at(-1)!;
  return {
    age: row.age,
    meanHeight: `${nl(row.girls.mean)} / ${nl(row.boys.mean)}`,
    size: girlsSizes === boysSizes ? girlsSizes : `${girlsSizes} / ${boysSizes}`,
    range: `${nl(shortest)} t/m ${nl(longest)}`,
  };
}

/** The rows of the table in the article, generated from the source and LENGTH_GUIDE. */
export const AGE_TABLE_ROWS: string[][] = CHILD_HEIGHT_BY_AGE.map((row) => {
  const indication = ageIndication(row);
  return [`${indication.age} jaar`, indication.meanHeight, indication.size, indication.range];
});
