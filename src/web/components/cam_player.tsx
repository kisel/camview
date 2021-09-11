
import React = require("react");
import { observer } from "mobx-react-lite";
import _ = require("lodash");
import { theSettingsStore } from "../store/settings";
import {VideoPlayer} from "./videoplayer";

import "./player.css"
import { Fetch } from "react-request";
import { CamFileMetadata, ListResponse } from "../../common/models";
import { useLocation } from "react-router-dom";
import { useQuery } from "../utils/router_utils";
import { MarkersPluginOptions } from "./videojs_markers";
import { urljoin } from "../utils/urljoin";
import { camFilenameMatchingHHMM } from "../../common/cam_filenames";

interface CamVideoPlayerProps {
    videoURL: string
    timelineMarkers?: MarkersPluginOptions
    startTime?: number;
}
const CamVideoPlayerVideoJS = observer(({videoURL, timelineMarkers, startTime}: CamVideoPlayerProps) => {
    return (
        <VideoPlayer {...{
            key: videoURL, // remount when URL changes
            className: "video-container",
            autoplay: true,
            controls: true,
            responsive: true, //
            fill: true,
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
                timelineMarkers,
                startTime,
                showShare: "time"
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
            key: videoURL, // remount when URL changes
            className: "video-container",
            autoplay: true,
            controls: true,
            fill: true,
            responsive: true, //
            errorDisplay: false,
            preload: 'auto',
            // html5: {},
            sources: [
                { src: videoURL, type: 'application/x-mpegURL' }
            ],
            camview: {
                onVideoClick: "toggle_fullscreen"
            },
        }} />
    );
});


export const CamVideoPlayer = observer((props: CamVideoPlayerProps) => {
    return (theSettingsStore.settings.native_player)
        ? <CamVideoPlayerLegacy  {...props} />
        : <CamVideoPlayerVideoJS {...props} />
})

interface CamVideoPlayerCompProps {
    absLoc: string[]
    startTime?: number
}

export const CamVideoPlayerComp = observer((props: CamVideoPlayerCompProps) => {
    const [camname, date, hour, fn] = props.absLoc;
    const videoPath = [camname, date, hour, fn].join('/');
    const vformat = (theSettingsStore.settings.legacy_mode) ? 'mp4-legacy' : 'mp4'

    const videoURL = ['/api/video', vformat, videoPath].join('/')
    const detectorURL = ['/api/detector/result', videoPath.replace(/[.](mp4|ts)/, '.json')].join('/');
    return (
      <Fetch key={videoURL} url={detectorURL} children={({ fetching, failed, data }) => {
            if (fetching || (!failed && data === null)) {
                return <div>Loading...</div>;
            }
            const detectorRes: CamFileMetadata = data;
            let timelineMarkers = buildVideoMarkers(detectorRes);
            const playerProps = {
                videoURL,
                timelineMarkers,
                startTime: props.startTime,
            }

            return <CamVideoPlayer {...playerProps} />
    }} />
    );
})

export const CamVideoPlayerPage = observer(() => {
    const loc = useLocation();

    const absLoc = loc.pathname.split('/').slice(2, -1); // strip /view/ and /$
    const startTime = parseFloat(useQuery().get('time')) || undefined;
    const [camname, date, hour, fn] = absLoc;
    const childProps = { absLoc, startTime };

    if (fn && fn.match(/^\d\d$/)) {
        const parentPath = absLoc.slice(0, 3)
        const parentListFilesUrl = urljoin('/api/list/', ...parentPath, '/');
        return (
            <Fetch url={parentListFilesUrl} children={({ failed, data }: {failed: boolean, data: ListResponse}) => {
                if (failed) {
                    return <div>Whoops</div>;
                }
                if (data == null) {
                    return <div>Loading...</div>;
                } else {
                    const selHHMM = `${hour}${fn}`
                    const selectedVideoItem = _.find(data.items, (v) => (camFilenameMatchingHHMM(v.name, selHHMM)));
                    if (!selectedVideoItem) {
                        return <div>Nothing to show...</div>;
                    } else {
                        return (
                            <CamVideoPlayerComp {...{ ...childProps, absLoc: [...parentPath, selectedVideoItem.name]}} />
                        );
                    }
                }

            }} />
        );
    } else {
        return <CamVideoPlayerComp {...childProps} />
    }
})

function buildVideoMarkers(detectorRes: CamFileMetadata): MarkersPluginOptions {
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
