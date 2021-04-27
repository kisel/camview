import React = require("react");
import { observer } from "mobx-react-lite";
import {Row} from "react-bootstrap"
import _ = require("lodash");
import { theLocation } from "../store/location";
import { thePathItemsStore } from "../store/pathitems";
import { urljoin } from "../utils/urljoin";

export const CameraGrid = observer(() => {
    const {subItems, currentPath} = thePathItemsStore;
    return (
        <div className="clickable-cards">
            <Row>
            {_.map(subItems, k => {
                const newPath = [...currentPath, k]
                return (
                    <div className="col-lg-4" key={k}>
                        <div className="card" onClick={() => theLocation.change(urljoin('/view/', ...newPath, '/'))}>
                            <img className="card-img-top" src={urljoin('/api/thumbnail/', ...newPath, '/')} />
                            <div className="card-body">
                                <p className="card-text">{k}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
            </Row>
        </div>
    );
});
