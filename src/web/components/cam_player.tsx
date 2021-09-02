
import React = require("react");
import { observer } from "mobx-react-lite";
import _ = require("lodash");
import { theSettingsStore } from "../store/settings";
import VideoPlayer from "./videoplayer";

import "./player.css"
import { Fetch } from "react-request";
import { CamFileMetadata } from "../../common/models";

interface CamVideoPlayerProps {
    videoURL: string
    timelineMarkers?: any[];
}
const CamVideoPlayerVideoJS = observer(({videoURL, timelineMarkers}: CamVideoPlayerProps) => {
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
                downloadUrl: videoURL,
                timelineMarkers
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


export const CamVideoPlayer = observer((props: CamVideoPlayerProps) => {
    return (theSettingsStore.settings.native_player)
        ? <CamVideoPlayerLegacy  {...props} />
        : <CamVideoPlayerVideoJS {...props} />
})

export const CamVideoPlayerPage = observer(({url}:{url: string}) => {
    const absLoc = url.split('/').slice(2, -1); // strip /view/ and /$
    const [camname, date, hour, fn] = absLoc;

    const videoPath = [camname, date, hour, fn].join('/');
    const vformat = (theSettingsStore.settings.legacy_mode) ? 'mp4-legacy' : 'mp4'

    const videoURL = ['/api/video', vformat, videoPath].join('/')
    const detectorURL = ['/api/detector/result', videoPath.replace(/[.](mp4|ts)/, '.json')].join('/');
    return (
      <Fetch url={detectorURL} children={({ fetching, failed, data }) => {
            if (fetching) {
                return <div>Loading...</div>;
            }
            const detectorRes: CamFileMetadata = data;
            let timelineMarkers = buildVideoMarkers(detectorRes);

            return <CamVideoPlayer videoURL={videoURL} timelineMarkers={timelineMarkers} />
    }} />
    );
})

function buildVideoMarkers(detectorRes: CamFileMetadata) {
    let timelineMarkers = undefined;
    if (detectorRes && detectorRes.detector) {
        const { fps, motion_start_frames, motion_stop_frames } = detectorRes.detector;
        if (fps > 0) {
            let startDetections = _.map(motion_start_frames, frameIdx => frameIdx / fps).filter(_.isNumber).map((offset) => (
                { time: offset, text: "detection start", class: "red-marker", markerStyle: {} }
            ));
            let stopDetections = _.map(motion_stop_frames, frameIdx => frameIdx / fps).filter(_.isNumber).map((offset) => (
                { time: offset, text: "detection stop", class: "blue-marker", markerStyle: {} }
            ));
            timelineMarkers = {
                markerStyle: {
                    'width': '5px',
                    'border-radius': '10%',
                    'background-color': null,
                },
                markers: _.concat(startDetections, stopDetections)
            }; // wrap for videojs-markers
        }
    }
    return timelineMarkers;
}

