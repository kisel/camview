import _ = require("lodash");
import { observer } from "mobx-react-lite";
import React = require("react");
import { useHistory, useLocation } from "react-router-dom";
import { theAppState } from "../store/state";
import { urljoin } from "../utils/urljoin";
import { SettingsMenu } from "./settings_menu";
const classNames = require("classnames")

export const CamPathBreadbrumb = observer((props: {theme?: "light"|"dark"}) => {
    const history = useHistory();
    const location = useLocation();
    const currentPath = location.pathname.split('/').slice(2, -1); // strip /view/ and /$
    const pathLinks = [
        {label: "Cameras", link: '/view/'},
        ..._.map(currentPath, (label, idx) => ({
            label: label,
            link: urljoin('/view/', ...currentPath.slice(0, idx + 1), '/'),
        }))
    ];
    const theme = props.theme || "light";
    return (
        <nav className={`navbar sticky-top navbar-expand-sm navbar-${theme} bg-${theme}`}>
            <button className="navbar-toggler" type="button"
                data-toggle="collapse" data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"
                onClick={() => theAppState.toggleNav()}
            >
                <span className="navbar-toggler-icon"></span>
            </button>
            {/* <a className="navbar-brand" href="#">Camview</a> */}

            <div className={classNames("navbar-collapse", { "collapse": !theAppState.expandedNav })} id="navbarSupportedContent">
                <div className="navbar-nav me-auto mb-2 mb-lg-0">

                    {_.map(pathLinks, (k, idx) => {
                        return (
                            <a key={idx} className="nav-link" aria-current="page" onClick={() => history.push(k.link)}>
                                {k.label}
                            </a>
                        )
                    })}
                </div>

                <span className="dropdown dropstart">
                    <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Settings
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                        <SettingsMenu />
                    </ul>
                </span>

            </div>
        </nav>
    );
});

