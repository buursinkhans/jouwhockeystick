// Renders every video and still of the pilot into video/out/.
// Run from video/: `npm run render`. Used by .github/workflows/video.yml.
import { execFileSync } from 'node:child_process';

const RENDERS = [
  ['render', 'lengte-short', 'out/hockeystick-lengte-short.mp4'],
  ['render', 'lengte-short-zonder-muziek', 'out/hockeystick-lengte-short-zonder-muziek.mp4'],
  ['render', 'lengte-uitleg', 'out/hockeystick-lengte-uitleg.mp4'],
  ['still', 'lengte-thumbnail', 'out/hockeystick-lengte-thumbnail.png'],
];

for (const [command, id, output] of RENDERS) {
  execFileSync(
    'npx',
    ['remotion', command, 'src/index.ts', id, output, '--public-dir=../assets'],
    { stdio: 'inherit' },
  );
}
