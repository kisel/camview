import * as React from 'react';
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js'
import "video.js/dist/video-js.css"
import "videojs-markers-plugin/dist/videojs.markers.min.css"
import "videojs-markers-plugin/dist/videojs-markers.min.js"
import "./videoplayer.css"
import "./videojs_plugin"

import { CamviewVideoJSPluginOptions } from './videojs_plugin';


export interface CamviewPlayerOptions extends VideoJsPlayerOptions {
  camview?: CamviewVideoJSPluginOptions
  className?: string;
}

export const VideoPlayer = ( props: CamviewPlayerOptions) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);

  const camview = props.camview || {};
  const markers = camview?.timelineMarkers;
  const options = { ...props, plugins: { camview, markers } };

  React.useEffect(() => {
    // make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const player = playerRef.current = videojs(videoElement, options, () => {
        console.log("player is ready");
      });
    } else {
      // you can update player here [update player through props]
      // const player = playerRef.current;
      // player.autoplay(options.autoplay);
      // player.src(options.sources);
    }
  }, [options]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className={props.className}>
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" />
      </div>
    </div>
  );
}
