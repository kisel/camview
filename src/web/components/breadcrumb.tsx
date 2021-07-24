import _ = require("lodash");
import { observer } from "mobx-react-lite";
import React = require("react");
import { Breadcrumb, BreadcrumbItem } from "react-bootstrap";
import { SettingsPage } from "../pages/settings";
import { theLocation } from "../store/location";
import { thePathItemsStore } from "../store/pathitems";
import { theAppState } from "../store/state";
import { urljoin } from "../utils/urljoin";
import { SettingsMenu } from "./settings_menu";

export const CamPathBreadbrumb = observer(() => {
    const {currentPath} = thePathItemsStore;
    const pathLinks = [
        {label: "Cameras", link: '/view/'},
        ..._.map(currentPath, (label, idx) => ({
            label: label,
            link: urljoin('/view/', ...currentPath.slice(0, idx + 1), '/'),
        }))
    ];
    return (
        <nav className="navbar sticky-top navbar-expand-sm navbar-light bg-light">
            <div className="container-fluid">
                {/* <a className="navbar-brand" href="#">Camview</a> */}

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">

                        {_.map(pathLinks, (k, idx) => {
                            return (
                                <li key={idx} className="nav-item">
                                    <a className="nav-link" aria-current="page" onClick={() => theLocation.change(k.link)}>
                                        {k.label}
                                    </a>
                                </li>
                            )
                        })}
                    </ul>

                    <span className="dropdown dropstart">
                        <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Settings
                        </a>
                        <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                            <SettingsMenu />
                        </ul>
                    </span>

                </div>
            </div>
        </nav>
    );
});

