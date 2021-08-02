import * as React from 'react';
import videojs, { VideoJsPlayerOptions } from 'video.js'
import "video.js/dist/video-js.css"


// see https://docs.videojs.com/tutorial-react.html
export default class VideoPlayer extends React.Component<VideoJsPlayerOptions> {
  player: any;
  videoNode: any;

  componentDidMount() {
    this.player = videojs(this.videoNode, this.props, () => {
      console.log('onPlayerReady', this)
    });
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
      <div>
        <video ref={node => this.videoNode = node} className="video-js"></video>
      </div>
    )
  }
}
