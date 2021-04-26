import React = require("react");
import { observer } from "mobx-react-lite";
import {Container, Row} from "react-bootstrap"
import _ = require("lodash");
import { theLocation } from "../store/location";
import { thePathItemsStore } from "../store/pathitems";

export const CameraTimeline = observer(() => {
    const {subItems, currentPath} = thePathItemsStore;
    return (
        <Container className="clickable-cards">
            <Row>
            {_.map(subItems, k => {
                const newPath = [...currentPath, k].join('/');
                return (
                    <div className="col-4" key={k}>
                        <div className="card" onClick={() => theLocation.change(`/view/${newPath}/`)}>
                            <img className="card-img-top" src={`/api/thumbnail/${newPath}/`} />
                            <div className="card-body">
                                <p className="card-text">{k}</p>
                            </div>
                        </div>
                    </div>
                )
            })}
            </Row>
        </Container>
    );
});

export const CameraList = CameraTimeline;

