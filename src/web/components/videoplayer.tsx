import * as React from 'react';
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js'
import "video.js/dist/video-js.css"
import "videojs-markers/dist/videojs.markers.min.css"
import "videojs-markers/dist/videojs-markers.min.js"
import "./videoplayer.css"
import "./videojs_plugin"

import { CamviewVideoJSPluginOptions } from './videojs_plugin';


export interface CamviewPlayerOptions extends VideoJsPlayerOptions {
  camview?: CamviewVideoJSPluginOptions
  className?: string;
}
// see https://docs.videojs.com/tutorial-react.html
export default class VideoPlayer extends React.Component<CamviewPlayerOptions> {
  player: VideoJsPlayer;
  videoNode: HTMLVideoElement;

  componentDidMount() {
    const camview = this.props.camview || {};
    const markers = camview?.timelineMarkers;
    this.player = videojs(this.videoNode, {...this.props, plugins: { camview, markers } } );
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div className={this.props.className}>
        <video ref={node => this.videoNode = node} className="video-js"></video>
      </div>
    )
  }
}
