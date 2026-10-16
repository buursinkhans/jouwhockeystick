import './fonts';
import { Composition, Still } from 'remotion';
import { FPS, LengteVideo, durationInFrames } from './lengte/LengteVideo';
import { LengteThumbnail } from './lengte/Thumbnail';

export function Root() {
  return (
    <>
      {/* YouTube Shorts, Instagram Reels and TikTok (9:16). */}
      <Composition
        id="lengte-short"
        component={LengteVideo}
        durationInFrames={durationInFrames('short')}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ variant: 'short' as const }}
      />
      {/* YouTube (16:9). */}
      <Composition
        id="lengte-uitleg"
        component={LengteVideo}
        durationInFrames={durationInFrames('uitleg')}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ variant: 'uitleg' as const }}
      />
      <Still id="lengte-thumbnail" component={LengteThumbnail} width={1280} height={720} />
    </>
  );
}
