/**
 * Builds every logo, icon and favicon file from the brand guideline
 * (jouwhockeystick-logo-merkinstructie.md, v1.0) so they are reproducible:
 *
 *   node scripts/build-brand-assets.mjs
 *
 * Logo shapes come from src/components/brand/logoGeometry.ts: the guideline
 * shapes plus the owner's later changes (tilt, shorter hook, two grip
 * stripes). Wordmark files are
 * built from the font files in assets/fonts with all text converted to paths,
 * so they render without the fonts installed (§5.1). PNG and ICO files are
 * rendered with sharp, which Next.js already installs for image handling.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';
// Node runs this TypeScript module directly (type stripping, Node 22.18+).
import {
  BRAND_HEX,
  iconMarkup,
  wordmarkStickMarkup,
} from '../src/components/brand/logoGeometry.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (path) => join(root, 'public', path);
mkdirSync(out('brand'), { recursive: true });

// §2.1 design tokens
const T = {
  veldblauw: '#1846A3',
  inkt: '#0D1B2E',
  bal: '#FF8A1F',
  krijt: '#EEF3FA',
  lijngrijs: '#5B6B7F',
  nlNegatief: '#C9D6F0',
};

const PAYOFF = 'Eerlijk stickadvies op maat';

const loadFont = (file) =>
  opentype.parse(readFileSync(join(root, 'assets/fonts', file)).buffer);
const fonts = {
  wordmark: loadFont('BricolageGrotesque-ExtraBold-opsz96.ttf'),
  tld: loadFont('BricolageGrotesque-Medium-opsz96.ttf'),
  body: loadFont('InstrumentSans-Regular.ttf'),
};

// ---------------------------------------------------------------- icons (§3)

// Shapes come from the same module the site renders, so files and site match.
const iconSvg = (variant) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="jouwhockeystick.nl">
  ${iconMarkup(variant)}
</svg>
`;
const ICONS = {
  large: iconSvg('large'),
  dark: iconSvg('dark'),
  medium: iconSvg('medium'),
  favicon32: iconSvg('favicon32'),
  favicon16: iconSvg('favicon16'),
};

// ------------------------------------------------------------ text to paths

/**
 * Lays out text glyph by glyph with kerning and letter spacing (in em).
 * Glyphs are looked up per character: opentype.js cannot run all of this
 * font's substitution lookups, and the wordmark needs none of them.
 */
function textPath(font, text, x, baseline, size, letterSpacingEm = 0) {
  const scale = size / font.unitsPerEm;
  const glyphs = [...text].map((char) => font.charToGlyph(char));
  let cursor = x;
  const parts = [];
  glyphs.forEach((glyph, index) => {
    parts.push(glyph.getPath(cursor, baseline, size).toPathData(2));
    const next = glyphs[index + 1];
    const kerning = next ? font.getKerningValue(glyph, next) : 0;
    cursor += (glyph.advanceWidth + kerning) * scale + letterSpacingEm * size;
  });
  return { d: parts.join(''), width: cursor - x };
}

/**
 * The j-stick of §3.1, placed exactly like the inline SVG in the site:
 * height 0.95em, width 0.418em, bottom 0.228em below the baseline.
 */
function jStick(x, baseline, size, negative) {
  const scale = (0.95 * size) / 100;
  const top = baseline + 0.228 * size - 0.95 * size;
  const colors = negative
    ? { stick: BRAND_HEX.wit, grip: BRAND_HEX.veldblauw }
    : { stick: BRAND_HEX.veldblauw, grip: BRAND_HEX.wit };
  return {
    svg: `<g transform="translate(${x.toFixed(2)} ${top.toFixed(2)}) scale(${scale.toFixed(4)})">
    ${wordmarkStickMarkup(colors)}
  </g>`,
    width: (0.418 + 0.01) * size,
  };
}

/** Primary or negative wordmark: j-stick + "ouwhockeystick" + ".nl" (§4). */
function wordmark({ size, x, baseline, negative }) {
  const stick = jStick(x, baseline, size, negative);
  const name = textPath(
    fonts.wordmark,
    'ouwhockeystick',
    x + stick.width,
    baseline,
    size,
    -0.035,
  );
  const tld = textPath(
    fonts.tld,
    '.nl',
    x + stick.width + name.width,
    baseline,
    size,
    -0.035,
  );
  return {
    svg: `${stick.svg}
  <path d="${name.d}" fill="${negative ? '#FFFFFF' : T.inkt}"/>
  <path d="${tld.d}" fill="${negative ? T.nlNegatief : T.lijngrijs}"/>`,
    width: stick.width + name.width + tld.width,
  };
}

const svgDoc = (width, height, body, label = 'jouwhockeystick.nl') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(0)} ${height.toFixed(0)}" width="${width.toFixed(0)}" height="${height.toFixed(0)}" role="img" aria-label="${label}">
  ${body}
