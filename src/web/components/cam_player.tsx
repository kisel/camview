
import React = require("react");
import { observer } from "mobx-react-lite";
import _ = require("lodash");
import { theLocation } from "../store/location";
import { theSettingsStore } from "../store/settings";
import VideoPlayer from "../../common/videoplayer";

import "./player.css"

const CamVideoPlayerVideoJS = observer(() => {
    const absLoc = theLocation.path.split('/').slice(2, -1); // strip /view/ and /$
    const videoPath = absLoc.join('/');
    const vformat = (theSettingsStore.settings.legacy_mode) ? 'mp4-legacy' : 'mp4'
    const videoURL = `/api/video/${vformat}/${videoPath}`
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
            ]
        }} />
    );
});


const CamVideoPlayerLegacy = observer(() => {
    const absLoc = theLocation.path.split('/').slice(2, -1); // strip /view/ and /$
    const videoPath = absLoc.join('/');
    const vformat = (theSettingsStore.settings.legacy_mode) ? 'mp4-legacy' : 'mp4'
    const videoURL = `/api/video/${vformat}/${videoPath}`
    return (
        <div className="video-container">
            <video className="video-fluid" autoPlay controls width="100%">
                <source src={videoURL} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
});

export const CameraRealtime = observer(() => {
    const camid = theLocation.path.split('/')[2];
    const videoURL = `/api/streams/data/${camid}/s.m3u8`
    return (
        <VideoPlayer {...{
            className: "video-container",
            autoplay: true,
            controls: true,
            responsive: true, //
            preload: 'auto',
            // html5: {},
            sources: [
                { src: videoURL, type: 'application/x-mpegURL' }
            ]
        }} />
    );
});

export const CamVideoPlayer = observer(() => {
    return (theSettingsStore.settings.native_player)
        ? <CamVideoPlayerLegacy/>
        : <CamVideoPlayerVideoJS/>
})
