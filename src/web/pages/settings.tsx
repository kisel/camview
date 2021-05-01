import React = require("react");
import { observer } from "mobx-react-lite";
import { theSettingsStore } from "../store/settings";


export const SettingsPage = observer(() => {
    return (
        <div className="form-check">
            <input className="form-check-input" type="checkbox" checked={theSettingsStore.legacyMode} id="legacyModeCheckbox" onChange={
                ()=>{theSettingsStore.setLegacyMode(!theSettingsStore.legacyMode)}
            }/>
            <label className="form-check-label" htmlFor="legacyModeCheckbox">
                Enable legacy device support
            </label>
        </div>
    );
});
