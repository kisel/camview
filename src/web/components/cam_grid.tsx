import React = require("react");
import { observer } from "mobx-react-lite";
import {Row} from "react-bootstrap"
import _ = require("lodash");
import { theLocation } from "../store/location";
import { thePathItemsStore } from "../store/pathitems";
import { urljoin } from "../utils/urljoin";
import { theSettings } from "../store/settings";

// const svg_clock = require("@fortawesome/fontawesome-free/svgs/solid/clock.svg")
const svg_play = require("@fortawesome/fontawesome-free/svgs/solid/play-circle.svg")

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
    let {subItems, currentPath} = thePathItemsStore;
    const sz = Math.floor(12 / theSettings.cam_columns || 12)
    const colsClassName = `col-lg-${sz}`
    currentPath = thePathItemsStore.currentPath
    return (
        <div className="clickable-cards">
            <Row>
            {_.map(subItems, k => {
                const newPath = [...currentPath, k]
                const playerURL = urljoin('/view/', ...newPath, '/');
                return (
                    <div key={k} className={colsClassName}>
                        <div className="card">
                            <a href={playerURL}>
                                <img className="card-img-top"
                                    src={urljoin('/api/image/', ...newPath, '/?resolution=thumbnail')}
                                    onClick={() => theLocation.change(playerURL)}
                                />
                            </a>
                            <div className="card-body camera-card">
                                <span className="card-text">{beautify(k)}</span>
                                {currentPath.length == 0 && /* root camera choose grid */
                                    <span>
                                        {/* <img src={svg_clock}`)} /> */}
                                        <img src={svg_play} onClick={(e) => {
                                            theLocation.change(`/online/${newPath[0]}`); e.stopPropagation();
                                        }} />
                                    </span>
                                }
                            </div>
                        </div>
                    </div>
                )
            })}
            </Row>
        </div>
    );
});
