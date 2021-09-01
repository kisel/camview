import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js'
import { downloadFile } from '../utils/download_utils';

const vjsButton = videojs.getComponent('Button');

class DownloadButton extends vjsButton {

  buildCSSClass() {
    return `vjs-vjsdownload ${super.buildCSSClass()}`;
  }

  handleClick() {
    downloadFile((this.options_ as any).downloadURL || this.player().currentSrc())
  }
}

export interface CamviewVideoJSPluginOptions {
    customClass?: string;
    downloadUrl?: string;
}

const Plugin = videojs.getPlugin('plugin');
class CamviewPlugin extends Plugin {

  constructor(player: VideoJsPlayer, options: CamviewVideoJSPluginOptions) {
    super(player, options);

    if (options.customClass) {
      player.addClass(options.customClass);
    }

    player.on('playing', function() {
      videojs.log('playback began!');
    });

    player.ready(() => {
        if (options.downloadUrl) {
            let DButton = player.controlBar.addChild(new DownloadButton(player, options as any), {});
            DButton.controlText("Download video");
            player.controlBar.el().insertBefore(DButton.el(), player.controlBar.getChild('fullscreenToggle').el());
        }
    })

  }
}

videojs.registerPlugin('camview', CamviewPlugin)
