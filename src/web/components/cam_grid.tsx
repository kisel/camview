import React = require("react");
import { observer } from "mobx-react-lite";
import {Row} from "react-bootstrap"
import _ = require("lodash");
import { theLocation } from "../store/location";
import { thePathItemsStore } from "../store/pathitems";
import { urljoin } from "../utils/urljoin";
import { theSettings } from "../store/settings";

function beautify(label: string) {

    //cam-1244-1626973290.mp4
    const mFN = label.match(/^cam-(\d\d)(\d\d)-\d{10}[.].*/)
    if (mFN) {
        return `${mFN[1]}:${mFN[2]}`
    }

    const mHH = label.match(/^(\d\d)$/)
    if (mHH) {
        return `${mHH[1]}:--`
    }
    return label;
}

export const CameraGrid = observer(() => {
    const {subItems, currentPath} = thePathItemsStore;
    const sz = Math.floor(12 / theSettings.cam_columns || 12)
    const colsClassName = `col-lg-${sz}`
    return (
        <div className="clickable-cards">
            <Row>
            {_.map(subItems, k => {
                const newPath = [...currentPath, k]
                const playerURL = urljoin('/view/', ...newPath, '/');
                return (
                    <div className={colsClassName} key={k}>
                        <a href={playerURL} onClick={() => theLocation.change(playerURL)}>
                            <div className="card">
                                <img className="card-img-top" src={urljoin('/api/image/', ...newPath, '/?resolution=thumbnail')} />
                                <div className="card-body">
                                    <p className="card-text">{beautify(k)}</p>
                                </div>
                            </div>
                        </a>
                    </div>
                )
            })}
            </Row>
        </div>
    );
});
