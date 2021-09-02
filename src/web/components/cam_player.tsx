
import React = require("react");
import { observer } from "mobx-react-lite";
import _ = require("lodash");
import { theLocation } from "../store/location";
import { theSettingsStore } from "../store/settings";
import VideoPlayer from "./videoplayer";

import "./player.css"

const CamVideoPlayerVideoJS = observer(({videoURL}: {videoURL: string}) => {
    return (
        <VideoPlayer {...{
            className: "video-container",
            autoplay: true,
            controls: true,
            responsive: true, //
            //fluid: true, // scale to fit its container at the video's intrinsic aspect ratio
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
                { src: videoURL, type: 'video/mp4' }
            ],
            camview: {
                downloadUrl: videoURL
            },

        }} />
    );
});


const CamVideoPlayerLegacy = observer(({videoURL}: {videoURL: string}) => {
    return (
        <div className="video-container">
            <video className="video-fluid" autoPlay controls width="100%">
                <source src={videoURL} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
});

export interface CameraRealtimeProps {
    camId: string;
}
export const CameraRealtime = observer(({camId}: CameraRealtimeProps) => {
    const videoURL = `/api/streams/data/${camId}/s.m3u8`
    return (
        <VideoPlayer {...{
            className: "video-container",
            autoplay: true,
            controls: true,
            responsive: true, //
            errorDisplay: false,
            preload: 'auto',
            // html5: {},
            sources: [
                { src: videoURL, type: 'application/x-mpegURL' }
            ]
        }} />
    );
});

export const CamVideoPlayer = observer(({videoURL}: {videoURL: string}) => {
    return (theSettingsStore.settings.native_player)
        ? <CamVideoPlayerLegacy  videoURL={videoURL} />
        : <CamVideoPlayerVideoJS videoURL={videoURL} />
})

export const CamVideoPlayerPage = observer(() => {
    const absLoc = theLocation.path.split('/').slice(2, -1); // strip /view/ and /$
    const videoPath = absLoc.join('/');
    const vformat = (theSettingsStore.settings.legacy_mode) ? 'mp4-legacy' : 'mp4'
    const videoURL = `/api/video/${vformat}/${videoPath}`
    return <CamVideoPlayer videoURL={videoURL} />
})
