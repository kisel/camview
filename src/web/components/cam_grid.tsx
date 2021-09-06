import React = require("react");
import { observer } from "mobx-react-lite";
import {Row} from "react-bootstrap"
import _ = require("lodash");
import { queryOptions, urljoin } from "../utils/urljoin";
import { theSettings } from "../store/settings";
import { firstMotionOffsetSec } from "../../common/detector_utils";
import { useHistory, useLocation } from "react-router-dom";
import { Fetch } from "react-request";
import { ListResponse } from "../../common/models";
import { beautify } from "../utils/cam_utils";
const classNames = require("classnames")

// const svg_clock = require("@fortawesome/fontawesome-free/svgs/solid/clock.svg")
const svg_play = require("@fortawesome/fontawesome-free/svgs/solid/play-circle.svg")

interface CameraGridProps {
    currentPath: string[];
    currentPathInfo: ListResponse;
}
export const CameraGrid = observer(({currentPath, currentPathInfo}: CameraGridProps) => {
    const history = useHistory();
    const {favorite_time, show_all_video} = theSettings;
    const sz = Math.floor(12 / theSettings.cam_columns || 12)
    const colsClassName = classNames("cam-grid", `col-lg-${sz}`)
    const itemsToDisplay = _.map(_.zip(currentPathInfo.items, currentPathInfo.metadata), ([item, itemMeta]) => {
        const { name } = item;
        const motionDuration = itemMeta?.detector?.motion_seconds_total || 0
        console.log(motionDuration)
        const hasMotion = motionDuration > 0
        const motionStart = firstMotionOffsetSec(itemMeta?.detector)
        if ((itemMeta?.detector !== undefined) && (!show_all_video && motionDuration == 0)) {
            // hide items with detector active, but no movements by default
            return null;
        }
        const newPath = [...currentPath, name]
        const playerURL = urljoin('/view/', ...newPath, motionStart ? `/?time=${motionStart}`: '/');
        const imgQueryOpts = queryOptions(
            'resolution=thumbnail',
            `def_hour=${favorite_time}`,
            hasMotion && 'detector=1',
        )
        return (
            <div key={name} className={colsClassName}>
                <div className="card">
                    <a href={playerURL}>
                        <img className="card-img-top"
                            src={urljoin('/api/image/', ...newPath, `/?${imgQueryOpts}`)}
                        />
                    </a>
                    <div className="camera-card">
                        <span className="card-text">{beautify(name)}</span>
                        {hasMotion && <span className="card-text">motion {Math.ceil(motionDuration)}s at {Math.round(motionStart)}s</span>}
                        {currentPath.length == 0 && /* root camera choose grid */
                            <span>
                                <img src={svg_play} onClick={(e) => {
                                    history.push(`/online/${newPath[0]}`); e.stopPropagation();
                                }} />
                            </span>
                        }
                    </div>
                </div>
            </div>
        )
    }).filter(v => v !== null);

    return (
        <div className="clickable-cards">
            {_.isEmpty(itemsToDisplay) &&
                <div> {`Displaying videos: ${_.size(itemsToDisplay)} / ${_.size(currentPathInfo.items)}`} </div>
            }
            <Row>
                {itemsToDisplay}
            </Row>
        </div>
    );
});

export const CameraGridPage = observer(() => {
    const location = useLocation();
    const absLoc = location.pathname.split('/').slice(2, -1); // strip /view/ and /$
    const infourl = urljoin('/api/list/', ...absLoc, '/');
    // only request subitems if not displaying a file
    return (
        <Fetch url={infourl} children={({ fetching, failed, data }) => {
            if (fetching) {
                return <div>Loading...</div>;
            }

            if (failed) {
                return <div>Whoops</div>;
            }

            if (data) {
                return (
                    <CameraGrid currentPath={absLoc} currentPathInfo={data}/>
                );
            }
    }} />
    );
});
