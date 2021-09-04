import React = require("react");
import { observer } from "mobx-react-lite";
import { CameraGridPage, } from "../components/cam_grid";
import { CamVideoPlayerPage, CameraRealtime } from "../components/cam_player";
import {Switch, Route, Redirect} from "react-router-dom";
import { RealtimeMultiCamPage } from "./multicam";
import { CamPathBreadbrumb } from "../components/breadcrumb";
import { theSettings } from "../store/settings";
import { ViewPage } from "./view_page";

export const AppRouter = observer(() => {
    return (
        <Switch>
            <Route path="/multicam">
                <RealtimeMultiCamPage />
            </Route>
            <Route path="/">
                <div className={theSettings.with_borders ? "container" : "container-fluid"}>
                    <CamPathBreadbrumb />
                    <Switch>
                        <Route exact path="/view/">
                            <ViewPage/>
                        </Route>
                        <Route path="/view/" children={({ location: { pathname: url } }) => {
                            if (/^[/]view[/].*mp4[/]/.test(url)) {
                                return <CamVideoPlayerPage />;
                            } else if (/^[/]view[/].*/.test(url)) {
                                return <CameraGridPage />;
                            }
                        }} />
                        <Route path="/online/:camId" children={({ match: { params: { camId } } }) =>
                            <CameraRealtime camId={camId} />
                        } />
                        <Route path="/">
                            <Redirect to="/view/" />
                        </Route>
                    </Switch>
                </div>
            </Route>
        </Switch>
  );
});

