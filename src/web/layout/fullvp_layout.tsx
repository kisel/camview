import _ = require("lodash");
import { observer } from "mobx-react-lite";
import React = require("react");
import { CamPathBreadbrumb } from "../components/breadcrumb";
import "./fullvp_layout.css"

interface FullVPLayoutProps {
    theme?: "light" | "dark"
    children: React.ReactNode;
}
export const FullVPLayout = observer((props: FullVPLayoutProps) => {
    return (
        <div className="fullvp">
            <CamPathBreadbrumb theme={props.theme}/>
            {props.children}
        </div>
    );
});
