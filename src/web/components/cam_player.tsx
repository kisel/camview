
import React = require("react");
import { observer } from "mobx-react-lite";
import _ = require("lodash");
import { theLocation } from "../store/location";
import { theSettingsStore } from "../store/settings";
import VideoPlayer from "../../common/videoplayer";

export const CamVideoPlayer = observer(() => {
    const absLoc = theLocation.path.split('/').slice(2, -1); // strip /view/ and /$
    const videoPath = absLoc.join('/');
    const vformat = (theSettingsStore.legacyMode) ? 'mp4-legacy' : 'mp4'
    const videoURL = `/api/video/${vformat}/${videoPath}`
    return (
        <div className="video-player">
            <VideoPlayer {...{
                autoplay: true,
                controls: true,
                responsive: true,
                fluid: true,
                fill: true,
                preload: 'auto',
                html5: {
                  hls: {
                    enableLowInitialPlaylist: true,
                    smoothQualityChange: true,
                    overrideNative: true,
                  },
                },
                playbackRates: [1, 2, 5, 10, 20, 30],
                sources: [
                    {src: videoURL, type: 'video/mp4'}
                ]
            }} />
        </div>
    );
});


export const CamVideoPlayerLegacy = observer(() => {
    const absLoc = theLocation.path.split('/').slice(2, -1); // strip /view/ and /$
    const videoPath = absLoc.join('/');
    const vformat = (theSettingsStore.legacyMode) ? 'mp4-legacy' : 'mp4'
    const videoURL = `/api/video/${vformat}/${videoPath}`
    return (
        <div className="video-player">
            <video className="video-fluid" autoPlay controls width="100%">
                <source src={videoURL} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
});
