import React = require("react");
import { observer } from "mobx-react-lite";
import {Row} from "react-bootstrap"
import _ = require("lodash");
import { theLocation } from "../store/location";
import { thePathItemsStore } from "../store/pathitems";
import { urljoin } from "../utils/urljoin";
import { theSettings } from "../store/settings";
import { firstMotionOffsetSec } from "../../common/detector_utils";

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
    let {currentPath, currentPathInfo} = thePathItemsStore;
    const {favorite_time, show_all_video} = theSettings;
    const sz = Math.floor(12 / theSettings.cam_columns || 12)
    const colsClassName = `col-lg-${sz}`
    currentPath = thePathItemsStore.currentPath
    return (
        <div className="clickable-cards">
            <Row>
            {_.map(_.zip(currentPathInfo.items, currentPathInfo.metadata), ([item, itemMeta]) => {
                const {name} = item;
                const motionDuration = itemMeta?.detector?.motion_seconds_total || undefined
                const motionStart = firstMotionOffsetSec(itemMeta?.detector)
                if ((itemMeta?.detector !== undefined) && (!show_all_video && !motionDuration)) {
                    // hide items with detector active, but no movements by default
                    return null;
                }
                const newPath = [...currentPath, name]
                const playerURL = urljoin('/view/', ...newPath, '/');
                return (
                    <div key={name} className={colsClassName}>
                        <div className="card">
                            <a href={playerURL}>
                                <img className="card-img-top"
                                    src={urljoin('/api/image/', ...newPath, `/?resolution=thumbnail&favourite_time=${favorite_time}`)}
                                    onClick={() => theLocation.change(playerURL)}
                                />
                            </a>
                            <div className="card-body camera-card">
                                <span className="card-text">{beautify(name)}</span>
                                {motionDuration && <span className="card-text">motion {Math.ceil(motionDuration)}s at {motionStart || '?'}</span>}
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
