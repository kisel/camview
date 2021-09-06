import React = require("react");
import { observer } from "mobx-react-lite";
import { CameraGridPage, } from "../components/cam_grid";
import { CamVideoPlayerPage, CameraRealtime } from "../components/cam_player";
import {Switch, Route, Redirect} from "react-router-dom";
import { RealtimeMultiCamPage } from "./multicam";
import { ViewPage } from "./view_page";
import { ScrollLayout } from "../layout/scroll_layout";
import { FullVPLayout } from "../layout/fullvp_layout";


export const AppRouter = observer(() => {
    return (
        <Switch>
            <Route path="/multicam">
                <FullVPLayout theme="dark">
                    <RealtimeMultiCamPage />
                </FullVPLayout>
            </Route>

            <Route path="/view/:cam/:date/:hour/:file">
                <FullVPLayout>
                    <CamVideoPlayerPage />
                </FullVPLayout>
            </Route>

            <Route path="/online/:camId" children={({ match: { params: { camId } } }) =>
                <FullVPLayout theme="dark">
                    <CameraRealtime camId={camId} />
                </FullVPLayout>
            }/>

            <Route exact path="/view/">
                <ScrollLayout>
                    <ViewPage />
                </ScrollLayout>
            </Route>

            <Route path="/view/">
                <ScrollLayout>
                    <CameraGridPage />
                </ScrollLayout>
            </Route>

            <Route path="/">
                <Redirect to="/view/" />
            </Route>
        </Switch>
  );
});

