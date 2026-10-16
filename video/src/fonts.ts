import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';

// The site's own font files (assets/fonts, served as the public dir), so the
// videos use exactly the brand type without a request to Google.
const FONTS = [
  {
    family: 'Bricolage',
    file: 'fonts/BricolageGrotesque-ExtraBold-opsz96.ttf',
    weight: '800',
  },
  {
    family: 'Bricolage',
    file: 'fonts/BricolageGrotesque-Medium-opsz96.ttf',
    weight: '500',
  },
  {
    family: 'Instrument Sans',
    file: 'fonts/InstrumentSans-Regular.ttf',
    weight: '400',
  },
] as const;

const handle = delayRender('Loading brand fonts');

Promise.all(
  FONTS.map(async ({ family, file, weight }) => {
    const face = new FontFace(family, `url('${staticFile(file)}')`, {
      weight,
    });
    await face.load();
    document.fonts.add(face);
  }),
)
  .then(() => continueRender(handle))
  .catch((error: unknown) => cancelRender(error));
