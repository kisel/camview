import React = require("react");
import { observer } from "mobx-react-lite";
import { CameraGrid } from "../components/cam_grid";
import { CamVideoPlayer } from "../components/cam_player";
import { theLocation } from "../store/location";

export const AppRouter = observer(() => {
    if (theLocation.path == '/') {
        theLocation.change('/view/')
    } else if (/^[/]view[/].*mp4[/]/.test(theLocation.path)) {
          return <CamVideoPlayer/>;
    } else if (/^[/]view[/].*/.test(theLocation.path)) {
          return <CameraGrid/>;
    } else {
        return <div>Not found</div>
    }
});
