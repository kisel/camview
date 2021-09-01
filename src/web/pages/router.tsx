import React = require("react");
import { observer } from "mobx-react-lite";
import { CameraGrid, } from "../components/cam_grid";
import { CamVideoPlayer, CameraRealtime } from "../components/cam_player";
import { theLocation } from "../store/location";
import { autorun } from "mobx";
import { MainPage } from "./main_page";

export const AppRouter = observer(() => {
    const {path: locPath} = theLocation;
    if (locPath == '/') {
        return <MainPage/>
    } else if (/^[/]view[/].*mp4[/]/.test(locPath)) {
          return <CamVideoPlayer/>;
    } else if (/^[/]view[/].*/.test(locPath)) {
          return <CameraGrid/>;
    } else if (/^[/]online[/].*/.test(locPath)) {
          return <CameraRealtime camId={theLocation.camId}/>;
    } else {
        return <div>Not found</div>
    }
});

autorun(()=>{
    if (theLocation.path == '/') {
        theLocation.change('/view/')
    }
})