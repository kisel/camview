
import React = require("react");
import { observer } from "mobx-react-lite";
import _ = require("lodash");
import { theLocation } from "../store/location";

export const CamVideoPlayer = observer(() => {
    const absLoc = theLocation.path.split('/').slice(2, -1); // strip /view/ and /$
    const videoPath = absLoc.join('/');
    const videoURL = `/api/mp4/${videoPath}`
    return (
        <div className="video-player">
            <video className="video-fluid" autoPlay controls width="100%">
                <source src={videoURL} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
});