</svg>
`;

function wordmarkFile(negative) {
  const size = 104;
  const pad = 0.15 * size; // §4.1 clear space
  const baseline = pad + 0.95 * size - 0.228 * size;
  const mark = wordmark({ size, x: pad, baseline, negative });
  const height = baseline + 0.228 * size + pad;
  return svgDoc(mark.width + 2 * pad, height, mark.svg);
}

/** Icon + "jouwhockeystick.nl" in regular letters (no stick in the text, §4). */
function lockupFile() {
  const icon = 100;
  const size = 0.6 * icon; // header ratio: 40 px icon, 24 px text
  const gap = 0.4 * icon;
  const pad = 0.125 * icon;
  const baseline = pad + icon / 2 + 0.36 * size;
  const textX = pad + icon + gap;
  const name = textPath(
    fonts.wordmark,
    'jouwhockeystick',
    textX,
    baseline,
    size,
    -0.035,
  );
  const tld = textPath(
    fonts.tld,
    '.nl',
    textX + name.width,
    baseline,
    size,
    -0.035,
  );
  const iconBody = ICONS.medium.replace(/<svg[^>]*>|<\/svg>/g, '').trim();
  return svgDoc(
    textX + name.width + tld.width + pad,
    icon + 2 * pad,
    `<g transform="translate(${pad} ${pad})">${iconBody}</g>
  <path d="${name.d}" fill="${T.inkt}"/>
  <path d="${tld.d}" fill="${T.lijngrijs}"/>`,
  );
}

/** 1200×630 social image: krijt background, wordmark with pay-off (§5). */
function ogImageSvg() {
  const width = 1200;
  const height = 630;
  const size = 104;
  const probe = wordmark({ size, x: 0, baseline: 0, negative: false });
  const x = (width - probe.width) / 2;
  const baseline = 300;
  const mark = wordmark({ size, x, baseline, negative: false });
  const payoffSize = 26 * 1.6;
  const payoffProbe = textPath(fonts.body, PAYOFF, 0, 0, payoffSize);
  const payoff = textPath(
    fonts.body,
    PAYOFF,
    (width - payoffProbe.width) / 2,
    baseline + 0.228 * size + 28 * 1.6 + payoffSize * 0.75,
    payoffSize,
  );
  return svgDoc(
    width,
    height,
    `<rect width="${width}" height="${height}" fill="${T.krijt}"/>
  ${mark.svg}
  <path d="${payoff.d}" fill="${T.lijngrijs}"/>`,
    `jouwhockeystick.nl — ${PAYOFF}`,
  );
}

// -------------------------------------------------------------- rendering

const png = (svg, size, flattenOnto) => {
  let image = sharp(Buffer.from(svg), {
    density: 72 * Math.max(1, size / 100),
  }).resize(size, size);
  if (flattenOnto) {
    image = image.flatten({ background: flattenOnto });
  }
  return image.png().toBuffer();
};

/** Minimal ICO container holding PNG images (supported by all current browsers). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }
  return Buffer.concat([
    header,
    ...entries,
    ...images.map((image) => image.data),
  ]);
}

const files = {
  'brand/jhs-icon.svg': ICONS.large,
  'brand/jhs-icon-dark.svg': ICONS.dark,
  'brand/jhs-icon-medium.svg': ICONS.medium,
  'brand/jhs-wordmark.svg': wordmarkFile(false),
  'brand/jhs-wordmark-negative.svg': wordmarkFile(true),
  'brand/jhs-lockup.svg': lockupFile(),
  'favicon.svg': ICONS.favicon32,
};
for (const [path, svg] of Object.entries(files)) {
  writeFileSync(out(path), svg);
}

writeFileSync(
  out('favicon.ico'),
  ico([
    { size: 16, data: await png(ICONS.favicon16, 16) },
    { size: 32, data: await png(ICONS.favicon32, 32) },
    { size: 48, data: await png(ICONS.favicon32, 48) },
  ]),
);
writeFileSync(
  out('apple-touch-icon.png'),
  await png(ICONS.medium, 180, T.veldblauw),
);
writeFileSync(out('icon-192.png'), await png(ICONS.medium, 192));
writeFileSync(out('icon-512.png'), await png(ICONS.large, 512));
writeFileSync(
  out('og-image.png'),
  await sharp(Buffer.from(ogImageSvg())).resize(1200, 630).png().toBuffer(),
);
writeFileSync(
  out('site.webmanifest'),
  `${JSON.stringify(
    {
      name: 'jouwhockeystick.nl',
      short_name: 'Stickadvies',
      start_url: '/',
      display: 'browser',
      theme_color: T.veldblauw,
      background_color: T.krijt,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  )}\n`,
);

console.log('Brand assets written to public/ and public/brand/');
