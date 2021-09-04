import _ = require("lodash");
import { observer } from "mobx-react-lite";
import React = require("react");
import { Fetch } from "react-request";
import { useHistory, useLocation } from "react-router-dom";
import { ListItem } from "../../common/models";
import { theAppState } from "../store/state";
import { urljoin } from "../utils/urljoin";
import { SettingsMenu } from "./settings_menu";
import "./breadcrumb.css"
import { beautify } from "../utils/cam_utils";
const classNames = require("classnames")

interface PathInfo {
    label: string
    absPath: string[]
    currentPath: string[]
}
function buildViewUrl(path: string[]) {
    return _.join(['/view', ...path], '/') + '/';
}

// replace corresponding part of path
function buildUrl(item: PathInfo, dropdownItem: ListItem) {
    const pos = item.absPath.length;
    const newPath = [...item.currentPath]
    newPath[pos - 1] = dropdownItem.name
    return buildViewUrl(newPath)
}

export const LiveMainPath = observer(() => {
    const history = useHistory();
    const dropdownItems = [
        {label: 'Timeline', url: '/view/'},
        {label: 'Multicam', url: '/multicam'},
    ]
    return (
        <div className="nav-item dropdown">
            <a className="nav-link  dropdown-toggle" data-bs-toggle="dropdown" onClick={() => history.push(`/view/`)}>
                CamView
            </a>
            <div className="dropdown-menu">
                <ul>
                    {dropdownItems.map(({ label, url }) => (
                        <li key={label}><a onClick={() => history.push(url)}>{label}</a></li>
                    ))}
                </ul>
            </div>
        </div>
    )
});

export const LivePath = observer(({item}: {item: PathInfo}) => {
    const history = useHistory();
    return (
        <div className="nav-item dropdown">
            <a className="nav-link  dropdown-toggle" data-bs-toggle="dropdown" onClick={() => history.push(buildViewUrl(item.absPath))}>
                {beautify(item.label)}
            </a>
            <Fetch url={_.join(['/api/list', ...item.absPath.slice(0, -1)], '/')} children={({ data }) => {
                const items: ListItem[] = data?.items || [];
                return (
                    <div className="dropdown-menu">
                        <ul className={classNames({multicolumn:_.size(items) > 10})}>
                        {_.map(items, (dropdownItem, idx) => (
                            <li key={idx}><a onClick={() => history.push(buildUrl(item, dropdownItem))}>{beautify(dropdownItem.name)}</a></li>
                        ))}
                        </ul>
                    </div>
                )
            }} />
        </div>
    )
});

const BreadbrumbLivePathItems = observer(() => {
    const location = useLocation();
    const currentPath = location.pathname.split('/').slice(2, -1); // strip /view/ and /$
    const pathLinks: PathInfo[] = [
        ..._.map(currentPath, (label, idx) => ({
            label: label,
            currentPath,
            absPath: currentPath.slice(0, idx + 1),
        }))
    ];
    return (<>
        {_.map(pathLinks, (k, idx) => <LivePath key={idx} item={k} />)}
    </>)
});

export const CamPathBreadbrumb = observer((props: {theme?: "light"|"dark"}) => {
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

            <div className={classNames("navbar-collapse", { "collapse": !theAppState.expandedNav })} id="navbarSupportedContent">
                <div className="navbar-nav me-auto mb-2 mb-lg-0">
                    <LiveMainPath/>
                    <BreadbrumbLivePathItems />
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

