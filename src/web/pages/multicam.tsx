import React = require("react");
import { observer } from "mobx-react-lite";
import { Fetch } from "react-request";
import { ListResponse } from "../../common/models";
import { Col, Container, Row } from "react-bootstrap";
import _ = require("lodash");
import VideoPlayer from "../components/videoplayer";
import "./../components/multicam.css"
import { CamPathBreadbrumb } from "../components/breadcrumb";


const CameraFeed = observer(({camId}: {camId: string}) => {
    const videoURL = `/api/streams/data/${camId}/s.m3u8`
    return (
        <VideoPlayer muted {...{
            className: "multicam-video-feed",
            autoplay: true,
            controls: true,
            // responsive: true, //
            errorDisplay: false,
            preload: 'auto',
            fill: true,
            // html5: {},
            sources: [
                { src: videoURL, type: 'application/x-mpegURL' }
            ]
        }} />
    );
});

const RealtimeMultiCam = observer(({items}: ListResponse) => {
    return (
        <div className="multicam-screen">
            <CamPathBreadbrumb theme="dark"/>
            <div className="multicam-content container-fluid">
            <Row>
            {_.map(items, ({name}) => {
                const videoURL = `/api/streams/data/${name}/s.m3u8`
                return (
                        <VideoPlayer key={name} muted {...{
                            className: "col-lg-4",
                            autoplay: true,
                            controls: true,
                            // responsive: true, //
                            errorDisplay: false,
                            preload: 'auto',
                            fill: true,
                            // html5: {},
                            sources: [
                                { src: videoURL, type: 'application/x-mpegURL' }
                            ]
                        }} />
                )
            })}
            </Row>
            </div>
        </div>
    );
});

export const RealtimeMultiCamPage = observer(() => {
    return (
        <Fetch url="/api/list" children={({ fetching, failed, data }) => {
            if (fetching) {
                return <div>Loading...</div>;
            }

            if (failed) {
                return <div>Whoops</div>;
            }

            if (data) {
                return (
                    <RealtimeMultiCam items={data.items}/>
                );
            }
    }} />
    );
});
