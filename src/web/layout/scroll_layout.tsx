import { observer } from "mobx-react-lite";
import React = require("react");
import { CamPathBreadbrumb } from "../components/breadcrumb";
import { theSettings } from "../store/settings";

// non-viewport height aware layout
export const ScrollLayout = observer(({children}) => {
    return (
        <div className={theSettings.with_borders ? "container" : "container-fluid"}>
            <CamPathBreadbrumb />
            {children}
        </div>
    );
});
