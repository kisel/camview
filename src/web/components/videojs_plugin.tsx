import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js'
import { downloadFile } from '../utils/download_utils';

const vjsButton = videojs.getComponent('Button');

class DownloadButton extends vjsButton {

  buildCSSClass() {
    return `vjs-vjsdownload ${super.buildCSSClass()}`;
  }

  handleClick(this: VideoJsPlayer) {
    downloadFile((this.options_ as any).downloadURL || this.player().currentSrc())
  }
}

function copyToClipboard(text) {
  const elem = document.createElement('textarea');
  elem.value = text;
  document.body.appendChild(elem);
  elem.select();
  document.execCommand('copy');
  document.body.removeChild(elem);
}

class ShareButton extends vjsButton {

  buildCSSClass() {
    return `vjs-icon-share ${super.buildCSSClass()}`;
  }

  handleClick(this: VideoJsPlayer) {
    const shareUrl = new URL(location.href);
    shareUrl.searchParams.set('time', `${Math.floor(this.player().currentTime())}`)
    copyToClipboard(shareUrl.href)
    const modal = this.player().createModal(`Copied to clipboard: ${shareUrl.href}`, {})
    modal.on('click', () => modal.close())
  }
}


export interface CamviewVideoJSPluginOptions {
    customClass?: string;
    downloadUrl?: string;
    timelineMarkers?: any;
    startTime?: number;
    showShare?: string;
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

      if (options.startTime && this.player) {
        player.currentTime(options.startTime)
      }

      if (options.showShare === "time") {
        let btn = player.controlBar.addChild(new ShareButton(player, options as any), {});
        btn.controlText("Share video");
        player.controlBar.el().insertBefore(btn.el(), player.controlBar.getChild('fullscreenToggle').el());
      }

    })

  }
}

videojs.registerPlugin('camview', CamviewPlugin)
