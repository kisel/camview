import _ = require("lodash");
import { observer } from "mobx-react-lite";
import React = require("react");
import { Breadcrumb, BreadcrumbItem } from "react-bootstrap";
import { theLocation } from "../store/location";
import { thePathItemsStore } from "../store/pathitems";

export const CamPathBreadbrumb = observer(() => {
    const {currentPath} = thePathItemsStore;
    return (
        <Breadcrumb>
            <BreadcrumbItem onClick={() => theLocation.change('/view/')}>
                Cameras
            </BreadcrumbItem>
            {_.map(currentPath, (k, idx) => {
                const linkPath = `/view/${currentPath.slice(0, idx + 1).join('/')}/`;
                return (
                    <BreadcrumbItem key={idx} onClick={() => theLocation.change(linkPath)}>
                        {currentPath[idx]}
                    </BreadcrumbItem>
                )
            })}
        </Breadcrumb>
    );
});

