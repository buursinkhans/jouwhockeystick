import './fonts';
import { Composition, Still } from 'remotion';
import { FPS, LengteVideo, durationInFrames } from './lengte/LengteVideo';
import { LengteThumbnail } from './lengte/Thumbnail';
import { TrainerVideo, trainerDurationInFrames } from './lengte-trainer/TrainerVideo';

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
        defaultProps={{ variant: 'short' as const, music: true }}
      />
      {/* Same Short without music (sound effects stay), for adding a track
          from the Instagram or TikTok library in the app. */}
      <Composition
        id="lengte-short-zonder-muziek"
        component={LengteVideo}
        durationInFrames={durationInFrames('short')}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ variant: 'short' as const, music: false }}
      />
      {/* YouTube (16:9). */}
      <Composition
        id="lengte-uitleg"
        component={LengteVideo}
        durationInFrames={durationInFrames('uitleg')}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ variant: 'uitleg' as const, music: true }}
      />
      {/* Short with the AI trainer (Synthesia clip for the opening and the close). */}
      <Composition
        id="lengte-trainer-short"
        component={TrainerVideo}
        durationInFrames={trainerDurationInFrames()}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ music: true }}
      />
      <Composition
        id="lengte-trainer-short-zonder-muziek"
        component={TrainerVideo}
        durationInFrames={trainerDurationInFrames()}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ music: false }}
      />
      <Still id="lengte-thumbnail" component={LengteThumbnail} width={1280} height={720} />
    </>
  );
}
