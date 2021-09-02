import React = require("react");
import { observer } from "mobx-react-lite";
import {Row} from "react-bootstrap"
import _ = require("lodash");
import { theSettings } from "../store/settings";
import { useHistory } from "react-router-dom";
import { CameraGridPage } from "../components/cam_grid";
const classNames = require("classnames")

const svg_tv = require("@fortawesome/fontawesome-free/svgs/solid/tv.svg")

const ExtraItems = observer(() => {
    const history = useHistory();
    const sz = Math.floor(12 / theSettings.cam_columns || 12)
    const colsClassName = classNames("cam-grid", `col-lg-${sz}`)
    return (
        <div className="clickable-cards">
            <Row>
                <div className={colsClassName}>
                    <div className="card card-svg-icon">
                        <a href="/multicam">
                            <img className="card-img-top" src={svg_tv} />
                        </a>
                        <div className="camera-card">
                            <span className="card-text">{"All cameras"}</span>
                        </div>
                    </div>
                </div>
            </Row>
        </div>
    );
});

export const ViewPage = observer(() => (
    <div>
        <CameraGridPage/>
        <ExtraItems/>
    </div>
));
